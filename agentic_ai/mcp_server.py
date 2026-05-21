from mcp_instance import mcp

# IMPORTANT:
# these imports REGISTER tools

import tools.user_tools
import tools.resource_tools
import tools.policy_tools
import tools.approval_tools


print("\n[INFO] MCP TOOLS REGISTERED\n")

print("\n[INFO] MCP Server Started\n")


mcp.run()