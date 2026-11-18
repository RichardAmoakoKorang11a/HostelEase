# Software Design Document (SDD)
## Project: HostelEase – Campus Hostel Booking & Allocation System
**Standard:** IEEE 1016 Software Design Description  
**Course:** Software Engineering (Unit 5: Software Design Principles & Patterns)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (Index No: `5240101411`) – Lead Developer / DevOps Lead
2. **Adjei Douglas** (Index No: `5240101412`) – QA & Testing Lead
3. **Richard Amoako Korang** (Index No: `5240101413`) – Project Lead / PM
4. **Ibrahim Mohammed** (Index No: `5240101414`) – Architecture & Database Lead
5. **Sandra Otu** (Index No: `5240101415`) – Documentation & Frontend Lead

---

## 1. System Overview & Architecture Goals
HostelEase addresses the annual university hostel allocation crisis characterized by manual lines, duplicate bookings, and financial fraud. The design prioritizes three primary architectural goals:
1. **Concurrency Safety:** Guaranteeing atomic bed-space reservation to eliminate race conditions during high-volume rush periods.
2. **Decoupled Integrations:** Abstracting third-party mobile money payments and SMS gateways behind polymorphic interfaces.
3. **Simplicity & Reliability:** Utilizing lightweight, zero-configuration local persistence (SQLite) with strict foreign key constraints.

---

## 2. High-Level Architectural Pattern (3-Tier Layered Architecture)

The system enforces strict separation of concerns into three tiers:

```
┌─────────────────────────────────────────────────────────────┐
│               1. Client Presentation Tier                  │
│   • Tailwind CSS Responsive Web UI (Mobile & Desktop)      │
│   • Interactive Architecture & UML Studio (diagrams.html)   │
│   • Real-Time 15-Minute Countdown Timer & Badges           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST APIs
┌──────────────────────────────▼──────────────────────────────┐
│                2. Application / Logic Tier                  │
│   • Express REST Controller (`src/server.js`)               │
│   • Concurrency Locking Engine (`bookingService.js`)       │
│   • Payment Strategy Provider (`paymentGateway.js`)         │
│   • Notification Gateway Adapter (`smsService.js`)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLite Driver / SQL
┌──────────────────────────────▼──────────────────────────────┐
│           3. Data Persistence & Sandbox Tier                │
│   • SQLite Database (`hostelease.db` with PRAGMA FK = ON)   │
│   • Paystack Mobile Money Sandbox                           │
│   • GSM / Twilio SMS Dispatch Sandbox                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Design Patterns Applied

### 3.1 Strategy Pattern (Payment Processing)
- **Problem:** Tying checkout logic directly to Paystack would break the application if the university adopts MTN MoMo API, Telecel Cash, or a local mock during testing.
- **Solution:** Defined the `IPaymentGateway` strategy interface.
  - `PaystackSandboxGateway`: Implements real HTTP communication with Paystack's transaction initialization sandbox.
  - `MockPaymentGateway`: Test double returning immediate mock checkout tokens for offline automated testing.

```
       «interface»
    IPaymentGateway
  +initializePayment(data)
  +verifyTransaction(ref)
           ▲
           │
  ┌────────┴────────────────────┐
  │                             │
PaystackSandboxGateway   MockPaymentGateway
```

### 3.2 State Machine Pattern (Room Life Cycle)
Rooms transition through three deterministic states:
1. `AVAILABLE`: Bed is open for student selection.
2. `LOCKED`: Bed is reserved by a student for 15 minutes. `lock_expires_at = CURRENT_TIMESTAMP + 15 mins`.
3. `OCCUPIED`: Bed has been confirmed with successful payment.

```
 [AVAILABLE] ──────(Student Reserves)──────> [LOCKED]
      ▲                                         │
      │                                         │ (Payment Confirmed)
      └───(15-min Lock Expires)                 ▼
                                           [OCCUPIED]
