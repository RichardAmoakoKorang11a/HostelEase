# Presentation Outline & Individual Reflections
## Project: HostelEase
**Course:** Software Engineering (Units 1–10)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Osei Sarfo Raphael** (Index No: 5240101411)
2. **Adjei Douglas** (Index No: 5240101412)
3. **Richard Amoako Korang** (Index No: 5240101413)
4. **Ibrahim Mohammed** (Index No: 5240101414)
5. **Sandra Otu** (Index No: 5240101415)

---

## Part 1: 10-Minute Final Presentation & Demo Script (5 Team Members)

| Time Slot | Slide / Topic | Content & Key Talking Points | Presenter |
| :--- | :--- | :--- | :--- |
| **0:00 - 2:00** | **Slide 1–2: Problem & Vision** | The annual campus hostel rush problem: overcrowding, manual queues, and payment fraud. Overview of the HostelEase vision. | **Richard Amoako Korang** (5240101413) |
| **2:00 - 4:00** | **Slide 3–4: Architecture & Design** | Walkthrough of IEEE 830 SRS (Unit 3), UML Class and Sequence diagrams (Unit 4), MVC & Strategy pattern (Unit 5). | **Sandra Otu** (5240101415) |
| **4:00 - 6:30** | **Slide 5–6: LIVE SYSTEM DEMO** | Live execution: Room selection, 15-minute concurrency lock countdown, Paystack Sandbox Mobile Money payment, SMS ticket generation. | **Osei Sarfo Raphael** (5240101411) |
| **6:30 - 8:30** | **Slide 7–8: Testing & QA** | Running Jest tests live (`npm test`), explaining race-condition prevention, equivalence partitioning, and boundary testing (Unit 7). | **Adjei Douglas** (5240101412) |
| **8:30 - 10:00** | **Slide 9–10: Project Management & Trends** | Sprint velocity, 3-week role rotation, Risk Register mitigation (Unit 9), and Cloud/PWA readiness (Unit 10). Q&A handoff. | **Ibrahim Mohammed** (5240101414) |

---

## Part 2: Individual One-Page Reflections (Linked to Course Units)

### Member 1: Osei Sarfo Raphael (Index No: 5240101411)
**Assigned Roles:** Lead Developer (Sprint 1), DevOps & Security Lead (Sprint 2), Project Manager (Sprint 3)  
**Course Units Linked:** **Unit 5 (Software Design Principles & Patterns)** & **Unit 6 (Software Construction & Development)**  

> *"Architecting and developing HostelEase provided profound practical experience in object-oriented software construction (Unit 6) and enterprise design patterns (Unit 5). Initially, our payment logic was tightly coupled with our database transactions. Utilizing the Strategy Pattern allowed us to abstract the payment gateway into an interchangeable interface (`PaymentGateway`), enabling instant toggling between Paystack Sandbox and local mock providers without altering any reservation code. Furthermore, applying the Single Responsibility Principle (SRP) across our service layer prevented the database connection pooling from leaking into HTTP controllers. Rotating to Project Manager in Sprint 3 demonstrated how rigorous software construction standards early in the project dramatically reduced integration friction and bug remediation in the final release."*

---

### Member 2: Adjei Douglas (Index No: 5240101412)
**Assigned Roles:** QA & Tester Lead (Sprint 1), Documentation Lead (Sprint 2), Lead Developer (Sprint 3)  
**Course Units Linked:** **Unit 3 (Requirements Engineering)** & **Unit 7 (Software Testing & Quality Assurance)**  

> *"My tenure as Quality Assurance Lead illuminated the direct correlation between Requirements Engineering (Unit 3) and Software Testing (Unit 7). Ambiguities in functional requirements invariably produce untestable software. We formulated an exhaustive test matrix covering equivalence partitioning and boundary value analysis based on our IEEE 830 user stories. My most rewarding technical achievement was authoring the automated Jest test suite that fires simultaneous reservation requests against a single room; observing the second request cleanly throw an `ERR_ROOM_UNAVAILABLE` error proved our concurrency locking logic was airtight. Stepping into the Lead Developer role in Sprint 3, having written the tests first gave me complete confidence to refactor database lock queries without introducing regressions."*

---

### Member 3: Richard Amoako Korang (Index No: 5240101413)
**Assigned Roles:** Project Manager (Sprint 1), Lead Developer (Sprint 2), QA & Tester Lead (Sprint 3)  
**Course Units Linked:** **Unit 2 (Software Development Process Models)** & **Unit 9 (Software Project Management)**  

> *"Serving as Project Manager during the initial sprint demonstrated the tangible superiority of the Agile Scrum methodology (Unit 2) compared to rigid sequential models. In an 8-week cycle with evolving requirements, external sandbox APIs (Paystack and SMS gateways) frequently required schema adaptations. Had we followed a Waterfall approach, integration would have been delayed until the final weeks, leaving zero recovery time for sandbox callback failures. Managing our GitHub Projects board, monitoring team velocity, and maintaining the Risk Register (Unit 9) taught me that clear communication and proactive risk mitigation are just as crucial as writing clean code. When I rotated into the Lead Developer role in Sprint 2, the sprint backlog allowed me to implement our 15-minute concurrency lock with crystal-clear acceptance criteria."*

---

### Member 4: Ibrahim Mohammed (Index No: 5240101414)
**Assigned Roles:** Database & Architecture Lead (Sprint 1), QA & Tester Lead (Sprint 2), Documentation Lead (Sprint 3)  
**Course Units Linked:** **Unit 1 (Introduction to Software Engineering)** & **Unit 8 (Software Maintenance & Evolution)**  

> *"Building HostelEase reinforced that software engineering is a disciplined engineering endeavor rather than mere ad-hoc programming (Unit 1). Designing the normalized relational schema and enforcing foreign key referential integrity prevented catastrophic data anomalies. During Sprint 3, as we analyzed maintenance strategies (Unit 8), we designed the system for all four maintenance categories: corrective (fixing clock drift on lock expirations), adaptive (modular API adapters for future payment gateways), perfective (adding room media assets), and preventive (database index tuning for high-concurrency room rushes). Creating structured technical documentation ensured that any new engineer can onboard and maintain HostelEase without architectural degradation."*

---

### Member 5: Sandra Otu (Index No: 5240101415)
**Assigned Roles:** Documentation Lead (Sprint 1), Project Manager (Sprint 2), Frontend & Release Lead (Sprint 3)  
**Course Units Linked:** **Unit 4 (UML Diagrams)** & **Unit 10 (Emerging Trends in Software Engineering)**  

> *"Developing the UML diagrams (Unit 4) taught me that visual system modeling serves as the vital architectural blueprint of software engineering. Constructing the Sequence Diagram was instrumental in coordinating our frontend state transitions with asynchronous Paystack webhooks and SMS gateways. When I rotated into the Project Manager role in Sprint 2, the UML Use Case and Activity diagrams served as the single source of truth during sprint planning. In Sprint 3, addressing Unit 10 (Emerging Trends), I evaluated progressive web app (PWA) caching and containerization strategies to ensure students with unstable campus Wi-Fi can still present their digital allocation slips offline to hall porters. This project provided an invaluable end-to-end perspective on the entire software lifecycle."*
