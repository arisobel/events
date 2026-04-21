


# preencher mais depois - aqui abaixo o DLL inicial 

-- HOTEL
CREATE TABLE t_hotel (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150),
    city VARCHAR(100),
    country VARCHAR(100)
);

-- ROOMS
CREATE TABLE t_hotel_room (
    id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES t_hotel(id),
    room_number VARCHAR(20),
    capacity INT
);

-- EVENT
CREATE TABLE t_event (
    id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES t_hotel(id),
    name VARCHAR(150),
    start_date DATE,
    end_date DATE
);

-- GUEST GROUP
CREATE TABLE t_guest_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150)
);

-- RESERVATION (PARTIAL STAYS)
CREATE TABLE t_reservation (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES t_guest_group(id),
    event_id INT REFERENCES t_event(id),
    start_date DATE,
    end_date DATE
);

-- ROOM ALLOCATION
CREATE TABLE t_room_allocation (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES t_hotel_room(id),
    reservation_id INT REFERENCES t_reservation(id),
    start_date DATE,
    end_date DATE
);

-- TASKS
CREATE TABLE t_task (
    id SERIAL PRIMARY KEY,
    title TEXT,
    priority VARCHAR(10),
    status VARCHAR(20),
    assigned_to INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- LOST & FOUND
CREATE TABLE t_lost_found (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10),
    description TEXT,
    location VARCHAR(100),
    status VARCHAR(20)
);