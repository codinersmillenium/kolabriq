from decimal import Decimal

def get_address_amount(raw_payload: any) -> list:
    result = []

    if not raw_payload:
        return result
    
    entries = raw_payload.split(",")
    for entry in entries:
        if ":" in entry:
            address, amount = entry.split(":", 1)
            result.append({
                "address": address.strip(),
                "amount": Decimal(amount.strip())
            })

    return result
    
def set_confirmation_msg(args: any, fee: int) -> str:
    transactions = get_address_amount(args.get("addressAmount", ""))
    
    confirmation_text = (
        "We have prepared the following ICP transfers for you:\n\n"
    )

    # List all transactions
    for tx in transactions:
        confirmation_text += f"- **{tx['amount']} ICP** sent to `{tx['address']}`\n"

    confirmation_text += (
        "\nPlease review the details carefully before confirming.\n"
        "⚠️ Once confirmed, the transfers cannot be reversed.\n\n"
        "- Network: Internet Computer (ICP)\n"
        "- Estimated confirmations: ~3 blocks (~20–30 seconds)\n"
        f"- Network fee: {fee} ICP per transaction (deducted automatically)\n\n"
        "To proceed, type 'yes'. To cancel, type anything else."
    )

    return confirmation_text
    