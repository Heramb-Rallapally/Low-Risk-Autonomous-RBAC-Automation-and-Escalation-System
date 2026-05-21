import asyncio
import json
from typing import TypedDict
from dotenv import load_dotenv

from langgraph.graph import StateGraph, START, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, ToolMessage

# MCP IMPORTS
from mcp import StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.session import ClientSession
from langchain_mcp_adapters.tools import load_mcp_tools

load_dotenv()

class RBACState(TypedDict):
    # Original request
    requester_employee_id: str
    resource_name: str
    requested_access: str
    business_justification: str
    duration_days: int

    # Retrieved context
    user_data: dict
    resource_data: dict
    policy_data: dict

    # Agent reasoning outputs
    risk_score: int
    decision: str
    decision_reason: str

    # Approval workflow
    approval_required: bool
    approval_status: str

    # Execution metadata
    tool_history: list
    errors: list


async def run_mcp_workflow(initial_state: dict):
    
    # 1. CONFIGURE MCP SERVER PARAMETERS (Runs the FastMCP server as a subprocess over stdio)
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_server.py"]
    )

    print("\n[INFO] Starting MCP Client & connecting to FastMCP Server...")

    # 2. START MCP SESSION
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            print("[INFO] MCP Session Initialized.")
            
            # LOAD TOOLS DYNAMICALLY VIA MCP
            mcp_tools = await load_mcp_tools(session)
            print(f"[INFO] Loaded tools from MCP Server: {[t.name for t in mcp_tools]}")
            
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                temperature=1.5,
                max_tokens=None,
                timeout=None,
                max_retries=2,
            )
            
            llm_with_tools = llm.bind_tools(mcp_tools)

            # ==========================================
            # DEFINE GRAPH NODES INSIDE SESSION CONTEXT
            # ==========================================
            async def rbac_agent(state: RBACState):
                print("\n========== RBAC AGENT NODE ==========\n")

                prompt = f"""
                You are an enterprise RBAC governance agent.

                Your job:
                1. ALWAYS look up the user details first using the lookup_user tool.
                2. Retrieve required enterprise context (resource and policy details).
                3. Evaluate access requests using the context.
                4. Determine whether the request should be: APPROVE, REJECT, or ESCALATE.

                Escalate:
                - admin access
                - critical production resources
                - policy violations
                - if you encounter internal API errors

                Request Details:
                requester_employee_id: {state["requester_employee_id"]}
                resource_name: {state["resource_name"]}
                requested_access: {state["requested_access"]}
                business_justification: {state["business_justification"]}
                duration_days: {state["duration_days"]}
                """

                messages = [HumanMessage(content=prompt)]
                max_iterations = 5
                iterations = 0

                while iterations < max_iterations:
                    iterations += 1
                    response = await llm_with_tools.ainvoke(messages)
                    messages.append(response)

                    if not response.tool_calls:
                        if isinstance(response.content, str):
                            final_response = response.content
                        elif isinstance(response.content, list):
                            text_parts = [str(item["text"]) for item in response.content if isinstance(item, dict) and "text" in item]
                            final_response = " ".join(text_parts)
                        else:
                            final_response = str(response.content)

                        print("\n========== FINAL DECISION ==========\n")
                        print(final_response)

                        content_upper = str(final_response).upper()
                        if "ESCALATE" in content_upper: decision = "ESCALATE"
                        elif "REJECT" in content_upper: decision = "REJECT"
                        elif "APPROVE" in content_upper: decision = "APPROVE"
                        else: decision = "ESCALATE"

                        return {
                            "tool_history": state.get("tool_history", []),
                            "decision": decision,
                            "decision_reason": final_response,
                            "approval_required": decision == "ESCALATE"
                        }

                    for tool_call in response.tool_calls:
                        tool_name = tool_call["name"]
                        tool_args = tool_call["args"]
                        tool_call_id = tool_call["id"]

                        print(f"\n[TOOL CALLED VIA MCP]: {tool_name} with ARGS: {tool_args}")

                        # Find matching LangChain MCP tool
                        selected_tool = next((t for t in mcp_tools if t.name == tool_name), None)

                        if selected_tool:
                            # Invoke asynchronously against the MCP server!
                            tool_result = await selected_tool.ainvoke(tool_args)
                        else:
                            tool_result = {"error": f"Tool {tool_name} not found"}

                        print("\n[TOOL RESULT]:", tool_result)

                        history = state.get("tool_history", [])
                        history.append({"tool": tool_name, "args": tool_args, "result": tool_result})
                        state["tool_history"] = history

                        messages.append(ToolMessage(content=json.dumps(tool_result), tool_call_id=tool_call_id))

                print("\n========== MAX ITERATIONS REACHED ==========\n")
                return {
                    "tool_history": state.get("tool_history", []),
                    "decision": "ESCALATE",
                    "decision_reason": "Agent exceeded maximum tool iteration limit.",
                    "approval_required": True
                }

            async def decision_node(state: RBACState):
                print("\n[DECISION NODE]\n")
                decision = state.get("decision", "ESCALATE")
                print(f"Decision evaluated: {decision}")
                return {"approval_required": decision == "ESCALATE"}

            def route_decision(state: RBACState):
                if state.get("approval_required"): return "approval_node"
                return END

            async def approval_node(state: RBACState):
                print("\n[APPROVAL NODE]\n")
                ticket_id = f"TKT-{state.get('requester_employee_id', '000')}"
                approver_id = "ADMIN-001"
                
                print(f"Executing create_approval via MCP for Ticket: {ticket_id}")
                
                 # Locate tool from the MCP Server adapter
                create_approval_tool = next((t for t in mcp_tools if t.name == "create_approval"), None)
                
                if create_approval_tool:
                    tool_result = await create_approval_tool.ainvoke({
                        "ticket_id": ticket_id,
                        "approver_employee_id": approver_id
                    })
                else:
                    tool_result = {"error": "create_approval tool missing from MCP server"}
                
                history = state.get("tool_history", [])
                history.append({
                    "tool": "create_approval",
                    "args": {"ticket_id": ticket_id, "approver_employee_id": approver_id},
                    "result": tool_result
                })
                
                return {
                    "approval_status": "PENDING_APPROVAL",
                    "tool_history": history
                }

            # ==========================================
            # COMPILE AND RUN THE GRAPH
            # ==========================================
            graph = StateGraph(RBACState)
            graph.add_node("RBAC_agent", rbac_agent)
            graph.add_node("decision_node", decision_node)
            graph.add_node("approval_node", approval_node)

            graph.add_edge(START, "RBAC_agent")
            graph.add_edge("RBAC_agent", "decision_node")
            graph.add_conditional_edges("decision_node", route_decision)
            graph.add_edge("approval_node", END)

            workflow = graph.compile()
            
            final_state = await workflow.ainvoke(initial_state)
            return final_state


if __name__ == "__main__":
    initial_state = {

    "requester_employee_id": "EMP1008",

    "resource_name": "product_jira_workspace",

    "requested_access": "read",

    "business_justification":
        "Need access for sprint planning tasks",

    "duration_days": 5,


    # RETRIEVED CONTEXT
    "user_data": {},

    "resource_data": {},

    "policy_data": {},


    # AGENT OUTPUTS
    "risk_score": 0,

    "decision": "",

    "decision_reason": "",


    # APPROVAL WORKFLOW
    "approval_required": False,

    "approval_status": "",


    # EXECUTION METADATA
    "tool_history": [],

    "errors": []

}

    # Run the event loop
    final_output = asyncio.run(run_mcp_workflow(initial_state))
    
    print("\n========== FINAL GRAPH STATE ==========\n")
    print(json.dumps(final_output, indent=2))