# UML Diagrams, Architecture & Visual Drawings
## Project: HostelEase – Campus Hostel Booking & Allocation System
**Course:** Software Engineering (Unit 4: UML Diagrams & Unit 5: Design Principles)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (`5240101411`)
2. **Adjei Douglas** (`5240101412`)
3. **Richard Amoako Korang** (`5240101413`) – Project Lead
4. **Ibrahim Mohammed** (`5240101414`) – Architecture & Sprint Modeling Lead
5. **Sandra Otu** (`5240101415`)

> **Pull Request Scope:** Design 7 Visual UML Architectural Models in Mermaid & SVG, define architectural invariants, and formulate 4-point Risk Register and Sprint Plans.


> 💡 **Interactive Studio:** View these drawings with live tab switching and PDF export by launching the app and visiting:  
> 👉 **`http://localhost:3000/diagrams.html`**

---

## 1. Use Case Diagram (Unit 4)
Illustrates the system boundary, the primary **Student** actor, the **Hostel Administrator** actor, and external services (**Paystack Mobile Money** and **Twilio SMS**).

```mermaid
flowchart TD
    Student["👤 Student<br/>(Campus User)"]
    Admin["👨‍💼 Hostel Admin<br/>(Hall Management)"]
    Paystack["💳 Paystack Sandbox<br/>«External Service»"]
    SMS["📱 SMS Gateway<br/>«External Service»"]

    subgraph HostelEase["HostelEase System Boundary"]
        UC1(["Browse & Filter Hostels"])
        UC2(["Reserve Bed Space (15-min Lock)"])
        UC3(["Pay via Mobile Money Sandbox"])
        UC4(["Receive SMS Confirmation Ticket"])
        UC5(["Add New Room (CRUD)"])
        UC6(["Edit Room Details (CRUD)"])
        UC7(["Delete Room from Inventory"])
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4

    Admin --> UC1
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7

    UC2 -.->|«include»| UC3
    UC3 -.->|«external»| Paystack
    UC3 -.->|«include»| UC4
    UC4 -.->|«external»| SMS
```
*Vector Drawing File:* [`docs/diagrams/use_case_diagram.svg`](diagrams/use_case_diagram.svg)

---

## 2. Domain Class Diagram (Unit 4 & 5)
Defines the structural domain model, entity attributes, visibility indicators, relationships, and the **IPaymentGateway Strategy pattern** interface.

```mermaid
classDiagram
    class User {
        -int id
        -String studentId
        -String fullName
        -String email
        -String phone
        -String role
        +register() Boolean
        +login() String
        +getProfile() User
    }

    class Hostel {
        -int id
        -String name
        -String campusLocation
        -String genderType
        +getRooms() List
        +getAvailableCount() int
    }

    class Room {
        -int id
        -int hostelId
        -String roomNumber
        -int capacity
        -double pricePerSemester
        -String status
        +lockRoom(duration) Boolean
        +releaseLock() void
        +updateDetails(data) void
    }

    class Booking {
        -int id
        -int userId
        -int roomId
        -String reference
        -String status
        +reserveBedSpace() Result
        +confirmPayment() Result
        +isLockExpired() Boolean
    }

    class PaymentTransaction {
        -int id
        -int bookingId
        -String reference
        -double amount
        -String channel
        +verifySignature() Boolean
        +recordPayment() void
    }

    User "1" --> "0..*" Booking : places
    Hostel "1" *-- "1..*" Room : contains
    Room "1" <-- "0..*" Booking : targets
    Booking "1" -- "1" PaymentTransaction : generates
```
*Vector Drawing File:* [`docs/diagrams/class_diagram.svg`](diagrams/class_diagram.svg)

---

