# API Plan

## Auth
- POST /auth/login
- POST /auth/refresh
- GET /auth/me

## Hotels
- GET /hotels
- POST /hotels
- GET /hotels/{id}
- PUT /hotels/{id}
- GET /hotels/{id}/spaces
- GET /hotels/{id}/rooms
- GET /hotels/{id}/kitchens
- GET /hotels/{id}/tables

## Events
- GET /events
- POST /events
- GET /events/{id}
- PUT /events/{id}
- GET /events/{id}/periods
- POST /events/{id}/periods
- GET /events/{id}/configuration

## Guests
- GET /events/{id}/groups
- POST /events/{id}/groups
- GET /groups/{id}/guests
- POST /groups/{id}/guests
- GET /events/{id}/reservations
- POST /events/{id}/reservations

## Occupancy
- GET /events/{id}/room-allocations
- POST /room-allocations
- GET /events/{id}/table-allocations
- POST /table-allocations

## Schedule
- GET /events/{id}/activities
- POST /events/{id}/activities
- GET /events/{id}/activity-categories
- POST /activity-categories

## Religious
- GET /events/{id}/minyanim
- POST /events/{id}/minyanim
- GET /events/{id}/prayer-schedules
- POST /events/{id}/prayer-schedules
- GET /events/{id}/shiurim
- POST /events/{id}/shiurim

## Staff and Teams
- GET /events/{id}/teams
- POST /events/{id}/teams
- GET /events/{id}/staff
- POST /events/{id}/staff
- GET /events/{id}/shifts
- POST /events/{id}/shifts

## Tasks
- GET /events/{id}/tasks
- POST /events/{id}/tasks
- GET /tasks/{id}
- PUT /tasks/{id}
- POST /tasks/{id}/comments
- POST /tasks/{id}/status

## Supervision
- GET /events/{id}/kanban
- POST /events/{id}/kanban-lanes
- POST /tasks/{id}/move-lane
- GET /events/{id}/workload

## Kashrut
- GET /events/{id}/mashguichim
- POST /events/{id}/mashguichim
- GET /events/{id}/mashguiach-shifts
- POST /events/{id}/mashguiach-shifts
- GET /events/{id}/kashrut-checklists
- POST /events/{id}/kashrut-checklists

## Logistics
- GET /events/{id}/deliveries
- POST /events/{id}/deliveries
- GET /events/{id}/equipment
- POST /events/{id}/equipment

## Rules
- GET /events/{id}/space-rules
- POST /events/{id}/space-rules

## Lost & Found
- GET /events/{id}/lost-found
- POST /events/{id}/lost-found
- POST /lost-found/{id}/claims
