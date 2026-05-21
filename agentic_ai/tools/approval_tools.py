
from mcp_instance import mcp

import requests


@mcp.tool()
def create_approval(
    ticket_id: str,
    approver_employee_id: str
):

    response = requests.post(

        "http://localhost:5000/approvals",

        json={
            "ticketId": ticket_id,
            "approverEmployeeId":
                approver_employee_id
        }

    )

    return response.json()