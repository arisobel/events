from fastapi.testclient import TestClient


def create_hotel_event_and_room(client: TestClient, auth_headers: dict[str, str]) -> tuple[int, int, int]:
    hotel_response = client.post(
        "/hotels",
        json={
            "f_name": "Grand Palace",
            "f_city": "Miami",
            "f_state": "FL",
            "f_country": "USA",
        },
        headers=auth_headers,
    )
    assert hotel_response.status_code == 201
    hotel_id = hotel_response.json()["id"]

    room_response = client.post(
        f"/hotels/{hotel_id}/rooms",
        json={
            "f_room_number": "214",
            "f_room_type": "family",
            "f_capacity": 4,
        },
        headers=auth_headers,
    )
    assert room_response.status_code == 201
    room_id = room_response.json()["id"]

    event_response = client.post(
        "/events",
        json={
            "f_hotel_id": hotel_id,
            "f_name": "Pessach 2026",
            "f_event_type": "holiday",
            "f_start_date": "2026-04-01",
            "f_end_date": "2026-04-10",
        },
        headers=auth_headers,
    )
    assert event_response.status_code == 201
    event_id = event_response.json()["id"]

    return hotel_id, room_id, event_id


def test_create_group_reservation_and_allocation(client: TestClient, auth_headers: dict[str, str]) -> None:
    _, room_id, event_id = create_hotel_event_and_room(client, auth_headers)

    group_response = client.post(
        f"/events/{event_id}/groups",
        json={
            "f_name": "Cohen Family",
            "f_group_type": "family",
            "f_phone": "+1-555-0100",
        },
        headers=auth_headers,
    )
    assert group_response.status_code == 201
    group_id = group_response.json()["id"]

    list_groups_response = client.get(f"/events/{event_id}/groups", headers=auth_headers)
    assert list_groups_response.status_code == 200
    assert len(list_groups_response.json()) == 1

    reservation_response = client.post(
        f"/events/{event_id}/groups/{group_id}/reservations",
        json={
            "f_start_date": "2026-04-01",
            "f_end_date": "2026-04-05",
            "f_package_type": "first_days",
            "f_status": "confirmed",
            "f_total_guests": 4,
        },
        headers=auth_headers,
    )
    assert reservation_response.status_code == 201
    reservation_id = reservation_response.json()["id"]

    get_reservation_response = client.get(f"/reservations/{reservation_id}", headers=auth_headers)
    assert get_reservation_response.status_code == 200
    assert get_reservation_response.json()["f_group_id"] == group_id

    allocation_response = client.post(
        "/room-allocations",
        json={
            "f_reservation_id": reservation_id,
            "f_room_id": room_id,
            "f_start_date": "2026-04-01",
            "f_end_date": "2026-04-05",
            "f_notes": "Near elevator",
        },
        headers=auth_headers,
    )
    assert allocation_response.status_code == 201
    allocation_id = allocation_response.json()["id"]

    get_allocation_response = client.get(f"/room-allocations/{allocation_id}", headers=auth_headers)
    assert get_allocation_response.status_code == 200
    assert get_allocation_response.json()["f_room_id"] == room_id

    reservation_allocations_response = client.get(
        f"/reservations/{reservation_id}/room-allocations",
        headers=auth_headers,
    )
    assert reservation_allocations_response.status_code == 200
    assert len(reservation_allocations_response.json()) == 1


def test_room_allocation_conflict_returns_400(client: TestClient, auth_headers: dict[str, str]) -> None:
    _, room_id, event_id = create_hotel_event_and_room(client, auth_headers)

    first_group_response = client.post(
        f"/events/{event_id}/groups",
        json={"f_name": "Levi Family"},
        headers=auth_headers,
    )
    first_group_id = first_group_response.json()["id"]

    second_group_response = client.post(
        f"/events/{event_id}/groups",
        json={"f_name": "Mizrahi Family"},
        headers=auth_headers,
    )
    second_group_id = second_group_response.json()["id"]

    first_reservation_response = client.post(
        f"/events/{event_id}/groups/{first_group_id}/reservations",
        json={
            "f_start_date": "2026-04-01",
            "f_end_date": "2026-04-05",
            "f_status": "confirmed",
            "f_total_guests": 2,
        },
        headers=auth_headers,
    )
    first_reservation_id = first_reservation_response.json()["id"]

    second_reservation_response = client.post(
        f"/events/{event_id}/groups/{second_group_id}/reservations",
        json={
            "f_start_date": "2026-04-03",
            "f_end_date": "2026-04-06",
            "f_status": "confirmed",
            "f_total_guests": 2,
        },
        headers=auth_headers,
    )
    second_reservation_id = second_reservation_response.json()["id"]

    first_allocation_response = client.post(
        "/room-allocations",
        json={
            "f_reservation_id": first_reservation_id,
            "f_room_id": room_id,
            "f_start_date": "2026-04-01",
            "f_end_date": "2026-04-05",
        },
        headers=auth_headers,
    )
    assert first_allocation_response.status_code == 201

    conflict_response = client.post(
        "/room-allocations",
        json={
            "f_reservation_id": second_reservation_id,
            "f_room_id": room_id,
            "f_start_date": "2026-04-04",
            "f_end_date": "2026-04-06",
        },
        headers=auth_headers,
    )
    assert conflict_response.status_code == 400
    assert conflict_response.json()["detail"] == "Room allocation conflicts with an existing allocation"

