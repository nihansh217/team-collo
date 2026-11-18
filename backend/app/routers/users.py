
"""Users API router for Team COLLO."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserProfileResponse
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/",
    response_model=list[UserProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all active users",
)
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[UserProfileResponse]:
    """Return all active registered users."""

    users = (
        db.query(User)
        .filter(User.is_active.is_(True))
        .order_by(User.full_name.asc())
        .all()
    )

    return users
