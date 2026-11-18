"""API route handlers and controllers package.

Modular APIRouters for auth, users, projects, tasks, chat, and
matching recommendations.
"""

from app.routers.auth import router as auth_router

__all__ = ["auth_router"]
