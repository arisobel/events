from fastapi.testclient import TestClient


def test_login_success(client: TestClient, active_user) -> None:
    response = client.post(
        "/auth/login",
        data={"username": active_user.f_username, "password": "admin123"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["refresh_token"]


def test_login_invalid_credentials(client: TestClient, active_user) -> None:
    response = client.post(
        "/auth/login",
        data={"username": active_user.f_username, "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


def test_protected_endpoint_without_token(client: TestClient) -> None:
    response = client.get("/hotels")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

