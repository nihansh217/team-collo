"""Database configuration and connection session management for Team COLLO.

This module initializes the SQLAlchemy 2.x synchronous engine using psycopg 3,
configures the session factory (SessionLocal), declares the ORM Base class,
and provides the get_db dependency for route-level session management.
"""

import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ------------------------------------------------------------------------------
# Environment and Connection String Configuration
# ------------------------------------------------------------------------------
# Load environment variables from backend/.env if present
env_file = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_file)

# Local development URL compatible with Postgres.app (no password required by default)
DEFAULT_DATABASE_URL = "postgresql+psycopg://localhost:5432/teamcollo"
raw_database_url = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL)

# Normalize standard postgresql:// and postgres:// schemes to use psycopg 3 driver
if raw_database_url.startswith("postgresql://"):
    DATABASE_URL = raw_database_url.replace("postgresql://", "postgresql+psycopg://", 1)
elif raw_database_url.startswith("postgres://"):
    DATABASE_URL = raw_database_url.replace("postgres://", "postgresql+psycopg://", 1)
else:
    DATABASE_URL = raw_database_url

# ------------------------------------------------------------------------------
# SQLAlchemy Engine Initialization
# ------------------------------------------------------------------------------
# Synchronous engine using psycopg 3
# pool_pre_ping=True validates connection health before handing it out of the pool
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "False").lower() in ("true", "1", "t"),
    pool_pre_ping=True,
)

# ------------------------------------------------------------------------------
# Database Session Factory
# ------------------------------------------------------------------------------
# SessionLocal generates new Session instances for requests
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


# ------------------------------------------------------------------------------
# Declarative Base Model
# ------------------------------------------------------------------------------
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy 2.x ORM models in Team COLLO."""

    pass


# ------------------------------------------------------------------------------
# FastAPI Database Dependency
# ------------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a SQLAlchemy database session per request.

    Guarantees session cleanup by closing the session in a finally block,
    ensuring connections return to the pool even if an error is raised.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
