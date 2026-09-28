# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 04. Domain Model & Ubiquitous Language

This document specifies the Domain-Driven Design (DDD) architecture for InfiTimePro, detailing Aggregates, Entities, Value Objects, Domain Events, and State Machines.

---

### 1. Ubiquitous Language & Core Concepts

- **Tenant**: An isolated organizational subscription boundary in InfiTimePro.
- **Worker / Employee**: An individual subject to workforce scheduling and attendance tracking.
- **Raw Time Event (Punch)**: An immutable record of physical or digital clock-in/out telemetry.
- **Normalized Punch**: A sanitized, chronologically ordered, deduplicated time event mapped to a business punch classification.
- **Shift**: A scheduled operational time block defining start, end, grace windows, break durations, and overtime thresholds.
- **Roster / Schedule**: The planned assignment of shifts to workers over calendar dates.
- **Attendance Day**: The calculated daily record of presence, hours, break deductions, status, and compliance.
- **Attendance Exception**: An identified divergence between scheduled expectations and actual normalized events.
- **Regularisation**: An audited employee request and approval transaction that rectifies an attendance exception.
- **Approval Instance**: An active step-by-step workflow evaluating a pending workforce request.
- **Finalised Period**: An immutable, cryptographically sealed attendance period ready for payroll consumption.

---

### 2. Domain Aggregates & Entities

```mermaid
classDiagram
    class TenantAggregate {
        +TenantId id
        +String name
        +TenantStatus status
        +TenantSettings settings
        +createCompany()
        +configurePolicy()
    }

    class WorkforceAggregate {
        +EmployeeId id
        +TenantId tenantId
        +String employeeCode
        +ProfileInfo profile
        +EffectiveAssignments assignments
        +assignShift()
        +updateManager()
    }

    class TimeEventAggregate {
        +EventId id
        +TenantId tenantId
        +EmployeeId employeeId
        +DateTime timestampUtc
        +Timezone tz
        +EventType type
        +EventSource source
        +GeoCoordinate coordinates
        +validateImmutability()
    }

    class AttendanceDayAggregate {
        +AttendanceDayId id
        +TenantId tenantId
        +EmployeeId employeeId
        +Date date
        +ShiftId shiftId
        +DayStatus status
        +Duration grossDuration
        +Duration breakDuration
        +Duration netDuration
        +Duration overtimeDuration
        +List~PunchEvent~ punches
        +List~ExceptionId~ exceptions
        +calculateAttendance()
        +reprocess()
    }

    class ShiftAggregate {
        +ShiftId id
        +TenantId tenantId
        +String code
        +String name
        +ShiftTiming timing
        +GracePolicy grace
        +BreakPolicy breaks
        +OvertimePolicy overtime
        +versionShift()
    }

    class ApprovalAggregate {
        +WorkflowId id
        +RequestId requestId
        +RequestType type
        +WorkflowState state
        +List~ApprovalStep~ steps
        +approve()
        +reject()
        +sendBack()
    }

    TenantAggregate "1" --> "*" WorkforceAggregate
    WorkforceAggregate "1" --> "*" TimeEventAggregate
    WorkforceAggregate "1" --> "*" AttendanceDayAggregate
    AttendanceDayAggregate "1" --> "1" ShiftAggregate
    AttendanceDayAggregate "1" --> "*" ApprovalAggregate
```

---

### 3. Value Objects

1. **`TenantId` / `EmployeeId` / `ShiftId`**: Strongly typed UUIDv7 identifiers.
2. **`GeoCoordinate`**: `{ latitude: number, longitude: number, accuracyMeters: number }`.
3. **`TimeWindow`**: `{ startUtc: DateTime, endUtc: DateTime, timezone: IANATimezone }`.
4. **`GracePolicy`**: `{ lateInMinutes: number, earlyOutMinutes: number, monthlyGraceLimit: number }`.
5. **`BreakPolicy`**: `{ totalDurationMinutes: number, isPaid: boolean, autoDeductThresholdMinutes: number }`.
6. **`WorkHoursSummary`**: `{ gross: Minutes, break: Minutes, net: Minutes, regular: Minutes, overtime: Minutes, shortfall: Minutes }`.

---

### 4. Domain Events

| Domain Event | Trigger Condition | Consuming Subsystems |
|---|---|---|
| `RawPunchReceivedEvent` | Device or mobile app transmits a clock event | Ingestion Hub, Idempotency Validator, Real-time Stream |
| `PunchNormalizedEvent` | Raw punch verified and deduplicated | Shift Matching Engine, Exception Detector |
| `AttendanceCalculatedEvent` | Daily calculation pipeline completes | Command Centre Analytics, Live Roster, Exception Hub |
| `AttendanceExceptionRaisedEvent` | Missing punch, late arrival, or shortfall detected | Notification Engine, Manager Alert Drawer |
| `RegularisationSubmittedEvent` | Employee submits correction with attachment | Approval Workflow Engine, Email/Push Dispatcher |
| `ApprovalStepCompletedEvent` | Manager or HR approves/rejects/sends back request | State Machine, Attendance Reprocessing Engine |
| `PeriodFinalisedEvent` | Admin locks pay period | Cryptographic Ledger, Payroll Handoff Exporter |

---

### 5. Core State Machines

#### A. Attendance Day Status State Machine
```mermaid
stateDiagram-v2
    [*] --> Scheduled
    Scheduled --> InProgress : First In Punch Recorded
    InProgress --> Evaluated : Shift Window Closed
    Evaluated --> ExceptionPending : Anomaly Detected (Late/Missing/Short)
    Evaluated --> NormalPresent : Rules Satisfied
    ExceptionPending --> RegularisationRequested : Employee Submits Correction
    RegularisationRequested --> ApprovedPresent : Manager Approves Request
    RegularisationRequested --> RejectedAbsent : Manager Rejects Request
    NormalPresent --> Finalised : Period Locked
    ApprovedPresent --> Finalised : Period Locked
    RejectedAbsent --> Finalised : Period Locked
```

#### B. Approval Workflow State Machine
```mermaid
stateDiagram-v2
    [*] --> Submitted
    Submitted --> PendingManager : Routed to Direct Supervisor
    PendingManager --> PendingHR : Manager Approves (if multi-tier)
    PendingManager --> SentBack : Manager Requests Clarification
    PendingManager --> Rejected : Manager Denies
    PendingHR --> Approved : HR Approves
    PendingHR --> Rejected : HR Denies
    SentBack --> Submitted : Employee Edits & Resubmits
    Approved --> [*]
    Rejected --> [*]
```
