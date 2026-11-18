# Software Requirements Specification (SRS)
## Project: HostelEase – Campus Hostel Booking & Allocation System
**Course:** Software Engineering (Unit 3: Requirements Engineering)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (Index No: 5240101411)
2. **Adjei Douglas** (Index No: 5240101412)
3. **Richard Amoako Korang** (Index No: 5240101413) – Project Lead
4. **Ibrahim Mohammed** (Index No: 5240101414)
5. **Sandra Otu** (Index No: 5240101415)

---

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to specify the complete functional and non-functional requirements for the **HostelEase** web platform. HostelEase provides real-time room availability, bed-space concurrency locks, Paystack sandbox mobile money payments, and automated SMS tickets for university students.

### 1.2 Scope
- Automated room catalog with real-time status tracking (`AVAILABLE`, `LOCKED`, `OCCUPIED`).
- 15-minute concurrency lock to eliminate double-booking during room rushes.
- Cashless transaction processing using Paystack Sandbox API.
- Instant offline ticket confirmation dispatch via Twilio / Hubtel SMS Gateway.

---

## 2. Overall Description
### 2.1 Product Perspective
HostelEase operates as a modern cloud-ready MVC web application backed by an SQLite/PostgreSQL relational database. It communicates asynchronously with two external sandbox services:
1. **Paystack Sandbox:** Simulates Mobile Money and Debit Card authorization.
2. **SMS Sandbox:** Simulates GSM network delivery of physical allocation slips.

### 2.2 User Characteristics
- **Students:** Undergraduate/postgraduate students looking for verified hostel beds.
- **Hall Administrators / Porters:** Staff validating tickets at the hall entrance.

---

## 3. Specific Requirements

### 3.1 Functional Requirements (FR)
- **FR-01: Authentication:** The system shall authenticate students using their unique Student Index ID and securely hashed passwords.
- **FR-02: Room Directory & Filter:** The system shall display verified hostel rooms categorized by block, gender eligibility, and semester fees.
- **FR-03: Atomic Bed Reservation:** Upon selecting an available bed, the system shall apply a 15-minute temporary state lock (`LOCKED`) with an expiration timestamp.
- **FR-04: Expiration Rollback:** If payment is not completed within 15 minutes, the system shall automatically return the bed state to `AVAILABLE`.
- **FR-05: Sandbox Payment Integration:** The system shall generate a secure Paystack Sandbox authorization URL and listen for transaction callbacks.
- **FR-06: SMS Ticket Generation:** On payment confirmation, the system shall immediately transmit an SMS booking ticket containing the reference number and room allocation.

### 3.2 Non-Functional Requirements (NFR)
- **Performance:** System queries for room inventory shall execute within **<500ms** under a 100-user concurrency test.
- **Reliability & Consistency:** Zero double-bookings allowed. All reservation state transitions must execute within atomic database transactions.
- **Security:** Passwords salted with bcrypt. External webhook calls validated using HMAC-SHA512 token signatures.
- **Usability:** Fully responsive layout tested on viewports from 320px (mobile) to 1920px (desktop).

---

## 4. Requirements Traceability Matrix (RTM)
*Prepared by QA Lead: Adjei Douglas (Student ID: 5240101412) - Unit 3 & Unit 7*

| Req ID | Requirement Description | Verification Method | Automated Test ID | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Student authentication via Index ID & password | Automated / Unit | `TC-01` | **VERIFIED** |
| **FR-02** | Room directory filter by gender, location & fees | Automated / Integration | `TC-01`, `TC-05` | **VERIFIED** |
| **FR-03** | 15-minute concurrency bed lock reservation | Automated / Concurrency | `TC-01`, `TC-02` | **VERIFIED** |
| **FR-04** | Automatic release of expired reservation lock | Automated / Boundary | `TC-04` | **VERIFIED** |
| **FR-05** | Paystack sandbox payment authorization link | Automated / Mock Gateway | `TC-01`, `TC-03` | **VERIFIED** |
| **FR-06** | SMS allocation confirmation ticket dispatch | Automated / Mock SMS | `TC-03` | **VERIFIED** |
| **NFR-01** | Concurrency safety: Zero double-booking collision | Automated / Race-Condition | `TC-02` | **VERIFIED** |
| **NFR-02** | Invalid room input rejection & error boundaries | Automated / Boundary | `TC-05` | **VERIFIED** |

