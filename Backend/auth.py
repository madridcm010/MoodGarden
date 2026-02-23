from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)


# Fake in-memory database
fake_users_db = {}

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_user(username: str, password: str):
    if username in fake_users_db:
        return False  # user already exists

    fake_users_db[username] = {
        "username": username,
        "password": hash_password(password)
    }
    return True

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return True