## 3. Sequence Diagram (Unit 4)
Chronological messaging workflow detailing how the **15-minute concurrency lock** is acquired in SQLite, verified via Paystack, and triggers an automated SMS ticket.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant WebClient as Frontend UI
    participant Server as Express API
    participant DB as SQLite DB
    participant Paystack as Paystack Sandbox
    participant SMS as SMS Gateway

    Student->>WebClient: 1. Click "Lock & Reserve Bed"
    WebClient->>Server: 2. POST /api/bookings/reserve {userId, roomId}
    Server->>DB: 3. Atomic check: status == AVAILABLE
    Server->>DB: 4. UPDATE rooms SET status='LOCKED' (15 min)
    DB-->>Server: Lock acquired
    Server->>Paystack: 5. Initialize Payment (amount, reference)
    Paystack-->>Server: Return checkoutUrl & token
    Server-->>WebClient: Return {reference, lockExpiresAt}
    WebClient->>Student: 6. Show 15-min Countdown Modal
    Student->>WebClient: 7. Click "Pay with MoMo Sandbox"
    WebClient->>Server: 8. POST /api/bookings/pay-sandbox {reference}
    Server->>DB: 9. UPDATE room='OCCUPIED', booking='CONFIRMED'
    Server->>SMS: 10. sendSMS(studentPhone, "Booking #REF Confirmed")
    SMS-->>Student: 11. SMS Delivered to Student Mobile Device
    Server-->>WebClient: 12. Render Confirmed Pass
```
*Vector Drawing File:* [`docs/diagrams/sequence_diagram.svg`](diagrams/sequence_diagram.svg)

---

## 4. Activity & State Machine Diagram (Unit 4)
Models the lifecycle and state transitions of room inventory (`AVAILABLE` ➔ `LOCKED` ➔ `OCCUPIED`), including the automated **15-minute timeout rollback**.

```mermaid
stateDiagram-v2
    [*] --> Available: Room Added to Inventory
    Available --> Locked: Student Clicks "Lock & Reserve Bed"
    
    state Locked {
        [*] --> TimerRunning: 15-Minute Concurrency Lock
        TimerRunning --> Timeout: 15 Minutes Elapsed Without Payment
        TimerRunning --> PaymentVerified: Paystack Sandbox Webhook Confirmed
    }
    
    Timeout --> Available: Automated Rollback (Status='AVAILABLE')
    PaymentVerified --> Occupied: Status='OCCUPIED' & SMS Ticket Dispatched
    Occupied --> [*]
```
*Vector Drawing File:* [`docs/diagrams/activity_diagram.svg`](diagrams/activity_diagram.svg)

---

## 5. Relational Database Entity-Relationship (ER) Diagram (Unit 6)
Complete relational schema diagram with Primary Keys (`PK`), Foreign Keys (`FK`), Unique Keys (`UK`), and Crow's Foot cardinality notations connecting `USERS`, `HOSTELS`, `ROOMS`, `BOOKINGS`, and `PAYMENTS`.

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : places
    HOSTELS ||--|{ ROOMS : contains
    ROOMS ||--o{ BOOKINGS : targets
    BOOKINGS ||--|| PAYMENTS : generates

    USERS {
        int id PK
        string student_id UK
        string full_name
        string email UK
        string phone
        string role
        timestamp created_at
    }

    HOSTELS {
        int id PK
        string name
        string campus_location
        string gender_type
    }

    ROOMS {
        int id PK
        int hostel_id FK
        string room_number
        int capacity
        decimal price_per_semester
        string status
        timestamp lock_expires_at
    }

    BOOKINGS {
        int id PK
        int user_id FK
        int room_id FK
        string reference UK
        string status
        timestamp created_at
    }

    PAYMENTS {
        int id PK
        int booking_id FK
        string reference UK
        decimal amount
        string channel
        timestamp paid_at
    }
```
*Vector Drawing File:* [`docs/diagrams/er_diagram.svg`](diagrams/er_diagram.svg)

---

## 6. 3-Tier System Architecture Diagram (Unit 5 & 10)
Separation of concerns between Presentation Tier (Tailwind CSS UI & PWA pass), Application Server Tier (Express.js REST API & Concurrency Lock Engine), and Persistence & External Integration Tier (SQLite DB + Paystack + Twilio/Hubtel).

