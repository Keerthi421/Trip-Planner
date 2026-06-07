from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..schemas.auth import UserCreate, UserOut, Token
from ..services.auth_service import (
    authenticate_user,
    create_user,
    create_access_token,
    get_user_by_email,
    get_user_by_username,
)
from ..api.deps import get_current_user
from ..models.user import User
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_email = get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    existing_username = get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    user = create_user(db, user_data)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    user_out = UserOut.model_validate(user)
    return Token(access_token=access_token, token_type="bearer", user=user_out)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    user_out = UserOut.model_validate(user)
    return Token(access_token=access_token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(get_current_user)):
    access_token = create_access_token(
        data={"sub": current_user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    user_out = UserOut.model_validate(current_user)
    return Token(access_token=access_token, token_type="bearer", user=user_out)
