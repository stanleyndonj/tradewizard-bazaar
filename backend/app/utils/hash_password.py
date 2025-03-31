
import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plain text password to hash.
        
    Returns:
        The hashed password as a string.
    """
    # Generate a salt and hash the password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    
    # Return the hashed password as a string
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: The plain text password to check.
        hashed_password: The hashed password to check against.
        
    Returns:
        True if the password matches the hash, False otherwise.
    """
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    
    # Check if the passwords match
    return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
