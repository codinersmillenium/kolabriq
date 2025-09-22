from uuid import uuid4
from datetime import datetime, timezone

from uagents import Context, Agent, Model
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    TextContent,
)

from protocols.protocols import protocol, process_query
 
from utils.identity import generate_ed25519_identity

### Example Expert Assistant
 
## This chat example is a barebones example of how you can create a simple chat agent
## and connect to agentverse. In this example we will be prompting the ASI:One model to
## answer questions on a specific subject only. This acts as a simple placeholder for
## a more complete agentic system.
##
 
# the subject that this assistant is an expert in
agent_name = "Kolabriq"
 
agent = Agent(
    name=agent_name,
    seed="qwerty1",
    port=8001,
    mailbox=True,
    publish_agent_details=True,
    # endpoint=["http://127.0.0.1:8001/submit"],
)

class Request(Model):
    sender: str
    text: str

class Response(Model):
    response: str

@agent.on_rest_post("/chat", Request, Response)
async def handle_post(ctx: Context, req: Request) -> Response:
    ctx.sender = req.sender

    identities = ctx.storage.get("identity") or []
    if not isinstance(identities, list):
        identities = [identities]

    already_exists = any(
        isinstance(item, dict) and item.get("sender") == req.sender
        for item in identities
    )

    if not already_exists:
        ctx.logger.info(f"Identity already exists for {req.sender}")
        identity = generate_ed25519_identity()
        identity.update({
            "sender": req.sender
        })

        identities.append(identity)
        ctx.storage.set("identity", identities)

    response_text = await process_query(req.text, ctx)
    ctx.logger.info(f"Response text: {response_text}")

    return Response(
        response = response_text,
    )
 
# attach the protocol to the agent
agent.include(protocol, publish_manifest=True)
 
if __name__ == "__main__":
    agent.run()
    