"""Main entry point for the Team COLLO FastAPI application.

This module initializes the FastAPI service, configures Cross-Origin
Resource Sharing (CORS) to communicate with the local Vite frontend,
and provides initial root and health status endpoints with live database checks.
"""

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.routers import auth_router
from app.routers.projects import router as projects_router
from app.routers.tasks import router as tasks_router
from app.routers.users import router as users_router

# Initialize FastAPI application with informative metadata
app = FastAPI(
    title="Team COLLO API",
    description="Backend API for Team COLLO - AI-powered intelligent team formation and collaboration platform",
    version="1.0.0",
)

# ------------------------------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) Configuration
# ------------------------------------------------------------------------------
# Allow the Vite frontend running locally to make API requests without
# browser security policy restrictions.
origins = list(
    set(
        [
            "http://localhost:5173",  # Default local Vite development server
            "http://127.0.0.1:5173",  # Loopback IP format for Vite
            "http://localhost:4173",  # Vite preview
            "http://127.0.0.1:4173",
        ]
        + settings.cors_origins_list
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)

# ------------------------------------------------------------------------------
# Routers
# ------------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(users_router)
# ------------------------------------------------------------------------------
# Core Endpoints
# ------------------------------------------------------------------------------
@app.get("/", tags=["General"])
async def root():
    """Root endpoint verifying API availability and basic service information."""
    return {
        "message": "Team COLLO API is running",
        "version": "1.0.0",
    }


@app.get(
    "/health",
    tags=["Health"],
    responses={
        200: {
            "description": "Service is healthy and database connectivity is verified",
            "content": {
                "application/json": {
                    "example": {"status": "healthy", "database": "connected"}
                }
            },
        },
        503: {
            "description": "Database is unavailable or connection check failed",
            "content": {
                "application/json": {
                    "example": {"detail": "Database connection unavailable"}
                }
            },
        },
    },
)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint verifying application uptime and database connectivity.

    Executes a 'SELECT 1' query on PostgreSQL to confirm the database session
    and connection pool are active and accepting commands.
    Returns HTTP 200 when connected, or HTTP 503 if the database is unavailable.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable",
        ) from exc
