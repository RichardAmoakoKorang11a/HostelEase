# UML Diagrams & Software Architecture
## Project: HostelEase
**Course:** Software Engineering (Unit 4: UML Diagrams & Unit 5: Design Principles)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)

---

## 1. Use Case Diagram
```mermaid
flowchart TD
    Student((Student))
    Admin((Hostel Admin))
    PaymentGW((Paystack Gateway))
    SMSGateway((SMS Sandbox))

    subgraph HostelEase System
        UC1[Register & Login]
        UC2[Browse & Filter Hostels]
        UC3[Reserve Bed Space]
        UC4[Initiate Sandbox Payment]
        UC5[Receive SMS Booking Slip]
        UC6[Manage Room Allocations]
        UC7[View Occupancy Analytics]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5

    Admin --> UC1
    Admin --> UC6
    Admin --> UC7

    UC4 -.->|«external»| PaymentGW
    UC5 -.->|«external»| SMSGateway
    UC3 -.->|«include»| UC4
```

---

## 2. Domain Class Diagram
```mermaid
classDiagram
    class User {
        +int id
        +String studentId
        +String fullName
        +String email
        +String phone
        +String role
        +register()
        +login()
    }

    class Hostel {
        +int id
        +String name
        +String campusLocation
        +String genderType
        +getAvailableRooms()
    }

    class Room {
        +int id
        +int hostelId
        +String roomNumber
        +int capacity
        +double pricePerSemester
        +String status
        +lockRoom(durationMinutes)
        +releaseLock()
    }

    class Booking {
        +int id
        +int userId
        +int roomId
        +String reference
        +String status
        +confirmBooking()
        +cancelBooking()
    }

    class Payment {
        +int id
        +int bookingId
        +String reference
        +double amount
        +String channel
        +String status
        +verifySignature()
    }

    User "1" --> "0..*" Booking : places
    Hostel "1" *-- "1..*" Room : contains
    Room "1" <-- "0..*" Booking : targets
    Booking "1" -- "1" Payment : generates
```

---

## 3. Sequence Diagram (Booking & Sandbox Payment Flow)
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant WebClient as Frontend UI
    participant Server as Express API
    participant DB as SQLite DB
    participant Paystack as Paystack Sandbox
    participant SMS as SMS Gateway

    Student->>WebClient: Select Room & Click "Lock & Reserve Bed"
    WebClient->>Server: POST /api/bookings/reserve {userId, roomId}
    Server->>DB: Check room status & acquire Lock (status='LOCKED')
    DB-->>Server: Lock acquired (expires in 15 mins)
    Server->>Paystack: Initialize Transaction
    Paystack-->>Server: Return Checkout URL
    Server-->>WebClient: Return {reference, lockExpiresAt, paymentUrl}
    WebClient->>Student: Show 15-Minute Countdown & Sandbox Checkout Modal
    Student->>WebClient: Click "Pay with MoMo Sandbox"
    WebClient->>Server: POST /api/bookings/pay-sandbox {reference}
    Server->>DB: UPDATE Booking status='CONFIRMED', Room status='OCCUPIED'
    Server->>SMS: Dispatch SMS Ticket ("Booking Confirmed")
    SMS-->>Student: SMS delivered to student phone
    Server-->>WebClient: Return Confirmation Status
    WebClient->>Student: Display Confirmed Allocation Pass
```

---

## 4. Software Design Principles Applied (Unit 5)
1. **Model-View-Controller (MVC):** Business logic (`services/`), database persistence (`models/`), and presentation (`public/`) are strictly decoupled.
2. **Strategy Pattern for Payment Gateways:** Defined an abstract payment contract allowing effortless switching between Paystack, MTN MoMo Sandbox, or internal mock gateways.
3. **Singleton Pattern for Database Pool:** Centralized connection manager preventing port and handle starvation during high concurrency.
4. **Single Responsibility Principle (SRP):** `SMSService` only handles message delivery and formatting; it knows nothing of room locks or payment verification.

