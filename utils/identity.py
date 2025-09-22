import base64, hashlib, struct, zlib, re, binascii
from cryptography.hazmat.primitives.asymmetric import ed25519, ec
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_der_private_key, Encoding, PrivateFormat, NoEncryption
from ic.identity import Identity
from ic.principal import Principal
from typing import Dict, Any, Optional

def text_encode_principal(principal_bytes: bytes) -> str:
    crc = zlib.crc32(principal_bytes) & 0xFFFFFFFF
    data = struct.pack(">I", crc) + principal_bytes  # CRC32 big-endian
    b32 = base64.b32encode(data).decode("ascii").lower().rstrip("=")
    return "-".join(b32[i:i+5] for i in range(0, len(b32), 5))

def principal_from_der_pubkey(der_pubkey: bytes) -> str:
    body = b"\x02" + hashlib.sha224(der_pubkey).digest()
    return text_encode_principal(body)

def _normalize_privkey_to_hex(priv_key: str) -> str:
    """Accept private key in forms of:
    - hex (direct)
    - PEM (with header) PKCS8
    - base64 body from PEM PKCS8 (without header)
    and return 32-byte hex (Ed25519 Raw).
    """
    s = (priv_key or "").strip()
    # If already a valid hex
    if re.fullmatch(r"[0-9a-fA-F]+", s) and len(s) % 2 == 0:
        return s.lower()
    # If the string contains a PEM header
    if "-----BEGIN" in s:
        key = load_pem_private_key(s.encode("utf-8"), password=None)
        # Ed25519 private key: export raw 32 bytes
        if isinstance(key, ed25519.Ed25519PrivateKey):
            raw = key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
            return raw.hex()
        # EC private key (e.g., "BEGIN EC PRIVATE KEY"): derive integer d then 32-byte big-endian
        if isinstance(key, ec.EllipticCurvePrivateKey):
            d = key.private_numbers().private_value
            # 32 bytes for P-256/secp256k1; pad as needed
            raw32 = d.to_bytes(32, byteorder="big", signed=False)
            return raw32.hex()
        # Other key types unsupported
        raise ValueError("Unsupported PEM key type. Provide Ed25519 or EC private key.")
    # Try to assume base64 body (DER PKCS8)
    try:
        der = base64.b64decode(s)
        key = load_der_private_key(der, password=None)
        if isinstance(key, ed25519.Ed25519PrivateKey):
            raw = key.private_bytes(Encoding.Raw, PrivateFormat.Raw, NoEncryption())
            return raw.hex()
        if isinstance(key, ec.EllipticCurvePrivateKey):
            d = key.private_numbers().private_value
            raw32 = d.to_bytes(32, byteorder="big", signed=False)
            return raw32.hex()
        raise ValueError("Unsupported DER key type. Provide Ed25519 or EC private key.")
    except Exception:
        pass
    raise ValueError("Unsupported private key format. Provide hex, PEM, or base64 PKCS8 body.")

def principal_to_account_id(principal_str: str, subaccount: bytes = None) -> str:
    """Convert Principal string to Account ID for ICP Ledger"""
    
    if subaccount is None:
        subaccount = bytes([0] * 32)  # Default subaccount
    
    # Convert principal string to Principal object
    principal = Principal.from_str(principal_str)
    
    # Get principal bytes
    principal_bytes = principal.bytes
    
    # ICP standard: domain separator + principal + subaccount
    domain_separator = b'\x0Aaccount-id'
    data = domain_separator + principal_bytes + subaccount
    
    # SHA224 hash
    hash_result = hashlib.sha224(data).digest()
    
    # Add CRC32 checksum
    crc32 = binascii.crc32(hash_result) & 0xffffffff
    crc_bytes = crc32.to_bytes(4, 'big')
    
    # Final account ID: CRC32 + SHA224 hash = 32 bytes
    account_id_bytes = crc_bytes + hash_result
    
    return account_id_bytes.hex()

def generate_ed25519_identity():
    """Generate a complete Ed25519 identity for ICP"""
    # Generate Ed25519 private key
    sk = ed25519.Ed25519PrivateKey.generate()

    # Get PEM format
    priv_pem = sk.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    # Extract base64 body (without PEM headers)
    priv_b64 = "".join(l for l in priv_pem.splitlines() if not l.startswith("-----"))

    # Convert to hex format
    priv_hex = _normalize_privkey_to_hex(priv_b64)
    
    # Create identity
    ic_identity = Identity(privkey=priv_hex)
    der_pubkey, _ = ic_identity.sign(b"probe")
    str_principal = Principal.self_authenticating(der_pubkey).to_str()
    der_pubkey_b64 = base64.b64encode(der_pubkey).decode("ascii")
    ledger_account_id = principal_to_account_id(str_principal)

    # return str_principal, priv_b64, der_pubkey_b64, ledger_account_id

    return {
        'principal': str_principal,
        'private_key': priv_b64,
        'public_key': der_pubkey_b64,
        'account_id': ledger_account_id
    }
