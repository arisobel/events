# Product Requirements Document (PRD)

## 1. Product Name
Event Operations Platform

## 2. Product Summary
A platform to plan, coordinate, and execute complex hospitality events such as Passover (Pessach) hotel programs, with support for hotel base infrastructure, partial stays, scheduling, task execution, kashrut supervision, logistics, rules, and supervision.

## 3. Problem Statement
Complex hospitality events are often managed through spreadsheets, messaging groups, informal notes, and fragmented tools. This causes lack of visibility, errors, delays, rework, and weak coordination among teams.

## 4. Product Vision
Create an operational flow management platform that connects planning, structure, rules, and execution in real time.

## 5. Goals
- Centralize event operation in one system
- Support hotel-based infrastructure reused across different events
- Manage guests with partial stays and dynamic allocations
- Support operational execution through tasks and staff-facing PWA
- Provide visibility to managers and supervisors
- Support domain-specific modules such as kashrut and mashguichim
- Prepare the platform for future SaaS-style multi-event growth

## 6. Core Concepts
- Hotel = persistent base infrastructure
- Event = time-bound operational instance linked to a hotel
- Operation = real-time execution layer built on top of the event

## 7. Users
### Primary
- Event organizers
- Operations managers
- Reception managers
- Food and beverage coordinators
- Religious coordinators
- Team supervisors

### Secondary
- Staff members
- Mashguichim
- Logistics workers

### Future
- Guests

## 8. Scope by Module

### 8.1 Hotel Infrastructure
- Register hotels
- Manage hotel spaces
- Manage rooms
- Manage kitchens
- Manage physical tables

### 8.2 Event
- Create event linked to hotel
- Define event periods
- Configure event-level settings
- Manage event-specific spaces

### 8.3 Guests and Occupancy
- Register groups/families
- Register guests
- Manage reservations with date intervals
- Allocate rooms by date range
- Allocate tables by period
- Manage special requests

### 8.4 Scheduling
- Activity categories
- Activities with date/time, location, audience, and type
- Support fixed, continuous, and segmented activities

### 8.5 Religious
- Minyanim
- Prayer schedules
- Aliyot assignments
- Shiurim

### 8.6 Staff and Tasks
- Teams
- Staff members
- Team membership
- Shifts
- Tasks
- Task comments
- Task status history

### 8.7 Supervision
- Supervisor visibility into workload
- Kanban lanes
- Task movement
- Workload snapshots

### 8.8 Kashrut
- Mashguichim
- Mashguiach shifts
- Kitchen supervision coverage
- Kashrut checklists
- Kasherization tasks

### 8.9 Logistics
- Suppliers
- Deliveries
- Delivery items
- Equipment
- Equipment movements

### 8.10 Operational Rules
- Space rules
- Time-based restrictions
- Audience restrictions

### 8.11 Lost & Found
- Lost/found items
- Claims
- Matching in future phase

### 8.12 Security
- Users
- Roles
- Permissions
- Audit logs

## 9. MVP Definition
### MVP Modules
- Hotel infrastructure
- Event and periods
- Guests and reservations
- Room allocation
- Table allocation
- Activities and schedule
- Staff, teams, shifts
- Tasks and task execution
- Basic operational rules
- Lost & found
- Authentication and basic authorization

### MVP Interfaces
- Admin web interface
- Operations web interface
- Staff PWA

## 10. Phase 2
- Kashrut full module
- Mashguichim scheduling
- Logistics
- Supervisor dashboard improvements
- Notifications and alerts

## 11. Phase 3
- Smart Kanban
- Capacity-aware work distribution
- Advanced analytics
- Automation engine
- Guest-facing module/app

## 12. Functional Requirements
- Create and manage hotel master data
- Create events linked to a hotel
- Support multi-period events
- Support date-range room allocations
- Support table assignment by period
- Provide activity and religious schedule management
- Provide staff task execution through PWA
- Allow supervisors to monitor and reassign work
- Allow rule-based restrictions by space/time/audience
- Register lost/found items
- Maintain audit trail of critical changes

## 13. Non-Functional Requirements
- Fast response time for main screens
- Secure access with role-based control
- Good mobile experience for staff
- PWA installability
- HTTPS
- Docker-based deployment
- Compatibility with CapRover
- Partial offline support in future iteration

## 14. Success Metrics
- Reduced operational coordination time
- Reduced reliance on messaging apps for execution
- Improved task completion visibility
- Lower number of operational errors
- Faster resolution of guest and staff requests

## 15. Technology Decisions
- Backend: Python + FastAPI + SQLAlchemy
- Database: PostgreSQL
- Realtime/Cache: Redis
- Frontend: React + TypeScript + Vite + Tailwind
- Mobile strategy: PWA first
- Deployment: Docker + CapRover

## 16. Constraints
- Initial team likely small
- Product should evolve in phases
- Need domain-specific support for kosher/hospitality operations
- Need flexibility across different hotels and events
