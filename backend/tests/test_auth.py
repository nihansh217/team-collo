"""Unit and integration tests for Team COLLO authentication endpoints.

Covers:
- POST /auth/register (successful registration, input validation, duplicate handling, no hash leakage)
- POST /auth/login (valid credentials, incorrect password, nonexistent user)
- GET /auth/me (valid bearer token, missing token, malformed token, expired token)
- Root and health connectivity preservation
"""

from datetime import timedelta
import pytest
from fastapi.testclient import TestClient

from app.services.auth import create_access_token


def test_core_endpoints_preserved(client: TestClient):
    """Verify existing root and health endpoints remain intact and operational."""
    root_resp = client.get("/")
    assert root_resp.status_code == 200
    assert root_resp.json()["message"] == "Team COLLO API is running"

    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "healthy"
    assert health_resp.json()["database"] == "connected"


def test_register_student_success(client: TestClient):
    """Register a new student user and verify safe profile output."""
    payload = {
        "name": "Maya Lin",
        "email": "maya.lin@university.edu",
        "password": "SecurePassword123!",
        "department": "Computer Science",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["email"] == "maya.lin@university.edu"
    assert data["full_name"] == "Maya Lin"
    assert data["role"] == "student"
    assert data["initials"] == "ML"
    assert data["avatar_color"] == "violet"
    assert data["department"] == "Computer Science"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data

    # Verify sensitive password hashes are NEVER exposed
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_with_full_name_and_skills(client: TestClient):
    """Register using the full_name field and optional skills."""
    payload = {
        "full_name": "Devon Vance",
        "email": "devon.vance@university.edu",
        "password": "StrongPassword456!",
        "skills": ["Python", "FastAPI", "React"],
        "bio": "CS junior interested in distributed systems.",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["full_name"] == "Devon Vance"
    assert data["skills"] == ["Python", "FastAPI", "React"]
    assert data["bio"] == "CS junior interested in distributed systems."
    assert "hashed_password" not in data


def test_register_input_validation(client: TestClient):
    """Reject registration requests with invalid input."""
    # Invalid email format
    resp1 = client.post(
        "/auth/register",
        json={"name": "Alex", "email": "not-an-email", "password": "ValidPassword123!"},
    )
    assert resp1.status_code == 422

    # Password too short (< 8 characters)
    resp2 = client.post(
        "/auth/register",
        json={"name": "Alex", "email": "alex@university.edu", "password": "short"},
    )
    assert resp2.status_code == 422

    # Empty name
    resp3 = client.post(
        "/auth/register",
        json={"name": "   ", "email": "alex2@university.edu", "password": "ValidPassword123!"},
    )
    assert resp3.status_code == 422


def test_register_duplicate_email_rejected(client: TestClient):
    """Reject duplicate registrations with HTTP 409 Conflict."""
    payload = {
        "name": "Taylor Swift",
        "email": "taylor@collo.edu",
        "password": "Password12345!",
    }
    # First registration succeeds
    resp1 = client.post("/auth/register", json=payload)
    assert resp1.status_code == 201

    # Second registration with exact same email fails
    resp2 = client.post("/auth/register", json=payload)
    assert resp2.status_code == 409
    assert "already exists" in resp2.json()["detail"]

    # Registration with uppercase variant of email also fails
    dup_upper = {
        "name": "Taylor S",
        "email": "TAYLOR@collo.edu",
        "password": "DifferentPassword999!",
    }
    resp3 = client.post("/auth/register", json=dup_upper)
    assert resp3.status_code == 409


def test_login_success(client: TestClient):
    """Authenticate with valid email and password and receive a valid JWT token."""
    reg_payload = {
        "name": "Jordan Lee",
        "email": "jordan.lee@university.edu",
        "password": "MySecretPassword123!",
    }
    reg_resp = client.post("/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201

    login_payload = {
        "email": "jordan.lee@university.edu",
        "password": "MySecretPassword123!",
    }
    login_resp = client.post("/auth/login", json=login_payload)
    assert login_resp.status_code == 200

    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["email"] == "jordan.lee@university.edu"
    assert token_data["user"]["full_name"] == "Jordan Lee"
    assert "hashed_password" not in token_data["user"]


def test_login_invalid_credentials(client: TestClient):
    """Reject login attempts with incorrect password or nonexistent email."""
    reg_payload = {
        "name": "Sam Carter",
        "email": "sam.carter@university.edu",
        "password": "CorrectPassword123!",
    }
    client.post("/auth/register", json=reg_payload)

    # Wrong password
    wrong_pwd_resp = client.post(
        "/auth/login",
        json={"email": "sam.carter@university.edu", "password": "WrongPassword!"},
    )
    assert wrong_pwd_resp.status_code == 401
    assert "Invalid email or password" in wrong_pwd_resp.json()["detail"]

    # Nonexistent email
    non_existent_resp = client.post(
        "/auth/login",
        json={"email": "nobody@university.edu", "password": "AnyPassword123!"},
    )
    assert non_existent_resp.status_code == 401
    assert "Invalid email or password" in non_existent_resp.json()["detail"]


def test_get_me_authenticated(client: TestClient):
    """Access GET /auth/me using a valid bearer token."""
    reg_payload = {
        "name": "Riley Morgan",
        "email": "riley.m@university.edu",
        "password": "PasswordForRiley123!",
        "department": "Biomedical Engineering",
    }
    client.post("/auth/register", json=reg_payload)

    login_resp = client.post(
        "/auth/login",
        json={"email": "riley.m@university.edu", "password": "PasswordForRiley123!"},
    )
    token = login_resp.json()["access_token"]

    # Request /auth/me with Bearer token
    me_resp = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "riley.m@university.edu"
    assert profile["full_name"] == "Riley Morgan"
    assert profile["department"] == "Biomedical Engineering"
    assert "hashed_password" not in profile


def test_get_me_unauthorized_and_invalid_tokens(client: TestClient):
    """Verify GET /auth/me rejects missing, malformed, or expired tokens."""
    # Missing Authorization header
    resp_no_auth = client.get("/auth/me")
    assert resp_no_auth.status_code == 401

    # Malformed token
    resp_invalid = client.get("/auth/me", headers={"Authorization": "Bearer bad.token.here"})
    assert resp_invalid.status_code == 401

    # Expired token
    reg_payload = {
        "name": "Expired Test",
        "email": "expired@collo.edu",
        "password": "Password123456!",
    }
    reg_resp = client.post("/auth/register", json=reg_payload)
    user_id = reg_resp.json()["id"]

    # Generate an already expired token (1 hour in the past)
    expired_token = create_access_token(
        subject=user_id,
        expires_delta=timedelta(hours=-1),
    )
    resp_expired = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert resp_expired.status_code == 401
    assert "expired" in resp_expired.json()["detail"].lower()

