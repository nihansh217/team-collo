"""Project and ProjectMember ORM models.

Defines the Project entity for collaborative student capstones and research initiatives,
as well as ProjectMember for team membership and AI compatibility tracking.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.task import Task
    from app.models.user import User


class Project(Base):
    """Project entity representing a collaborative workspace.

    Attributes:
        id: Unique UUID primary key.
        name: Name of the project.
        slug: Short URL-friendly unique identifier.
        eyebrow: Category or badge text (e.g. 'CAPSTONE / PRODUCT STUDIO').
        summary: High-level overview of the project vision.
        color: Primary brand accent color in hex code.
        status: Progress state (planning, on_track, needs_attention, at_risk, completed, archived).
        progress: Completion percentage (0 to 100).
        health_score: AI health score assessment (0 to 100).
        owner_id: UUID of the project creator/lead.
        milestone_name: Title of current active milestone.
        milestone_date: Target deadline for current milestone.
        due_date: Final project submission or completion date.
        created_at: Timezone-aware creation timestamp.
        updated_at: Timezone-aware update timestamp.
    """

    __tablename__ = "projects"

    __table_args__ = (
        CheckConstraint("progress >= 0 AND progress <= 100", name="ck_project_progress_range"),
        CheckConstraint("health_score >= 0 AND health_score <= 100", name="ck_project_health_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
    )
    slug: Mapped[Optional[str]] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=True,
    )
    eyebrow: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    color: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
        default="#6d5dfb",
        server_default="#6d5dfb",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="on_track",
        server_default="on_track",
    )
    progress: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    health_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,
        server_default="100",
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    milestone_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    milestone_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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
    owner: Mapped[User] = relationship(
        "User",
        back_populates="owned_projects",
    )
    members: Mapped[list[ProjectMember]] = relationship(
        "ProjectMember",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[list[Task]] = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectMember(Base):
    """Membership association between users and projects.

    Enforces that a user can only join a given project once.
    """

    __tablename__ = "project_members"

    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="uq_project_member_project_user"),
        CheckConstraint(
            "fit_score IS NULL OR (fit_score >= 0 AND fit_score <= 100)",
            name="ck_project_member_fit_range",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="member",
        server_default="member",
    )
    fit_score: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    project: Mapped[Project] = relationship(
        "Project",
        back_populates="members",
    )
    user: Mapped[User] = relationship(
        "User",
        back_populates="project_memberships",
    )
