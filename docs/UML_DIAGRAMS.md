# UML Diagrams, Architecture & Visual Drawings
## Project: HostelEase – Campus Hostel Booking & Allocation System
**Course:** Software Engineering (Unit 4: UML Diagrams & Unit 5: Design Principles)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (`5240101411`)
2. **Adjei Douglas** (`5240101412`)
3. **Richard Amoako Korang** (`5240101413`) – Project Lead
4. **Ibrahim Mohammed** (`5240101414`)
5. **Sandra Otu** (`5240101415`)

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

*Direct Vector Graphic File:* [`docs/diagrams/use_case_diagram.svg`](diagrams/use_case_diagram.svg)  
![HostelEase UML Use Case Diagram](diagrams/use_case_diagram.svg)

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

*Direct Vector Graphic File:* [`docs/diagrams/class_diagram.svg`](diagrams/class_diagram.svg)  
![HostelEase UML Domain Class Diagram](diagrams/class_diagram.svg)

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

*Direct Vector Graphic File:* [`docs/diagrams/sequence_diagram.svg`](diagrams/sequence_diagram.svg)  
![HostelEase UML Sequence Diagram](diagrams/sequence_diagram.svg)

---

## 4. Activity & State Machine Diagram (Unit 4)
Models the lifecycle and state transitions of room inventory (`AVAILABLE` ➔ `LOCKED` ➔ `OCCUPIED`), including the automated **15-minute timeout rollback**.

*Direct Vector Graphic File:* [`docs/diagrams/activity_diagram.svg`](diagrams/activity_diagram.svg)  
![HostelEase UML Activity & State Machine Diagram](diagrams/activity_diagram.svg)

---

## 5. Relational Database Entity-Relationship (ER) Diagram (Unit 6)
Complete relational schema diagram with Primary Keys (`PK`), Foreign Keys (`FK`), Unique Keys (`UK`), and Crow's Foot cardinality notations connecting `USERS`, `HOSTELS`, `ROOMS`, `BOOKINGS`, and `PAYMENTS`.

*Direct Vector Graphic File:* [`docs/diagrams/er_diagram.svg`](diagrams/er_diagram.svg)  
![HostelEase Relational Database ER Diagram](diagrams/er_diagram.svg)

---

## 6. 3-Tier System Architecture Diagram (Unit 5 & 10)
Separation of concerns between Presentation Tier (Tailwind CSS UI & PWA pass), Application Server Tier (Express.js REST API & Concurrency Lock Engine), and Persistence & External Integration Tier (SQLite DB + Paystack + Twilio/Hubtel).

*Direct Vector Graphic File:* [`docs/diagrams/architecture_diagram.svg`](diagrams/architecture_diagram.svg)  
![HostelEase 3-Tier System Architecture Diagram](diagrams/architecture_diagram.svg)

---

## 7. Sprint Roadmap & 3-Week Role Rotation Gantt Chart (Unit 9)
Visual Gantt timeline of the 8-week project showing Sprints 1, 2, and 3, key unit deliverables, and the rotational assignment of Project Manager, Lead Developer, QA Lead, Documentation Lead, and Architecture Lead across Group 2.

*Direct Vector Graphic File:* [`docs/diagrams/sprint_roadmap.svg`](diagrams/sprint_roadmap.svg)  
![HostelEase Sprint Roadmap & Role Rotation Gantt](diagrams/sprint_roadmap.svg)
