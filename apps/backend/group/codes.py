import secrets
import string

_ALPHABET = string.ascii_uppercase + string.digits
_CODE_LENGTH = 6


def generate_group_code() -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(_CODE_LENGTH))
