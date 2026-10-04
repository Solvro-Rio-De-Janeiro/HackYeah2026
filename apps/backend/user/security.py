import hashlib
import hmac
import secrets

_ALGORITHM = "pbkdf2_sha256"
_ITERATIONS = 390_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), _ITERATIONS
    )
    return f"{_ALGORITHM}${_ITERATIONS}${salt}${derived.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, hash_hex = password_hash.split("$")
    except ValueError:
        return False
    if algorithm != _ALGORITHM:
        return False
    derived = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt), int(iterations)
    )
    return hmac.compare_digest(derived.hex(), hash_hex)