```mermaid
flowchart TD
    subgraph Tier1["Tier 1: Client Presentation Tier"]
        UI["Tailwind CSS Web Client<br/>(Dynamic Cards & 15m Timer)"]
        AdminUI["Admin CRUD Management Modal<br/>(Add, Edit, Delete Rooms)"]
        Slip["Offline SMS Allocation Pass<br/>(Porter Verification)"]
    end

    subgraph Tier2["Tier 2: Application & Business Logic Tier"]
        Express["Express.js Server & Router<br/>(/api/rooms, /api/bookings)"]
        Engine["Concurrency Locking Engine<br/>(Atomic State Transitions)"]
        Strategy["Payment Gateway Strategy<br/>(Paystack Sandbox & Fallback)"]
        Notifier["Notification Dispatcher<br/>(Twilio / Hubtel SMS Gateway)"]
    end

    subgraph Tier3["Tier 3: Persistence & External Integration Tier"]
        DB[("SQLite Database<br/>hostelease.db")]
        Paystack["💳 Paystack Payment Sandbox<br/>(Mobile Money)"]
        SMS["📱 SMS Gateway Sandbox<br/>(GSM SMS Dispatch)"]
    end

    UI -->|HTTP REST| Express
    AdminUI -->|HTTP REST| Express
    Express --> Engine
    Express --> Strategy
    Express --> Notifier
    Engine --> DB
    Strategy --> Paystack
    Notifier --> SMS
```
*Vector Drawing File:* [`docs/diagrams/architecture_diagram.svg`](diagrams/architecture_diagram.svg)

---

## 7. Sprint Roadmap & 3-Week Role Rotation Gantt Chart (Unit 9)
Visual timeline of the 8-week project showing Sprints 1, 2, and 3, key unit deliverables, and the rotational assignment of Project Manager, Lead Developer, QA Lead, Documentation Lead, and Architecture Lead across Group 2.

```mermaid
gantt
    title HostelEase - 8-Week Sprint Schedule & Milestones (Unit 9)
    dateFormat  YYYY-MM-DD
    section Sprint 1
    Project Charter & SRS (Unit 2, 3)        :done, s1_1, 2026-09-01, 2026-09-10
    UML Modeling & Architecture (Unit 4, 5)  :done, s1_2, 2026-09-11, 2026-09-17
    Database Schema & Express Setup (Unit 6) :done, s1_3, 2026-09-15, 2026-09-21
    section Sprint 2
    15-Min Concurrency Lock Engine (Unit 6)  :done, s2_1, 2026-09-22, 2026-10-01
    Paystack Sandbox & SMS Dispatch (Unit 5) :done, s2_2, 2026-10-02, 2026-10-08
    Tailwind UI & Admin CRUD Panel (Unit 6)  :done, s2_3, 2026-10-05, 2026-10-12
    section Sprint 3
    Automated Jest Testing Suite (Unit 7)    :done, s3_1, 2026-10-13, 2026-10-19
    Security Hardening & Refactoring (Unit 8):done, s3_2, 2026-10-17, 2026-10-23
    Final Demo & Presentation Prep (Unit 9)  :done, s3_3, 2026-10-21, 2026-10-26
```
*Vector Drawing File:* [`docs/diagrams/sprint_roadmap.svg`](diagrams/sprint_roadmap.svg)

---

## 8. Architectural Invariants & Data Integrity Guarantees (Unit 5)
*Authored by Database & Architecture Lead: Ibrahim Mohammed (Student ID: 5240101414)*

1. **Single-Occupancy Invariant:** No single room record in `rooms` shall simultaneously possess two active bookings (`status = 'PENDING'` or `'CONFIRMED'`).
2. **Lock Expiration Invariant:** Any temporary lock record where `lock_expires_at < CURRENT_TIMESTAMP` is treated as mathematically equivalent to `status = 'AVAILABLE'` by the concurrency service.
3. **Strategy Decoupling:** The `BookingService` interacts strictly through the `IPaymentGateway` abstraction, ensuring zero tight-coupling between checkout workflows and third-party vendor APIs.

