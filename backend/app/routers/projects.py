"""Project management API router for Team COLLO."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


# --------------------------------------------------
# GET ALL PROJECTS
# --------------------------------------------------

@router.get(
    "",
    response_model=list[ProjectResponse],
    summary="Get all projects belonging to the user",
)
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Project)
        .filter(
            (Project.owner_id == current_user.id)
            | Project.members.any(user_id=current_user.id)
        )
        .order_by(Project.created_at.desc())
        .all()
    )


# --------------------------------------------------
# CREATE PROJECT
# --------------------------------------------------

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        **payload.model_dump(),
        owner_id=current_user.id,
    )

    try:
        db.add(project)
        db.commit()
        db.refresh(project)

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A project with this slug already exists.",
        ) from exc

    return project


# --------------------------------------------------
# GET PROJECT BY ID
# --------------------------------------------------

@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get project details",
)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            (
                (Project.owner_id == current_user.id)
                | Project.members.any(user_id=current_user.id)
            ),
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    return project


# --------------------------------------------------
# UPDATE PROJECT
# --------------------------------------------------

@router.patch(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update an existing project",
)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found or you are not the project owner.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(project, field, value)

    try:
        db.commit()
        db.refresh(project)

    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Project update conflicts with existing data.",
        ) from exc

    return project


# --------------------------------------------------
# DELETE PROJECT
# --------------------------------------------------

@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project",
)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found or you are not the project owner.",
        )

    db.delete(project)
    db.commit()

    return None
    