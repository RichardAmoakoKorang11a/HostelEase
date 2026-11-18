# Software Test Plan & QA Execution Results
## Project: HostelEase – Campus Hostel Booking & Allocation System
**Standard:** IEEE 829 Standard for Software and System Test Documentation  
**Course:** Software Engineering (Unit 7: Software Testing & Quality Assurance)  
**Repository:** [RichardAmoakoKorang11a/HostelEase](https://github.com/RichardAmoakoKorang11a/HostelEase)  

### Team Roster (Group 2):
1. **Adjei Douglas** (Index No: `5240101412`) – QA & Testing Lead (Author)
2. **Richard Amoako Korang** (Index No: `5240101413`) – Project Lead
3. **Osei Sarfo Raphael** (Index No: `5240101411`) – Lead Developer
4. **Ibrahim Mohammed** (Index No: `5240101414`) – Architecture Lead
5. **Sandra Otu** (Index No: `5240101415`) – Documentation & Release Lead

---

## 1. Test Plan Overview & Objectives
The primary objective of this test plan is to rigorously verify the functional correctness, concurrency safety, and system resilience of **HostelEase**. The testing methodology focuses on:
- **Concurrency & Race Conditions:** Guaranteeing that simultaneous reservation requests for the same room bed space can never result in a double-booking.
- **Boundary Value Analysis:** Validating that the 15-minute temporary reservation lock automatically expires and returns the room to available status.
- **Integration Reliability:** Verifying that Paystack mobile money sandbox callbacks reliably trigger booking status updates and trigger offline SMS ticket dispatch.
- **Error Handling & Input Sanitation:** Ensuring that non-existent IDs, missing fields, or duplicate requests fail gracefully with descriptive HTTP status codes.

---

## 2. Test Environment & Tools
- **Test Runner / Framework:** Jest v29.7.0
- **Runtime Environment:** Node.js v24.18.0
- **Database:** SQLite 3.45+ (Memory & Disk pool)
- **Execution Script:** `npm test`
- **Target Test File:** `tests/booking.test.js`

---

## 3. Test Cases Specification

### 3.1 Automated Test Cases (`tests/booking.test.js`)

| Test ID | Test Category | Description / Precondition | Test Steps / Action | Expected Result | Automated Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Functional / Unit | First student books an available room. | `reserveBedSpace(userId=1, roomId=1)` | Room status changes to `LOCKED`; reference starts with `HE-`; lock expiration set to 15 mins. | **PASS (10 ms)** |
| **TC-02** | Concurrency / Race | Two students attempt to lock the same room simultaneously. | Student 1 locks Room 1; Student 2 immediately calls `reserveBedSpace(userId=2, roomId=1)`. | Student 1 acquires lock; Student 2 call rejects with `ERR_ROOM_UNAVAILABLE`. Zero double-bookings. | **PASS (20 ms)** |
| **TC-03** | Integration / E2E | Student completes sandbox payment for a locked room. | Student locks Room 1; system calls `confirmPayment(reference)`. | Booking transitions to `CONFIRMED`; room status transitions to `OCCUPIED`; SMS gateway `sendSMS` is invoked. | **PASS (2 ms)** |
| **TC-04** | Boundary / Expiration | A reservation lock exceeds 15 minutes without payment. | Room 1 locked with timestamp in past (>15 mins ago); Student 2 calls `reserveBedSpace(userId=2, roomId=1)`. | Stale lock is overwritten; Student 2 successfully acquires new lock and new reference. | **PASS (1 ms)** |
| **TC-05** | Negative / Validation | Student attempts to reserve a non-existent room ID. | Call `reserveBedSpace(userId=1, roomId=999)` where Room 999 does not exist. | System cleanly throws `ERR_ROOM_UNAVAILABLE` without crashing or corrupting memory. | **PASS (1 ms)** |

### 3.2 Manual & UI Verification Test Cases

| Test ID | Test Category | Description | Verification Procedure | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-06** | UI / Responsive | Header Active Student Switcher | Open UI; change active student in header dropdown; verify selected user is sent in booking payload. | **PASS** |
| **TC-07** | Admin CRUD | Room Creation (`POST /api/rooms`) | Click "Add New Room"; fill hostel, room number, price; submit form; verify card renders in catalog. | **PASS** |
| **TC-08** | Admin CRUD | Room Modification (`PUT /api/rooms/:id`) | Click "Edit" on room; change price/capacity; save; verify card updates immediately. | **PASS** |
| **TC-09** | Admin CRUD | Room Deletion (`DELETE /api/rooms/:id`) | Click "Delete" on room; confirm prompt; verify room card is removed from inventory. | **PASS** |
| **TC-10** | Accessibility | Keyboard Navigation | Open booking modal; press `Escape` key; verify modal dismisses cleanly without console errors. | **PASS** |

---

## 4. Automated Test Suite Execution Log

```text
> hostelease@1.0.0 test
> jest tests/booking.test.js

PASS tests/booking.test.js
  Unit 7 QA: Concurrency & Booking Verification Suite
    √ TC-01: First student acquires the 15-minute bed lock (10 ms)
    √ TC-02: Simultaneous double-booking attempt is rejected (Concurrency Lock) (20 ms)
    √ TC-03: Paystack payment confirmation transitions status to CONFIRMED and sends SMS (2 ms)
    √ TC-04: Expired 15-minute lock allows subsequent student to acquire room (1 ms)
    √ TC-05: Non-existent room reservation attempt throws ERR_ROOM_UNAVAILABLE (1 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        1.714 s
Ran all test suites matching /tests\\booking.test.js/i.
```

---

## 5. Requirements Traceability Matrix (RTM)

| IEEE 830 Req ID | Requirement Description | Test Case ID | Test Result |
| :--- | :--- | :--- | :--- |
| **FR-01** | Student authentication & identity verification | `TC-01`, `TC-06` | **VERIFIED** |
| **FR-02** | Room inventory search, filtering & availability | `TC-01`, `TC-07`, `TC-08` | **VERIFIED** |
| **FR-03** | 15-minute atomic reservation locking | `TC-01`, `TC-02` | **VERIFIED** |
| **FR-04** | Expiration rollback for abandoned locks | `TC-04` | **VERIFIED** |
| **FR-05** | Paystack sandbox mobile money integration | `TC-01`, `TC-03` | **VERIFIED** |
| **FR-06** | SMS offline confirmation ticket dispatch | `TC-03` | **VERIFIED** |
| **NFR-01** | Concurrency safety (Zero race-condition duplicate beds) | `TC-02` | **VERIFIED** |
| **NFR-02** | Boundary error handling for non-existent IDs | `TC-05` | **VERIFIED** |

---

## 6. QA Sign-Off & Verdict
- **Total Test Cases Executed:** 10 (5 Automated + 5 Manual UI)
- **Passed:** 10 (100%)
- **Failed:** 0 (0%)
- **Blocked:** 0 (0%)
- **Verdict:** **PASSED FOR RELEASE (Week 8 Submission Quality Ready)**  
*Signed: Adjei Douglas (QA & Testing Lead, Index: 5240101412)*