```

### 3.3 Singleton Database Connection Pool
- SQLite file access is centralized via `src/config/database.js` ensuring thread-safe serialized execution (`db.serialize()`) and eliminating file lock contention on Windows/Linux environments.

---

## 4. Concurrency & Race-Condition Prevention Design

### 4.1 The Rush Problem
During the first hour of hostel portal openings, 500+ students attempt to book the same prime rooms simultaneously. In a naive implementation:
1. User A checks room status (`SELECT status FROM rooms` -> `AVAILABLE`).
2. User B checks room status (`SELECT status FROM rooms` -> `AVAILABLE`).
3. User A books room.
4. User B books room -> **Double Booking Bug!**

### 4.2 HostelEase Atomic Solution
HostelEase executes an atomic conditional update query:
```sql
UPDATE rooms 
SET status = 'LOCKED', lock_expires_at = ? 
WHERE id = ? AND (status = 'AVAILABLE' OR (status = 'LOCKED' AND lock_expires_at < CURRENT_TIMESTAMP));
```
- If two users fire simultaneous requests, the SQLite database lock guarantees serialized execution.
- User A's transaction succeeds (`changes = 1`).
- User B's transaction evaluates to zero rows matched (`changes = 0`), throwing `ERR_ROOM_UNAVAILABLE` and preventing race conditions.

---

## 5. Relational Schema & Data Dictionary

| Table | Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **users** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user surrogate key |
| | `student_id` | VARCHAR(20) | UNIQUE, NOT NULL | University student ID index |
| | `full_name` | VARCHAR(100) | NOT NULL | Student's full legal name |
| | `email` | VARCHAR(100) | UNIQUE, NOT NULL | Contact email for Paystack |
| | `phone` | VARCHAR(20) | NOT NULL | Phone number for SMS ticket |
| | `role` | VARCHAR(20) | DEFAULT 'STUDENT' | Role: STUDENT, LEAD_DEV, ADMIN |
| **hostels** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Hostel identifier |
| | `name` | VARCHAR(100) | NOT NULL | Campus hall name |
| | `campus_location` | VARCHAR(100) | NOT NULL | Location on campus |
| | `gender_type` | VARCHAR(10) | CHECK(IN ('MALE','FEMALE','MIXED')) | Eligibility rule |
| **rooms** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Room unique key |
| | `hostel_id` | INTEGER | FOREIGN KEY REFERENCES hostels(id) | Parent hostel |
| | `room_number` | VARCHAR(20) | NOT NULL | Room number (e.g., Room 101) |
| | `capacity` | INTEGER | DEFAULT 1 | Bed capacity |
| | `price_per_semester`| DECIMAL(10,2)| NOT NULL | Cost in GHS |
| | `status` | VARCHAR(20) | CHECK(IN ('AVAILABLE','LOCKED','OCCUPIED')) | Room state |
| | `lock_expires_at` | TIMESTAMP | NULL | 15-minute expiration timestamp |
| **bookings** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Booking key |
| | `user_id` | INTEGER | FOREIGN KEY REFERENCES users(id) | Student who booked |
| | `room_id` | INTEGER | FOREIGN KEY REFERENCES rooms(id) | Reserved room |
| | `reference` | VARCHAR(50) | UNIQUE, NOT NULL | Unique booking token (HE-XXXX) |
| | `status` | VARCHAR(20) | CHECK(IN ('PENDING','CONFIRMED','EXPIRED')) | Allocation status |
| **payments** | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Payment ledger ID |
| | `booking_id` | INTEGER | FOREIGN KEY REFERENCES bookings(id) | Associated reservation |
| | `reference` | VARCHAR(50) | UNIQUE, NOT NULL | Paystack reference |
| | `amount` | DECIMAL(10,2)| NOT NULL | Amount paid in GHS |
| | `channel` | VARCHAR(30) | DEFAULT 'MOBILE_MONEY' | MoMo, Card, Bank |
| | `status` | VARCHAR(20) | DEFAULT 'SUCCESS' | Payment status |

---

## 6. External Service Integration Architecture

### 6.1 Paystack Sandbox API
- **Endpoint:** `https://api.paystack.co/transaction/initialize`
- **Method:** `POST`
- **Payload:** `{ email, amount: amount * 100, reference, callback_url }`
- **Mock Fallback:** When sandbox keys are unconfigured or offline, returns an interactive sandbox checkout link allowing testers to complete transaction workflows seamlessly.

### 6.2 Twilio / Hubtel SMS Gateway
- **Payload:** `{ to: student.phone, message: "HostelEase: Booking #HE-XXXX confirmed for Room 101..." }`
- **Simulation Mode:** Formatted SMS ticket is simultaneously dispatched and rendered in the application terminal console to enable audit logging without consuming cellular credit.
