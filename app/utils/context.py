from uagents import Context

from utils.identity import principal_to_account_id

def get_private_key_for_sender(ctx: Context):
    identities = ctx.storage.get("identity") or []
    if not isinstance(identities, list):
        identities = [identities]
    for item in identities:
        if isinstance(item, dict) and item.get("sender") == ctx.sender:
            return item.get("private_key")
    return None

def get_principal_for_sender(ctx: Context):
    identities = ctx.storage.get("identity") or []
    if not isinstance(identities, list):
        identities = [identities]
    for item in identities:
        identitySender = item.get("sender") 
        if isinstance(item, dict) and identitySender == ctx.sender:
            if "agent" not in identitySender:
                return identitySender
            else:
                return item.get("principal")
    return None

def get_account_id_for_sender(ctx: Context):
    """Complete function: Get sender's Account ID for Ledger calls"""
    
    # Step 1: Get principal string from your storage
    principal_str = get_principal_for_sender(ctx)
    if not principal_str:
        print("No principal found for sender")
        return None
    
    # Step 2: Convert principal to account ID
    try:
        account_id = principal_to_account_id(principal_str)
        return account_id
    except Exception as e:
        print(f"Error converting principal to account ID: {e}")
        return None
