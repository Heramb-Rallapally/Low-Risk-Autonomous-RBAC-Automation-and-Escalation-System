from langgraph.graph import (
    StateGraph,
    START,
    END
)

from typing import TypedDict

# =========================================
# STATE
# =========================================

class RBACState(TypedDict):

    # INPUT REQUEST
    requester_employee_id: str
    resource_name: str
    requested_access: str
    business_justification: str
    duration_days: int

    # CONTEXT
    user_data: dict
    resource_data: dict
    policy_data: dict

    # ANALYSIS
    risk_score: int
    compliance_status: str

    # FINAL DECISION
    decision: str
    decision_reason: str

    # APPROVAL
    approval_required: bool
    approval_status: str

    # DEBUGGING
    tool_history: list
    errors: list


# =========================================
# NODE 1
# CONTEXT AGENT
# =========================================

async def context_agent(state: RBACState):

    print("\n[CONTEXT AGENT]\n")

    # MCP TOOL CALLS

    user_data = await lookup_user(
        state["requester_employee_id"]
    )

    resource_data = await fetch_resource(
        state["resource_name"]
    )

    policy_data = await fetch_policy(
        state["resource_name"]
    )

    return {

        "user_data": user_data,

        "resource_data": resource_data,

        "policy_data": policy_data

    }


# =========================================
# NODE 2
# RISK AGENT
# =========================================

async def risk_agent(state: RBACState):

    print("\n[RISK AGENT]\n")

    risk_score = 20

    # EXAMPLE RISK LOGIC

    if state["requested_access"] == "admin":

        risk_score += 50

    if (
        state["resource_data"]
        .get("sensitivityLevel")
        == "critical"
    ):

        risk_score += 30

    return {

        "risk_score": risk_score

    }


# =========================================
# NODE 3
# COMPLIANCE AGENT
# =========================================

async def compliance_agent(state: RBACState):

    print("\n[COMPLIANCE AGENT]\n")

    department = (
        state["user_data"]
        .get("department")
    )

    allowed_departments = (
        state["policy_data"]
        .get("allowedDepartments", [])
    )

    requested_access = (
        state["requested_access"]
    )

    allowed_access = (
        state["policy_data"]
        .get("allowedAccessLevels", [])
    )

    compliant = (
        department in allowed_departments
        and
        requested_access in allowed_access
    )

    return {

        "compliance_status":
            "COMPLIANT"
            if compliant
            else "NON_COMPLIANT"

    }


# =========================================
# NODE 4
# DECISION AGENT
# =========================================

async def decision_agent(state: RBACState):

    print("\n[DECISION AGENT]\n")

    risk_score = state["risk_score"]

    compliance = state["compliance_status"]

    decision = "APPROVE"

    reason = "Policy compliant"

    if compliance == "NON_COMPLIANT":

        decision = "REJECT"

        reason = "Policy violation"

    elif risk_score >= 70:

        decision = "ESCALATE"

        reason = "High-risk access request"

    return {

        "decision": decision,

        "decision_reason": reason,

        "approval_required":
            decision == "ESCALATE"

    }


# =========================================
# NODE 5
# APPROVAL AGENT
# =========================================

async def approval_agent(state: RBACState):

    print("\n[APPROVAL AGENT]\n")

    approval = await create_approval(

        ticket_id=
            f"TKT-{state['requester_employee_id']}",

        approver_employee_id=
            "ADMIN-001"

    )

    history = state.get(
        "tool_history",
        []
    )

    history.append({

        "tool": "create_approval",

        "result": approval

    })

    return {

        "approval_status":
            "PENDING_APPROVAL",

        "tool_history": history

    }


# =========================================
# ROUTER
# =========================================

def route_decision(state: RBACState):

    if state["approval_required"]:

        return "approval_agent"

    return END


# =========================================
# GRAPH
# =========================================

graph = StateGraph(RBACState)

graph.add_node(
    "context_agent",
    context_agent
)

graph.add_node(
    "risk_agent",
    risk_agent
)

graph.add_node(
    "compliance_agent",
    compliance_agent
)

graph.add_node(
    "decision_agent",
    decision_agent
)

graph.add_node(
    "approval_agent",
    approval_agent
)


# =========================================
# FLOW
# =========================================

graph.add_edge(
    START,
    "context_agent"
)

graph.add_edge(
    "context_agent",
    "risk_agent"
)

graph.add_edge(
    "risk_agent",
    "compliance_agent"
)

graph.add_edge(
    "compliance_agent",
    "decision_agent"
)

graph.add_conditional_edges(
    "decision_agent",
    route_decision
)

graph.add_edge(
    "approval_agent",
    END
)


# =========================================
# COMPILE
# =========================================

workflow = graph.compile()