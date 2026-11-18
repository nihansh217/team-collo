"""Pydantic schemas for Team COLLO project APIs."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class ProjectCreate(BaseModel):
    """Data required to create a project."""

    name: str = Field(..., min_length=1, max_length=150)
    slug: Optional[str] = Field(default=None, max_length=150)
    eyebrow: Optional[str] = Field(default=None, max_length=100)
    summary: Optional[str] = None
    color: Optional[str] = Field(default="#6d5dfb", max_length=30)
    status: str = "on_track"
    progress: int = Field(default=0, ge=0, le=100)
    health_score: int = Field(default=100, ge=0, le=100)
    milestone_name: Optional[str] = Field(default=None, max_length=100)
    milestone_date: Optional[datetime] = None
    due_date: Optional[datetime] = None


class ProjectUpdate(BaseModel):
    """Data allowed when updating an existing project."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    slug: Optional[str] = Field(default=None, max_length=150)
    eyebrow: Optional[str] = Field(default=None, max_length=100)
    summary: Optional[str] = None
    color: Optional[str] = Field(default=None, max_length=30)
    status: Optional[str] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    health_score: Optional[int] = Field(default=None, ge=0, le=100)
    milestone_name: Optional[str] = Field(default=None, max_length=100)
    milestone_date: Optional[datetime] = None
    due_date: Optional[datetime] = None


class ProjectResponse(BaseModel):
    """Project information returned by the API."""

    id: uuid.UUID
    name: str
    slug: Optional[str] = None
    eyebrow: Optional[str] = None
    summary: Optional[str] = None
    color: Optional[str] = None
    status: str
    progress: int
    health_score: int
    owner_id: uuid.UUID
    milestone_name: Optional[str] = None
    milestone_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    