from __future__ import annotations

import secrets
import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from .database import connect, verify_password


SESSION_TTL_SECONDS = 86_400
router = APIRouter(prefix="/api/auth", tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)
sessions: dict[str, tuple[int, float]] = {}


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AuthUser(BaseModel):
    username: str


class LoginResponse(BaseModel):
    token: str
    user: AuthUser


def _invalid_credentials() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="invalid_credentials",
    )


def authenticate_credentials(username: str, password: str) -> tuple[int, str] | None:
    clean_username = username.strip()
    clean_password = password.strip()
    if not clean_username or not clean_password:
        return None

    connection = connect()
    try:
        row = connection.execute(
            "SELECT id, password_hash FROM users WHERE username = ?",
            (clean_username,),
        ).fetchone()
    finally:
        connection.close()

    if row is None or not verify_password(clean_password, row["password_hash"]):
        return None
    return row["id"], clean_username


def create_session(user_id: int, username: str) -> str:
    token = f"token-{username}-{secrets.token_urlsafe(32)}"
    sessions[token] = (user_id, time.time() + SESSION_TTL_SECONDS)
    return token


def get_current_user_id(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> int:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _invalid_credentials()

    session = sessions.get(credentials.credentials)
    if session is None:
        raise _invalid_credentials()

    user_id, expires_at = session
    if expires_at <= time.time():
        sessions.pop(credentials.credentials, None)
        raise _invalid_credentials()
    return user_id


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    authenticated = authenticate_credentials(payload.username, payload.password)
    if authenticated is None:
        raise _invalid_credentials()

    user_id, username = authenticated
    return LoginResponse(
        token=create_session(user_id, username),
        user=AuthUser(username=username),
    )


@router.get("/me", response_model=AuthUser)
async def current_user(
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> AuthUser:
    connection = connect()
    try:
        row = connection.execute(
            "SELECT username FROM users WHERE id = ?", (user_id,)
        ).fetchone()
    finally:
        connection.close()

    if row is None:
        raise _invalid_credentials()
    return AuthUser(username=row["username"])
