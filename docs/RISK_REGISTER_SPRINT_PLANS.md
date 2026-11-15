# Sprint Plans & Risk Register
## Project: HostelEase
**Course:** Software Engineering (Unit 9: Software Project Management)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (Index No: 5240101411)
2. **Adjei Douglas** (Index No: 5240101412)
3. **Richard Amoako Korang** (Index No: 5240101413)
4. **Ibrahim Mohammed** (Index No: 5240101414)
5. **Sandra Otu** (Index No: 5240101415)

---

## 1. Rotational Team Structure (3-Week Cycle)
To meet the course requirement of rotating roles every 3 weeks among all team members:

| Team Member | Index Number | Sprint 1 (Weeks 1–3) | Sprint 2 (Weeks 4–6) | Sprint 3 & Submission (Weeks 7–8) |
| :--- | :--- | :--- | :--- | :--- |
| **Richard Amoako Korang** | 5240101413 | Project Manager (PM) | Lead Developer | QA & Tester Lead |
| **Osei Sarfo Raphael** | 5240101411 | Lead Developer | DevOps & Security Lead | Project Manager (PM) |
| **Adjei Douglas** | 5240101412 | QA & Tester Lead | Documentation Lead | Lead Developer |
| **Ibrahim Mohammed** | 5240101414 | Database & Architecture Lead | QA & Tester Lead | Documentation Lead |
| **Sandra Otu** | 5240101415 | Documentation Lead | Project Manager (PM) | Frontend & Release Lead |

---

## 2. Sprint Plans

### Sprint 1 (Weeks 1–3): System Foundation & Database Architecture
- **Sprint Goal:** Establish repository, SRS, SQLite relational schema, and student authentication endpoints.
- **Velocity:** 18 Story Points.
- **Completed Deliverables:**
  - Git repository structure with branching rules (`main`, `dev`, `feature/*`).
  - IEEE 830 SRS document and UML Use Case/Class models.
  - Relational schema (`schema.sql`) and database initialization script (`database.js`).
  - Room listing REST API endpoint (`GET /api/rooms`).

### Sprint 2 (Weeks 4–6): Core Reservation Engine & Sandbox Integrations
- **Sprint Goal:** Implement the 15-minute concurrency lock, Paystack Sandbox checkout, and Twilio SMS dispatch.
- **Velocity:** 24 Story Points.
- **Completed Deliverables:**
  - Atomic room locking service (`POST /api/bookings/reserve`).
  - Integration with Paystack Sandbox payment gateway (`paymentGateway.js`).
  - Automated SMS confirmation service (`smsService.js`).
  - Interactive web UI displaying room availability cards and modal checkout.

### Sprint 3 (Weeks 7–8): Quality Assurance, Security Hardening & Release
- **Sprint Goal:** Execute automated unit/integration tests, eliminate race conditions, finalize deployment documentation.
- **Velocity:** 16 Story Points.
- **Completed Deliverables:**
  - Automated Jest test suite testing concurrency locks and double-booking prevention.
  - Exception handling for sandbox latency and network timeouts.
  - 10-minute presentation slides, video demonstration script, and individual reflections.

---

## 3. Project Risk Register

| Risk ID | Risk Description | Severity | Likelihood | Impact | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Race condition causes duplicate allocation of a single bed space during rush. | High | Medium | Critical | Enforce atomic database transaction locks (`UPDATE rooms SET status='LOCKED' WHERE status='AVAILABLE'`). | Osei Sarfo Raphael / Richard |
| **RSK-02** | External Paystack Sandbox API rate limits or experiences network latency during testing. | Medium | Low | Medium | Implemented a resilient fallback mock gateway toggleable inside `paymentGateway.js`. | Adjei Douglas |
| **RSK-03** | Team member communication bottlenecks during 3-week role handovers. | Medium | Medium | Medium | Daily asynchronous standups on GitHub Discussions; automated Jira/GitHub project boards. | Sandra Otu / Richard |
| **RSK-04** | SMS Sandbox quota depletion during end-to-end integration tests. | Low | Medium | Low | SMS service prints formatted receipts directly to console as backup logging. | Ibrahim Mohammed |
