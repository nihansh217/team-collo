"""Authentication API router for Team COLLO.

Provides student registration, JWT-based login, and authenticated user profile inspection.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)
from app.services.auth import (
    create_access_token,
    generate_initials,
    get_current_user,
    hash_password,
    verify_password,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student user",
    description="Registers a student user with email, name, and secure hashed password.",
    responses={
        201: {"description": "User successfully registered"},
        400: {"description": "Invalid input data"},
        409: {"description": "User with this email already exists"},
    },
)
def register_user(
    payload: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Register a new student user.

    Validates inputs, securely hashes password, ensures email uniqueness,
    and creates the database record without returning password hashes.
    """
    # Check for existing email proactively
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    # Hash the password securely
    hashed = hash_password(payload.password)

    # Generate initials for avatar chip
    display_name = payload.full_name or payload.name or ""
    initials = generate_initials(display_name)

    user = User(
        email=payload.email,
        hashed_password=hashed,
        full_name=display_name,
        initials=initials,
        avatar_color="violet",
        role="student",
        department=payload.department,
        bio=payload.bio,
        skills=payload.skills or [],
        availability=payload.availability or "high",
        is_active=True,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        logger.warning("Integrity error during registration for %s: %s", payload.email, exc)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        ) from exc

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT token",
    description="Verifies user credentials and returns a signed bearer access token.",
    responses={
        200: {"description": "Authentication successful"},
        401: {"description": "Invalid email or password"},
        403: {"description": "Account is inactive"},
    },
)
def login_user(
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate user with email and password and return a signed JWT access token."""
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )

    access_token = create_access_token(
        subject=user.id,
        extra_claims={
            "email": user.email,
            "role": user.role,
        },
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
    description="Returns the safe profile of the user identified by the bearer JWT.",
    responses={
        200: {"description": "Current user profile"},
        401: {"description": "Missing, expired, or invalid bearer token"},
        403: {"description": "Account is inactive"},
    },
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserProfileResponse:
    """Return the profile for the currently authenticated user."""
    return current_user

