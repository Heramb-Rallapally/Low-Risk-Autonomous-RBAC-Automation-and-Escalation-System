from mcp_instance import mcp

import requests


@mcp.tool()
def fetch_resource(resource_name: str):

    response = requests.get(
        f"http://localhost:5000/resources/{resource_name}"
    )

    return response.json()