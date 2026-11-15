# HostelEase – Campus Hostel Booking & Allocation System
[![Repository](https://img.shields.io/badge/GitHub-RichardAmoakoKorang11a%2FHostelEase-blue.svg)](https://github.com/RichardAmoakoKorang11a/HostelEase)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)]()

> **Final Group Project Submission for Software Engineering (Units 1–10)**  
> **Repository:** [https://github.com/RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  
> **Group:** Group 2  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (Index No: `5240101411`)
2. **Adjei Douglas** (Index No: `5240101412`)
3. **Richard Amoako Korang** (Index No: `5240101413`) – Project Lead
4. **Ibrahim Mohammed** (Index No: `5240101414`)
5. **Sandra Otu** (Index No: `5240101415`)

---

## 📌 Executive Summary
Every academic semester, university students face massive challenges securing on-campus hostel accommodation, resulting in long queues, manual double-bookings, and payment fraud. **HostelEase** is an automated, web-based room reservation platform featuring:
- **Real-Time Room Inventory:** Up-to-date tracking of available bed spaces across university halls.
- **15-Minute Concurrency Lock:** Prevents race conditions and double-booking during room rush.
- **Cashless Payment Integration:** Supports Mobile Money (MoMo) and Card via the **Paystack Sandbox API**.
- **Automated Offline Tickets:** Instant confirmation ticket dispatched directly to the student's phone via an **SMS Sandbox Gateway**.

---

## 📚 Course Units Mapped to Implementation
This project systematically incorporates each unit from the Software Engineering curriculum:

| Unit # | Unit Title | Project Implementation / Artifact |
| :--- | :--- | :--- |
| **Unit 1** | **Introduction to SE** | System charter and campus problem statement. |
| **Unit 2** | **Process Models** | 8-week, 3-sprint Agile Scrum lifecycle with 3-week rotating roles. |
| **Unit 3** | **Requirements Engineering** | Complete IEEE 830 SRS (`docs/SRS.md`) with functional & non-functional requirements. |
| **Unit 4** | **UML Diagrams** | Use Case, Class, Sequence, and Activity diagrams (`docs/UML_DIAGRAMS.md`). |
| **Unit 5** | **Design Principles & Patterns** | MVC architecture, Strategy Pattern for Payment Gateways, Singleton DB pool. |
| **Unit 6** | **Construction & Development** | Node.js, Express, and SQLite relational database with atomic transactions. |
| **Unit 7** | **Testing & QA** | Automated Jest suite (`tests/booking.test.js`) testing concurrency & locks. |
| **Unit 8** | **Maintenance & Evolution** | Modular adapters for external APIs, database indexing, and caching. |
| **Unit 9** | **Project Management** | 3-sprint backlog, velocity tracking, and Risk Register (`docs/RISK_REGISTER_SPRINT_PLANS.md`). |
| **Unit 10**| **Emerging Trends** | Cloud-native readiness, containerization, and PWA mobile optimization. |

---

## 👥 Rotational Team Schedule (3-Week Cycles)
| Team Member | Index Number | Sprint 1 (Weeks 1–3) | Sprint 2 (Weeks 4–6) | Sprint 3 & Submission (Weeks 7–8) |
| :--- | :--- | :--- | :--- | :--- |
| **Richard Amoako Korang** | 5240101413 | Project Manager (PM) | Lead Developer | QA & Tester Lead |
| **Osei Sarfo Raphael** | 5240101411 | Lead Developer | DevOps & Security Lead | Project Manager (PM) |
| **Adjei Douglas** | 5240101412 | QA & Tester Lead | Documentation Lead | Lead Developer |
| **Ibrahim Mohammed** | 5240101414 | Database & Architecture Lead | QA & Tester Lead | Documentation Lead |
| **Sandra Otu** | 5240101415 | Documentation Lead | Project Manager (PM) | Frontend & Release Lead |

---

## 📁 Repository Structure
```text
HostelEase/
├── .env                          # Environment variables & API sandbox keys
├── package.json                  # Dependencies & test scripts
├── hostelease.db                 # SQLite database (auto-generated)
├── docs/
│   ├── SRS.md                    # IEEE 830 Software Requirements Specification
│   ├── UML_DIAGRAMS.md           # Mermaid UML Diagrams (Class, Sequence, etc.)
│   ├── RISK_REGISTER_SPRINT_PLANS.md # Risk matrix & Sprint 1-3 plans
│   └── PRESENTATION_AND_REFLECTIONS.md # 10-minute demo script & 5 reflections
├── public/
│   └── index.html                # Responsive Tailwind CSS frontend
├── src/
│   ├── server.js                 # Express application & API routing
│   ├── config/
│   │   └── database.js           # SQLite connection pool & seeding (Group 2 members)
│   ├── models/
│   │   └── schema.sql            # DDL database schema definitions
│   └── services/
│       ├── bookingService.js     # 15-minute concurrency lock & booking logic
│       ├── paymentGateway.js     # Paystack Sandbox Strategy Provider
│       └── smsService.js         # Twilio/Hubtel SMS Sandbox Provider
└── tests/
    └── booking.test.js           # Automated Jest test suite
```

---

## 🚀 Quickstart & Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Unit Tests (Unit 7)
Verify the race-condition prevention and concurrency lock:
```bash
npm test
```

### 3. Launch the Application
```bash
npm start
```
Open your browser and navigate to:  
👉 **`http://localhost:3000`**

---

## 🧪 Automated Testing Results
```text
PASS tests/booking.test.js
  Unit 7 QA: Concurrency & Booking Verification Suite
    ✓ TC-01: First student acquires the 15-minute bed lock (12 ms)
    ✓ TC-02: Simultaneous double-booking attempt is rejected (Concurrency Lock) (17 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        3.319 s
```

---

## 📄 License
This project is licensed under the MIT License.
