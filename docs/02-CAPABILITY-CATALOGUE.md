# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 02. Capability Catalogue & Domain Specifications

This document defines the functional capabilities across all 25 core domains of the InfiTimePro platform, detailing enterprise business logic, operational constraints, and architectural behavior.

---

### Domain 1: Multi-Tenancy & SaaS Governance
- **Logical Data Isolation**: Strict partition of all entities by `tenant_id` with database-level composite unique indexes and gateway tenant validation.
- **Tenant Hierarchy**: Multi-company, multi-legal entity, division, department, branch, location, and team hierarchy.
- **Tenant Lifecycle Management**: Automated state machines supporting *Trial*, *Active*, *Suspended*, *Delinquent*, *Archived*, and *Decommissioned*.
- **Tenant Customization**: Configurable subdomain/custom domain, company logos, primary brand colors, date formats (`DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`), standard working hours, and time formatting (12h AM/PM vs 24h).
- **Subscription & Entitlements**: Feature gating by SaaS tier (e.g. Geofencing, Facial Recognition, Advanced Analytics, Custom Integrations).

---

### Domain 2: Identity, Access & Session Management
- **Authentication Protocols**: Local password authentication (Argon2id hashing), Email OTP, Authenticator App (TOTP / RFC 6238), SAML 2.0, and OAuth 2.0 / OIDC (Microsoft Entra ID, Google Workspace).
- **Security Safeguards**: Brute-force protection, exponential lockout delays, mandatory password rotation rules, and session invalidation across devices.
- **Role-Based & Attribute-Based Access Control (RBAC + ABAC)**: Granular permission assignments combining role privileges with contextual organizational attributes (department scope, location scope, direct-report tree depth).

---

### Domain 3: Workforce & Employee Profile Management
- **Worker Classification**: Support for Full-Time, Part-Time, Contractor, Daily Wage, Intern, Consultant, and Agency Workers.
- **Effective-Dated Profiles**: Track assignments for Department, Location, Reporting Manager, Shift Group, Attendance Policy, and Overtime Eligibility over time without overwriting historical records.
- **Biometric & Device Mappings**: Map physical biometric terminal IDs, card/RFID numbers, and mobile device identifiers (`device_uuid`, `push_token`) to employee records.

---

### Domain 4: Time Event Ingestion & Hardware Abstraction
- **Multi-Source Ingestion Engine**: Real-time punch ingestion via Biometric ADMS (Push), Pull API, Face Recognition terminals, RFID cards, Mobile App, Web Portal, Geofence Kiosks, and CSV/Excel batches.
- **Idempotency & Deduplication**: Cryptographic hashing of event payload (`SHA-256(tenant_id + employee_id + timestamp + source)`) to instantly reject duplicate network transmissions.
- **Hardware Abstraction Layer (HAL)**: Adapter pattern enabling seamless integration with hardware vendors (ZKTeco, Suprema, HID, Matrix, Hikvision, Dahua) without modifying core domain logic.
- **Secure Local Connector**: On-premises daemon for enterprise intranet terminals transmitting outbound encrypted TLS telemetry to InfiTimePro Cloud.

---

### Domain 5: Attendance Processing & Calculation Engine
- **Event Normalization**: Convert multi-source raw punches into standardized chronological punch events (IN, OUT, BREAK_OUT, BREAK_IN).
- **Shift Matching**: Dynamic resolution of applicable shift schedule taking into account assigned rosters, rotational patterns, auto-shift detection windows, and cross-midnight boundaries.
- **Mathematical Calculation Engine**:
  - Gross Duration = $\sum (\text{OUT}_i - \text{IN}_i)$
  - Break Duration = $\sum (\text{BREAK\_IN}_j - \text{BREAK\_OUT}_j)$
  - Net Work Hours = $\text{Gross Duration} - \text{Unpaid Break Duration}$
  - Overtime Duration = $\max(0, \text{Net Work Hours} - \text{Shift Expected Hours})$
  - Shortfall Duration = $\max(0, \text{Shift Expected Hours} - \text{Net Work Hours})$
- **Decision Explainability Engine**: Generation of step-by-step mathematical proof audits accompanying every processed day record (`tp_attendance_calculations`).

---

### Domain 6: Configurable Policy & Rules Engine
- **Attendance Status Evaluation**: Configurable thresholds for *Present*, *Half-Day*, *Absent*, *Late Arrival*, *Early Departure*, and *Short Hours*.
- **Grace Period Engine**: Configurable late-in grace (e.g. 15 mins), early-out grace, and grace accumulation rules (e.g. 3 grace instances per month before salary/leave deduction).
- **Break Management**: Flexible vs Fixed breaks, paid vs unpaid breaks, mandatory minimum meal breaks, and auto-break deduction when punches are missing.
- **Effective-Dated Policies**: Policies maintain `version_id`, `effective_from`, and `effective_to`.

