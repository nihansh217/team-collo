
"""Pydantic schemas for Team COLLO task APIs."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class TaskCreate(BaseModel):
    """Data required to create a task."""

    project_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    category: Optional[str] = Field(default=None, max_length=50)
    due_date: Optional[datetime] = None
    assignee_ids: list[uuid.UUID] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    """Data allowed when updating an existing task."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=50)
    due_date: Optional[datetime] = None
    assignee_ids: Optional[list[uuid.UUID]] = None


class TaskAssigneeResponse(BaseModel):
    """Basic user information for a task assignment."""

    id: uuid.UUID
    full_name: str
    email: str
    initials: Optional[str] = None
    avatar_color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TaskAssignmentResponse(BaseModel):
    """Assignment information returned with a task."""

    id: uuid.UUID
    user_id: uuid.UUID
    user: TaskAssigneeResponse

    model_config = ConfigDict(from_attributes=True)


class TaskResponse(BaseModel):
    """Task information returned by the API."""

    id: uuid.UUID
    project_id: uuid.UUID
    created_by_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    category: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    assignments: list[TaskAssignmentResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
