"""Task and TaskAssignment ORM models.

Defines the Task entity for project deliverables and TaskAssignment for linking
team members to specific tasks.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
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
    from app.models.project import Project
    from app.models.user import User


class Task(Base):
    """Task entity representing a sprint deliverable or milestone work item.

    Attributes:
        id: Unique UUID primary key.
        project_id: Foreign key to parent project.
        created_by_id: Foreign key to user who created the task (nullable).
        title: Short title of the task.
        description: Detailed instructions and acceptance criteria.
        status: Workflow status (todo, in_progress, in_review, blocked, done).
        priority: Urgency level (low, medium, high, urgent).
        category: Domain grouping (Research, AI layer, Design, Content, Platform).
        due_date: Target deadline for task completion.
        created_at: Timezone-aware creation timestamp.
        updated_at: Timezone-aware update timestamp.
    """

    __tablename__ = "tasks"

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
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="todo",
        server_default="todo",
        index=True,
    )
    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
        server_default="medium",
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(50),
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
    project: Mapped[Project] = relationship(
        "Project",
        back_populates="tasks",
    )
    created_by: Mapped[Optional[User]] = relationship(
        "User",
        back_populates="created_tasks",
    )
    assignments: Mapped[list[TaskAssignment]] = relationship(
        "TaskAssignment",
        back_populates="task",
        cascade="all, delete-orphan",
    )


class TaskAssignment(Base):
    """Associative entity assigning users/members to specific tasks."""

    __tablename__ = "task_assignments"

    __table_args__ = (
        UniqueConstraint("task_id", "user_id", name="uq_task_assignment_task_user"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    task: Mapped[Task] = relationship(
        "Task",
        back_populates="assignments",
    )
    user: Mapped[User] = relationship(
        "User",
        back_populates="task_assignments",
    )
