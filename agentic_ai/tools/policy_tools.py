from mcp_instance import mcp

import requests


@mcp.tool()
def fetch_policy(resource_name: str):

    response = requests.get(
        f"http://localhost:5000/policies/{resource_name}"
    )

    return response.json()