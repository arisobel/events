-- Full draft schema for Event Operations Platform

CREATE TABLE t_hotel (
    id SERIAL PRIMARY KEY,
    f_name VARCHAR(150) NOT NULL,
    f_trade_name VARCHAR(150),
    f_document VARCHAR(30),
    f_phone VARCHAR(50),
    f_email VARCHAR(150),
    f_address TEXT,
    f_city VARCHAR(100),
    f_state VARCHAR(100),
    f_country VARCHAR(100),
    f_notes TEXT,
    f_active CHAR(1) DEFAULT 'T',
    f_created_at TIMESTAMP DEFAULT NOW(),
    f_updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_hotel_space (
    id SERIAL PRIMARY KEY,
    f_hotel_id INT NOT NULL REFERENCES t_hotel(id),
    f_name VARCHAR(150) NOT NULL,
    f_space_type VARCHAR(50) NOT NULL,
    f_capacity INT,
    f_floor VARCHAR(50),
    f_block VARCHAR(50),
    f_is_active CHAR(1) DEFAULT 'T',
    f_notes TEXT
);

CREATE TABLE t_hotel_room (
    id SERIAL PRIMARY KEY,
    f_hotel_id INT NOT NULL REFERENCES t_hotel(id),
    f_room_number VARCHAR(20) NOT NULL,
    f_room_type VARCHAR(50),
    f_floor VARCHAR(50),
    f_block VARCHAR(50),
    f_capacity INT NOT NULL DEFAULT 1,
    f_status VARCHAR(30) DEFAULT 'available',
    f_notes TEXT
);

CREATE TABLE t_hotel_kitchen (
    id SERIAL PRIMARY KEY,
    f_hotel_id INT NOT NULL REFERENCES t_hotel(id),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_name VARCHAR(150) NOT NULL,
    f_kitchen_type VARCHAR(50),
    f_capacity_level VARCHAR(50),
    f_notes TEXT
);

CREATE TABLE t_hotel_table (
    id SERIAL PRIMARY KEY,
    f_hotel_id INT NOT NULL REFERENCES t_hotel(id),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_table_code VARCHAR(30) NOT NULL,
    f_capacity INT NOT NULL,
    f_shape VARCHAR(30),
    f_notes TEXT
);

CREATE TABLE t_event (
    id SERIAL PRIMARY KEY,
    f_hotel_id INT NOT NULL REFERENCES t_hotel(id),
    f_name VARCHAR(150) NOT NULL,
    f_event_type VARCHAR(50),
    f_start_date DATE NOT NULL,
    f_end_date DATE NOT NULL,
    f_expected_guests INT,
    f_expected_families INT,
    f_status VARCHAR(30) DEFAULT 'draft',
    f_notes TEXT,
    f_created_at TIMESTAMP DEFAULT NOW(),
    f_updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_event_period (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_name VARCHAR(100) NOT NULL,
    f_period_type VARCHAR(50),
    f_start_date DATE NOT NULL,
    f_end_date DATE NOT NULL,
    f_sort_order INT DEFAULT 0,
    f_notes TEXT
);

CREATE TABLE t_event_space (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_space_id INT NOT NULL REFERENCES t_hotel_space(id),
    f_usage_type VARCHAR(50),
    f_is_active CHAR(1) DEFAULT 'T',
    f_notes TEXT
);

CREATE TABLE t_event_configuration (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_config_key VARCHAR(100) NOT NULL,
    f_config_value TEXT,
    UNIQUE (f_event_id, f_config_key)
);

CREATE TABLE t_guest_group (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_name VARCHAR(150) NOT NULL,
    f_group_type VARCHAR(50),
    f_phone VARCHAR(50),
    f_email VARCHAR(150),
    f_notes TEXT
);

CREATE TABLE t_guest (
    id SERIAL PRIMARY KEY,
    f_group_id INT NOT NULL REFERENCES t_guest_group(id),
    f_full_name VARCHAR(150) NOT NULL,
    f_gender VARCHAR(20),
    f_birth_date DATE,
    f_document VARCHAR(50),
    f_phone VARCHAR(50),
    f_email VARCHAR(150),
    f_guest_type VARCHAR(50),
    f_notes TEXT
);

CREATE TABLE t_reservation (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_group_id INT NOT NULL REFERENCES t_guest_group(id),
    f_start_date DATE NOT NULL,
    f_end_date DATE NOT NULL,
    f_package_type VARCHAR(50),
    f_status VARCHAR(30) DEFAULT 'confirmed',
    f_total_guests INT,
    f_notes TEXT
);

CREATE TABLE t_room_allocation (
    id SERIAL PRIMARY KEY,
    f_reservation_id INT NOT NULL REFERENCES t_reservation(id),
    f_room_id INT NOT NULL REFERENCES t_hotel_room(id),
    f_start_date DATE NOT NULL,
    f_end_date DATE NOT NULL,
    f_checkin_status VARCHAR(30) DEFAULT 'planned',
    f_checkout_status VARCHAR(30) DEFAULT 'planned',
    f_notes TEXT
);

CREATE TABLE t_table_allocation (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_period_id INT REFERENCES t_event_period(id),
    f_table_id INT NOT NULL REFERENCES t_hotel_table(id),
    f_group_id INT NOT NULL REFERENCES t_guest_group(id),
    f_meal_type VARCHAR(30),
    f_notes TEXT
);

CREATE TABLE t_special_request (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_group_id INT REFERENCES t_guest_group(id),
    f_guest_id INT REFERENCES t_guest(id),
    f_request_type VARCHAR(50),
    f_priority VARCHAR(20) DEFAULT 'medium',
    f_status VARCHAR(30) DEFAULT 'open',
    f_description TEXT NOT NULL,
    f_notes TEXT,
    f_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_activity_category (
    id SERIAL PRIMARY KEY,
    f_name VARCHAR(100) NOT NULL,
    f_color VARCHAR(20),
    f_icon VARCHAR(50),
    f_notes TEXT
);

CREATE TABLE t_activity (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_category_id INT REFERENCES t_activity_category(id),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_name VARCHAR(150) NOT NULL,
    f_activity_type VARCHAR(50),
    f_start_datetime TIMESTAMP NOT NULL,
    f_end_datetime TIMESTAMP NOT NULL,
    f_is_continuous CHAR(1) DEFAULT 'F',
    f_target_audience VARCHAR(100),
    f_capacity INT,
    f_notes TEXT
);

CREATE TABLE t_activity_dependency (
    id SERIAL PRIMARY KEY,
    f_activity_id INT NOT NULL REFERENCES t_activity(id),
    f_depends_on_activity_id INT NOT NULL REFERENCES t_activity(id),
    f_dependency_type VARCHAR(50)
);

CREATE TABLE t_minyan (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_name VARCHAR(100) NOT NULL,
    f_tradition VARCHAR(50),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_notes TEXT
);

CREATE TABLE t_prayer_schedule (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_minyan_id INT REFERENCES t_minyan(id),
    f_prayer_type VARCHAR(50) NOT NULL,
    f_start_datetime TIMESTAMP NOT NULL,
    f_space_id INT REFERENCES t_hotel_space(id),
    f_notes TEXT
);

CREATE TABLE t_aliya_assignment (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_prayer_schedule_id INT REFERENCES t_prayer_schedule(id),
    f_guest_id INT REFERENCES t_guest(id),
    f_aliya_type VARCHAR(50),
    f_status VARCHAR(30) DEFAULT 'planned',
    f_notes TEXT
);

CREATE TABLE t_shiur (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_title VARCHAR(150) NOT NULL,
    f_speaker_name VARCHAR(150),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_start_datetime TIMESTAMP NOT NULL,
    f_end_datetime TIMESTAMP NOT NULL,
    f_target_audience VARCHAR(100),
    f_notes TEXT
);

CREATE TABLE t_team (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_name VARCHAR(100) NOT NULL,
    f_team_type VARCHAR(50),
    f_notes TEXT
);

CREATE TABLE t_staff_member (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_full_name VARCHAR(150) NOT NULL,
    f_phone VARCHAR(50),
    f_email VARCHAR(150),
    f_role_name VARCHAR(100),
    f_is_hotel_staff CHAR(1) DEFAULT 'F',
    f_is_internal_staff CHAR(1) DEFAULT 'T',
    f_status VARCHAR(30) DEFAULT 'active',
    f_notes TEXT
);

CREATE TABLE t_team_member (
    id SERIAL PRIMARY KEY,
    f_team_id INT NOT NULL REFERENCES t_team(id),
    f_staff_member_id INT NOT NULL REFERENCES t_staff_member(id),
    f_is_manager CHAR(1) DEFAULT 'F'
);

CREATE TABLE t_shift (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_staff_member_id INT NOT NULL REFERENCES t_staff_member(id),
    f_team_id INT REFERENCES t_team(id),
    f_start_datetime TIMESTAMP NOT NULL,
    f_end_datetime TIMESTAMP NOT NULL,
    f_shift_type VARCHAR(50),
    f_notes TEXT
);

CREATE TABLE t_task (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_title VARCHAR(200) NOT NULL,
    f_description TEXT,
    f_priority VARCHAR(20) DEFAULT 'medium',
    f_status VARCHAR(30) DEFAULT 'pending',
    f_task_type VARCHAR(50),
    f_team_id INT REFERENCES t_team(id),
    f_assigned_to_staff_id INT REFERENCES t_staff_member(id),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_room_id INT REFERENCES t_hotel_room(id),
    f_activity_id INT REFERENCES t_activity(id),
    f_due_datetime TIMESTAMP,
    f_started_at TIMESTAMP,
    f_completed_at TIMESTAMP,
    f_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_task_comment (
    id SERIAL PRIMARY KEY,
    f_task_id INT NOT NULL REFERENCES t_task(id),
    f_staff_member_id INT REFERENCES t_staff_member(id),
    f_comment TEXT NOT NULL,
    f_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_task_status_history (
    id SERIAL PRIMARY KEY,
    f_task_id INT NOT NULL REFERENCES t_task(id),
    f_old_status VARCHAR(30),
    f_new_status VARCHAR(30),
    f_changed_by_staff_id INT REFERENCES t_staff_member(id),
    f_changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_kanban_lane (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_name VARCHAR(100) NOT NULL,
    f_sort_order INT DEFAULT 0,
    f_wip_limit INT
);

CREATE TABLE t_task_kanban (
    id SERIAL PRIMARY KEY,
    f_task_id INT NOT NULL REFERENCES t_task(id),
    f_lane_id INT NOT NULL REFERENCES t_kanban_lane(id),
    f_sort_order INT DEFAULT 0,
    f_updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_workload_snapshot (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_staff_member_id INT REFERENCES t_staff_member(id),
    f_team_id INT REFERENCES t_team(id),
    f_snapshot_datetime TIMESTAMP DEFAULT NOW(),
    f_open_tasks INT DEFAULT 0,
    f_in_progress_tasks INT DEFAULT 0,
    f_load_score NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE t_mashguiach (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_staff_member_id INT REFERENCES t_staff_member(id),
    f_level VARCHAR(50),
    f_certification VARCHAR(150),
    f_notes TEXT
);

CREATE TABLE t_mashguiach_shift (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_mashguiach_id INT NOT NULL REFERENCES t_mashguiach(id),
    f_kitchen_id INT REFERENCES t_hotel_kitchen(id),
    f_meal_type VARCHAR(30),
    f_start_datetime TIMESTAMP NOT NULL,
    f_end_datetime TIMESTAMP NOT NULL,
    f_notes TEXT
);

CREATE TABLE t_kashrut_checklist (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_kitchen_id INT REFERENCES t_hotel_kitchen(id),
    f_title VARCHAR(150) NOT NULL,
    f_checklist_type VARCHAR(50),
    f_notes TEXT
);

CREATE TABLE t_kashrut_checklist_item (
    id SERIAL PRIMARY KEY,
    f_checklist_id INT NOT NULL REFERENCES t_kashrut_checklist(id),
    f_description TEXT NOT NULL,
    f_sort_order INT DEFAULT 0,
    f_required CHAR(1) DEFAULT 'T'
);

CREATE TABLE t_kasherization_task (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_kitchen_id INT REFERENCES t_hotel_kitchen(id),
    f_space_id INT REFERENCES t_hotel_space(id),
    f_title VARCHAR(150) NOT NULL,
    f_status VARCHAR(30) DEFAULT 'pending',
    f_due_datetime TIMESTAMP,
    f_notes TEXT
);

CREATE TABLE t_supplier (
    id SERIAL PRIMARY KEY,
    f_name VARCHAR(150) NOT NULL,
    f_contact_name VARCHAR(150),
    f_phone VARCHAR(50),
    f_email VARCHAR(150),
    f_notes TEXT
);

CREATE TABLE t_delivery (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_supplier_id INT REFERENCES t_supplier(id),
    f_delivery_type VARCHAR(50),
    f_expected_datetime TIMESTAMP,
    f_received_datetime TIMESTAMP,
    f_status VARCHAR(30) DEFAULT 'planned',
    f_notes TEXT
);

CREATE TABLE t_delivery_item (
    id SERIAL PRIMARY KEY,
    f_delivery_id INT NOT NULL REFERENCES t_delivery(id),
    f_item_name VARCHAR(150) NOT NULL,
    f_quantity NUMERIC(12,2),
    f_unit VARCHAR(20),
    f_notes TEXT
);

CREATE TABLE t_equipment (
    id SERIAL PRIMARY KEY,
    f_event_id INT REFERENCES t_event(id),
    f_name VARCHAR(150) NOT NULL,
    f_equipment_type VARCHAR(50),
    f_quantity NUMERIC(12,2),
    f_unit VARCHAR(20),
    f_notes TEXT
);

CREATE TABLE t_equipment_movement (
    id SERIAL PRIMARY KEY,
    f_equipment_id INT NOT NULL REFERENCES t_equipment(id),
    f_from_space_id INT REFERENCES t_hotel_space(id),
    f_to_space_id INT REFERENCES t_hotel_space(id),
    f_quantity NUMERIC(12,2),
    f_movement_datetime TIMESTAMP DEFAULT NOW(),
    f_notes TEXT
);

CREATE TABLE t_space_rule (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_space_id INT NOT NULL REFERENCES t_hotel_space(id),
    f_rule_type VARCHAR(50) NOT NULL,
    f_condition_type VARCHAR(50),
    f_target_audience VARCHAR(100),
    f_start_time TIME,
    f_end_time TIME,
    f_is_allowed CHAR(1) DEFAULT 'T',
    f_notes TEXT
);

CREATE TABLE t_lost_found_item (
    id SERIAL PRIMARY KEY,
    f_event_id INT NOT NULL REFERENCES t_event(id),
    f_item_type VARCHAR(20) NOT NULL,
    f_category VARCHAR(50),
    f_description TEXT NOT NULL,
    f_space_id INT REFERENCES t_hotel_space(id),
    f_reported_by_guest_id INT REFERENCES t_guest(id),
    f_reported_by_staff_id INT REFERENCES t_staff_member(id),
    f_status VARCHAR(30) DEFAULT 'open',
    f_reported_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_lost_found_claim (
    id SERIAL PRIMARY KEY,
    f_item_id INT NOT NULL REFERENCES t_lost_found_item(id),
    f_guest_id INT REFERENCES t_guest(id),
    f_claim_status VARCHAR(30) DEFAULT 'pending',
    f_notes TEXT,
    f_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_user (
    id SERIAL PRIMARY KEY,
    f_username VARCHAR(100) NOT NULL UNIQUE,
    f_password_hash TEXT NOT NULL,
    f_email VARCHAR(150),
    f_is_active CHAR(1) DEFAULT 'T',
    f_created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_role (
    id SERIAL PRIMARY KEY,
    f_name VARCHAR(100) NOT NULL UNIQUE,
    f_notes TEXT
);

CREATE TABLE t_user_role (
    id SERIAL PRIMARY KEY,
    f_user_id INT NOT NULL REFERENCES t_user(id),
    f_role_id INT NOT NULL REFERENCES t_role(id)
);

CREATE TABLE t_audit_log (
    id SERIAL PRIMARY KEY,
    f_user_id INT REFERENCES t_user(id),
    f_entity_name VARCHAR(100),
    f_entity_id INT,
    f_action VARCHAR(50),
    f_old_value TEXT,
    f_new_value TEXT,
    f_created_at TIMESTAMP DEFAULT NOW()
);
