# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 20. Gap Register & Architectural Decision Records (ADRs)

This document tracks identified system ambiguities, technical trade-offs, proposed resolutions, and formal Architectural Decision Records (ADRs).

---

### 1. Gap Register & Architectural Resolutions

| Gap ID | Item Description | Impact | Proposed Architectural Resolution | Decision Status |
|---|---|---|---|---|
| `GAP-001` | **Custom Database vs Legacy Precedent** | The prompt included construction management page catalogue text alongside InfiTimePro prompt. | **Resolved**: Strict adherence to the user's explicit instruction: *"please makesure the database_name and scehem etc, we should keep it ourown lets not use any previous database/scheme we will create our own"*. We created a pristine custom database named `infi_timepro_db` dedicated strictly to InfiTimePro Time & Attendance. | **APPROVED** |
| `GAP-002` | **Biometric Template Storage Location** | Storing raw fingerprint/face templates in cloud database risks severe privacy/GDPR liability. | **Resolved**: Biometric templates remain stored strictly inside physical edge hardware terminals. InfiTimePro cloud stores only alphanumeric employee biometric mapping IDs (`biometric_id`) and immutable punch telemetry. | **APPROVED** |
| `GAP-003` | **Cross-Midnight Attendance Attribution** | Night shifts (e.g. 22:00 to 06:00) produce punches on two distinct UTC calendar days. | **Resolved**: Invariant shift anchor binding. Punches within an overnight shift window are mapped to the shift's starting calendar date $D$, preserving single daily records in `tp_attendance_days`. | **APPROVED** |
| `GAP-004` | **Payroll Monetary Calculation Boundary** | Determining whether InfiTimePro computes net currency wages or strictly attendance time units. | **Resolved**: Clean separation of concerns. InfiTimePro computes and certifies time units (Paid Days, LOP Days, Regular Hours, Approved OT Minutes, Shift Allowance Units). Monetary wage computation is delegated to downstream Payroll systems via certified export adapters. | **APPROVED** |

---

### 2. Architectural Decision Records (ADRs)

#### ADR-001: Adoption of Shared Database Logical Tenancy for `infi_timepro_db`
- **Context**: Enterprise SaaS multi-tenancy requires balance between data isolation and operational maintenance.
- **Decision**: Adopt shared-database multi-tenancy where every table is partitioned by `tenant_id` with composite unique indexes, with repository-level query interceptors preventing accidental cross-tenant data leakage.
- **Consequences**: Enables cost-effective scaling and seamless schema migrations while maintaining enterprise data security.

#### ADR-002: Immutable Raw Punches with Compensating Regularisation Transactions
- **Context**: Workforce dispute resolution requires tamper-evident audit trails.
- **Decision**: `tp_raw_punches` records are strictly immutable. Any manual or approved correction creates an audited `tp_regularisation_requests` transaction linked to the attendance day without modifying original raw punch telemetry.
- **Consequences**: Guarantees forensic reproducibility for statutory labor compliance audits.
