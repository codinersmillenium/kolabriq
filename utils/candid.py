def unwrap_candid(value):
    v = value
    # Unwrap list/tuple satu elemen berulang kali
    while isinstance(v, (list, tuple)) and len(v) == 1:
        v = v[0]
    # Unwrap Result
    if isinstance(v, dict):
        # Normalize all keys to lowercase
        v_lower = {k.lower(): v[k] for k in v}

        if "ok" in v_lower:
            return v_lower["ok"]
        if "err" in v_lower:
            raise Exception(f"Canister returned error: {v_lower['err']}")

    return v

# Unwrap result from canister, if 'ok' return the value, otherwise raise an exception
def can_result(value):
    v = value
    
    # Unwrap list/tuple
    while isinstance(v, (list, tuple)) and len(v) == 1:
        v = v[0]

    # Unwrap result
    if isinstance(v, dict):
        # Normalize all keys to lowercase
        v_lower = {k.lower(): v[k] for k in v}

        if "ok" in v_lower:
            return v_lower["ok"]
        if "err" in v_lower:
            raise Exception(f"Canister returned error: {v_lower['err']}")

    return v


