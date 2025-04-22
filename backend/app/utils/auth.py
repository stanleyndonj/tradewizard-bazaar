
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user_from_token(authorization: str = None):
    """
    Get the user ID from the token in the Authorization header.
    
    Args:
        authorization: The Authorization header value.
    
    Returns:
        The user ID if the token is valid, None otherwise.
    """
    if not authorization:
        return None
    
    try:
        # Extract token from 'Bearer {token}'
        if authorization.startswith('Bearer '):
            token = authorization.replace('Bearer ', '')
        else:
            token = authorization
            
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
            
        return user_id
    except JWTError:
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a new JWT access token.
    
    Args:
        data: The data to encode in the token.
        expires_delta: The time delta after which the token expires.
    
    Returns:
        The encoded JWT token.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt

async def get_user_from_token(authorization: str = Header(None)):
    """
    Get the user ID from the Authorization header token.
    
    Args:
        authorization: The Authorization header value.
    
    Returns:
        The user ID if the token is valid, None otherwise.
    """
    if not authorization:
        return None
    
    # Extract the token from the Authorization header
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
    except ValueError:
        # Authorization header value is not properly formatted
        return None
    
    # Verify the token and get the payload
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Extract the user ID from the payload
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        return user_id
    except JWTError:
        return None

async def get_admin_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """
    Get the admin user from the Authorization header token.
    
    Args:
        authorization: The Authorization header value.
        db: The database session.
    
    Returns:
        The admin user if the token is valid and the user is an admin, raises an exception otherwise.
    """
    # Get the user ID from the token
    user_id = await get_user_from_token(authorization)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the user from the database
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if the user is an admin
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized - admin access required"
        )
    
    return user
