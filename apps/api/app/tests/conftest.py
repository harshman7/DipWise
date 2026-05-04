import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 — register metadata
from app.core.database import Base, get_db
from app.main import app


@pytest.fixture(autouse=True)
def _simple_password_hashing(monkeypatch):
    """Avoid bcrypt backend quirks in CI / mixed passlib-bcrypt versions."""

    def hash_password(password: str) -> str:
        return f"test:{password}"

    def verify_password(plain: str, hashed: str) -> bool:
        return hashed == f"test:{plain}"

    monkeypatch.setattr("app.services.user_service.hash_password", hash_password)
    monkeypatch.setattr("app.services.user_service.verify_password", verify_password)


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
