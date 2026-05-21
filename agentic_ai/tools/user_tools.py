from mcp_instance import mcp

import requests


@mcp.tool()
def lookup_user(employee_id: str):

    response = requests.get(
        f"http://localhost:5000/users/{employee_id}"
    )

    return response.json()