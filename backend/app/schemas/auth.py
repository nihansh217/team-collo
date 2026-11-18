"""Authentication request and response schemas for Team COLLO."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserRegisterRequest(BaseModel):
    """Payload for registering a new student account."""

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Display name or full name of the user",
    )
    full_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Full name of the user (alternative to name)",
    )
    email: EmailStr = Field(
        ...,
        max_length=255,
        description="Unique email address",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain text password (minimum 8 characters)",
    )
    department: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Academic department or major",
    )
    bio: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Short student bio",
    )
    skills: Optional[List[str]] = Field(
        default_factory=list,
        description="Initial list of skills",
    )
    availability: Optional[str] = Field(
        default="high",
        max_length=20,
        description="Commitment availability (high, medium, low)",
    )

    @model_validator(mode="after")
    def validate_name_field(self) -> "UserRegisterRequest":
        """Ensure either name or full_name is present and normalize."""
        resolved = (self.full_name or self.name or "").strip()
        if not resolved:
            raise ValueError("Name or full_name is required and cannot be blank.")
        self.full_name = resolved
        self.name = resolved
        return self

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Strip whitespace and lowercase email."""
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        """Validate password meets basic security standards."""
        if len(v.strip()) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class UserLoginRequest(BaseModel):
    """Payload for user authentication."""

    email: EmailStr = Field(
        ...,
        description="Registered email address",
    )
    password: str = Field(
        ...,
        min_length=1,
        description="User password",
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Strip whitespace and lowercase email."""
        return v.strip().lower()


class UserProfileResponse(BaseModel):
    """Safe public/authenticated user profile response (never exposes password hashes)."""

    id: uuid.UUID
    email: str
    full_name: str
    initials: Optional[str] = None
    avatar_color: Optional[str] = None
    role: str
    department: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Bearer access token payload returned upon successful login."""

    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

