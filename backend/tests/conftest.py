"""Pytest fixtures for Team COLLO backend test suite."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.main import app


@pytest.fixture(scope="session")
def db_engine():
    """Provide the database engine for tests."""
    return engine


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Provide a database session wrapped in a transaction with savepoints.

    Any commits inside route handlers only commit the savepoint, and
    the outer transaction is rolled back after each test to guarantee no database pollution.
    """
    connection = db_engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session: Session):
    """FastAPI TestClient with overridden get_db yielding the isolated test session."""
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

