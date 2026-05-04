from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest) -> TokenResponse:
    """Register a new user account."""
    # TODO: persist user, hash password, return real token
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Registration not yet implemented")


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    """Authenticate and return a JWT."""
    # TODO: verify credentials, return real token
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Login not yet implemented")
