"""User ORM model module.

Defines the core User entity representing students, project leaders,
faculty mentors, and platform administrators.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, Boolean, DateTime, String, Text, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.notification import Notification
    from app.models.project import Project, ProjectMember
    from app.models.task import Task, TaskAssignment


class User(Base):
    """User account entity.

    Attributes:
        id: Unique UUID primary key.
        email: Unique verified email address.
        hashed_password: Password hash (nullable initially for separate auth setup).
        full_name: Display name of the user.
        initials: Short 2-letter initials for UI avatar chips.
        avatar_color: Visual theme color for avatar chips.
        role: Primary system role (student, project_leader, mentor, faculty, admin).
        department: Academic program, major, or department.
        bio: Student or faculty profile bio.
        skills: JSON list of skills (e.g. ['React', 'Python', 'UX Research']).
        availability: Commitment availability (high, medium, low, unavailable).
        is_active: Whether account is active.
        created_at: Timezone-aware creation timestamp.
        updated_at: Timezone-aware update timestamp.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    initials: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
    )
    avatar_color: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
        default="violet",
        server_default="violet",
    )
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="student",
        server_default="student",
    )
    department: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    bio: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    skills: Mapped[Optional[list[str]]] = mapped_column(
        JSON,
        nullable=True,
        default=list,
        server_default="[]",
    )
    availability: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="high",
        server_default="high",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owned_projects: Mapped[list[Project]] = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    project_memberships: Mapped[list[ProjectMember]] = relationship(
        "ProjectMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    task_assignments: Mapped[list[TaskAssignment]] = relationship(
        "TaskAssignment",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    created_tasks: Mapped[list[Task]] = relationship(
        "Task",
        back_populates="created_by",
    )
    notifications: Mapped[list[Notification]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
