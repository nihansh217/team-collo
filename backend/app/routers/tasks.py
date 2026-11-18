
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.auth import get_current_user
from app.models.task import TaskAssignment
router = APIRouter(prefix="/tasks", tags=["Tasks"])


def get_accessible_project(
    project_id: UUID,
    current_user: User,
    db: Session,
):
    """Check whether the current user can access a project."""

    project = db.query(Project).filter(
        Project.id == project_id,
        (
            (Project.owner_id == current_user.id)
            | Project.members.any(user_id=current_user.id)
        ),
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    return project

def validate_assignees(assignee_ids: list[UUID], db: Session):
    """Check that all selected assignees are active registered users."""

    unique_ids = set(assignee_ids)

    if not unique_ids:
        return []

    users = (
        db.query(User)
        .filter(
            User.id.in_(unique_ids),
            User.is_active.is_(True),
        )
        .all()
    )

    if len(users) != len(unique_ids):
        raise HTTPException(
            status_code=400,
            detail="One or more selected users do not exist or are inactive",
        )

    return users

@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks belonging to an accessible project."""

    get_accessible_project(project_id, current_user, db)

    return (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.created_at.desc())
        .all()
    )


@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_accessible_project(payload.project_id, current_user, db)

    # Validate selected users
    users = validate_assignees(payload.assignee_ids, db)

    # Create the task without the assignee_ids field
    task_data = payload.model_dump(exclude={"assignee_ids"})
    task = Task(**task_data, created_by_id=current_user.id)

    db.add(task)
    db.flush()

    # Save task assignments
    for user in users:
        assignment = TaskAssignment(
            task_id=task.id,
            user_id=user.id,
        )
        db.add(assignment)

    db.commit()
    db.refresh(task)

    return task

@router.patch("/{task_id}", response_model=TaskResponse)

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    get_accessible_project(task.project_id, current_user, db)

    updates = payload.model_dump(
        exclude_unset=True,
        exclude={"assignee_ids"},
    )

    for field, value in updates.items():
        setattr(task, field, value)

    # Update assignments only when assignee_ids was provided
    if payload.assignee_ids is not None:
        users = validate_assignees(payload.assignee_ids, db)

        # Remove previous assignments
        task.assignments.clear()

        # Add the newly selected users
        for user in users:
            task.assignments.append(
                TaskAssignment(user_id=user.id)
            )

    db.commit()
    db.refresh(task)

    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an existing task."""

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    get_accessible_project(task.project_id, current_user, db)

    db.delete(task)
    db.commit()

    return None
