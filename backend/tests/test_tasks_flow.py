from fastapi.testclient import TestClient

from .test_mvp_occupancy import create_hotel_event_and_room


def test_tasks_flow_still_works(client: TestClient, auth_headers: dict[str, str]) -> None:
    _, _, event_id = create_hotel_event_and_room(client, auth_headers)

    create_response = client.post(
        f"/events/{event_id}/tasks",
        json={
          "f_title": "Prepare conference hall",
          "f_description": "Set chairs and projector",
          "f_priority": "high",
          "f_task_type": "setup",
        },
        headers=auth_headers,
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    list_response = client.get(f"/events/{event_id}/tasks", headers=auth_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    update_response = client.put(
        f"/tasks/{task_id}/status",
        json={"new_status": "in_progress"},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["f_status"] == "in_progress"