---

### Domain 7: Shift Management & Rostering
- **Shift Library**: Creation and configuration of Fixed, Flexible, Rotational, Night, Cross-Midnight, Split, and Field Shifts.
- **Shift Groups & Patterns**: Configuration of cyclical rotational schedules (e.g. 2 Days Morning $\to$ 2 Days Evening $\to$ 2 Days Night $\to$ 2 Days Off).
- **Interactive Visual Roster**: Gantt-style matrix for assigning shifts, viewing coverage rates (e.g. 92%), identifying open/unassigned slots, copying prior week rosters, and publishing live schedules.
- **Shift Swap & Change Requests**: Peer-to-peer shift exchange with automated conflict checks (skill requirements, overtime risk, rest-period compliance) and manager approval workflows.

---

### Domain 8: Attendance Exceptions & Anomalies Hub
- **Automated Anomaly Detection**:
  - Missing In / Missing Out punches.
  - Excessive work duration ($>12\text{h}$).
  - Punch on approved leave or national holiday.
  - Impossible travel velocity between distant biometric terminals.
  - Geofence boundary breaches.
  - Offline sync discrepancies and device clock drifts.
- **Exception Resolution Lifecycle**: Open $\to$ In Progress $\to$ Under Review $\to$ Resolved $\to$ Rejected with full audit notes.

---

### Domain 9: Regularisation & Attendance Rectification
- **Employee Correction Requests**: Self-service submission for Missed Check-in, Missed Check-out, Time Adjustment, Full-Day/Half-Day Present, WFH, Field Duty, and Device Failure.
- **Dual-State Comparison**: Transparent side-by-side display of *Original System Record* vs *Requested Correction*.
- **Attachment Verification**: Upload and preview of supporting evidence (doctor slips, client meeting invites, travel tickets) in secure object storage.

---

### Domain 10: Multi-Tier Approval Workflow Engine
- **Configurable Hierarchy**: Linear sequential approvals (Employee $\to$ Manager $\to$ HR), parallel consensus, and conditional escalation based on exception severity or request type.
- **Maker-Checker Governance**: Prevents self-approval of requests and provides fallback delegation when managers are on leave.
- **Action Suite**: Approve, Reject, Send Back with mandatory comments, and Request Clarification.

---

### Domain 11: Overtime & Compensatory-Off (Comp-Off)
- **Overtime Calculation**: Daily OT, Weekly OT, Rest-Day OT, and Public Holiday OT multipliers.
- **Pre & Post Approval Modes**: Support for pre-scheduled OT planning and retroactive manager verification.
- **Comp-Off Ledger**: Credit/debit balance tracking, minimum qualifying threshold hours, expiration horizons (e.g. valid for 60 days), and leave encashment handoff.

---

### Domain 12: Period Finalisation & Payroll Handoff
- **Period Readiness Dashboard**: Real-time checklist identifying open exceptions, pending regularisations, and unassigned rosters.
- **Cryptographic Period Lock**: Lock attendance for a specific pay period, rendering all attendance days immutable for payroll export.
- **Payroll Input Extraction**: Export of standardized pay units: Total Present Days, Paid Days, Loss of Pay (LOP) Days, Overtime Hours, Night Shift Units, Late Penalty Units, and Allowance Units.
- **Integration Adapters**: Direct export to ADP, Workday, SAP SuccessFactors, QuickBooks, Gusto, or generic CSV/Excel/JSON webhooks.

---

### Domain 13: Mobile Attendance & Geofencing Hub
- **Flutter Native Experience**: iOS and Android mobile apps with biometric authentication (FaceID / Fingerprint) and offline-first SQLite synchronization.
- **Geofence Engine**: Circular and polygonal boundary validation, Wi-Fi BSSID matching, Bluetooth BLE beacon verification, and GPS mock-location detection.
- **Selfie Verification**: Optional facial capture and liveness detection during remote/field punches.

---

### Domain 14: Enterprise Reporting & Business Intelligence
- **Standardized Reports**: Daily Attendance Register, Monthly Muster Roll, Late/Early Trend, Overtime Analysis, Missing Punch Audit, Exception Summary, and Device Reliability.
- **Custom Report Builder**: Drag-and-drop column selector, grouping, aggregation formulas, scheduled email generation, and PDF/XLSX export.

---

### Domain 15: Audit Trail & Compliance
- **Immutable System Log**: Full forensic audit logging capturing `who`, `when`, `tenant_id`, `ip_address`, `device_id`, `action`, `entity`, `previous_state`, `new_state`, and `correlation_id`.
- **GDPR & Privacy Controls**: Data retention policies, right to rectification, automated anonymization upon worker exit, and encrypted PII storage.
