from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import models
import schemas
from database import get_db 

from datetime import timedelta
from security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

# 1. Setup the router and password hashing tool
router = APIRouter(tags=["Authentication"])

@router.get("/users/search", response_model=list[schemas.UserPublicSchema])
def search_users(q: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.User).filter(
        models.User.username.ilike(f"%{q}%"),
        models.User.id != current_user.id
    ).limit(10).all()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper function to hash passwords
def get_password_hash(password: str):
    return pwd_context.hash(password)

# 2. The Register Endpoint
# Notice we use response_model=schemas.UserResponse to ensure we NEVER return the password
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # Check if a user with this email or username already exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    # Hash the password
    hashed_pw = get_password_hash(user.password)

    # Create the new user object using the hashed password
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw
    )

    # Save to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Refreshes the object so it now contains the auto-generated ID

    # Return the new user (FastAPI will filter it through UserResponse automatically)
    return new_user

# Helper function to verify a password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):

    user = db.query(models.User).filter(
        models.User.email == user_credentials.email
    ).first()

    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")

    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=403, detail="Invalid Credentials")

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user