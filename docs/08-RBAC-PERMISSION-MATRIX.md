# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 08. Role-Based & Attribute-Based Access Control (RBAC / ABAC)

This document establishes the fine-grained permission matrix across the 12 core enterprise personas in InfiTimePro.

---

### 1. Enterprise Personas

1. **`EMP`**: General Employee (Self-Service)
2. **`MGR`**: Team Manager / Reporting Supervisor
3. **`LHR`**: Location HR Officer
4. **`CHR`**: Corporate HR Director
5. **`ADM`**: Attendance Administrator (Timekeeper)
6. **`PAY`**: Payroll Administrator
7. **`DEV`**: Hardware & Biometric Device Administrator
8. **`INT`**: Integration & API Engineer
9. **`SEC`**: Security Officer / Compliance Auditor
10. **`TAD`**: Tenant Administrator (Full Org Scope)
11. **`PAD`**: Platform / Super Administrator (System Scope)
12. **`AUD`**: External Financial/Statutory Auditor (Read-Only)

---

### 2. Fine-Grained Permission Matrix

| Module / Action | Permission Key | EMP | MGR | LHR | CHR | ADM | PAY | DEV | INT | SEC | TAD | AUD |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Self-Service Attendance** | `self_service.attendance.view` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| **Mobile Clock In/Out** | `self_service.punch.create` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| **Raise Regularisation** | `regularisation.create` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| **Team Attendance View** | `team.attendance.view` | - | ✓ (Reports) | ✓ (Location) | ✓ (All) | ✓ (All) | ✓ (All) | - | - | ✓ (All) | ✓ (All) | ✓ (All) |
| **Live Attendance Stream** | `attendance.live.view` | - | ✓ (Reports) | ✓ (Location) | ✓ (All) | ✓ (All) | - | - | - | - | ✓ (All) | ✓ (All) |
| **Approve Regularisation** | `approvals.regularisation.action` | - | ✓ (Reports) | ✓ (Location) | ✓ (All) | ✓ (All) | - | - | - | - | ✓ (All) | - |
| **Approve Overtime** | `approvals.overtime.action` | - | ✓ (Reports) | ✓ (Location) | ✓ (All) | ✓ (All) | ✓ (Verify) | - | - | - | ✓ (All) | - |
| **Approve Shift Swap** | `approvals.shift_swap.action` | - | ✓ (Reports) | ✓ (Location) | ✓ (All) | ✓ (All) | - | - | - | - | ✓ (All) | - |
| **Manage Shifts & Library** | `shifts.manage` | - | - | ✓ (Location) | ✓ (All) | ✓ (All) | - | - | - | - | ✓ (All) | - |
| **Roster / Schedule Publish**| `schedule.publish` | - | ✓ (Team) | ✓ (Location) | ✓ (All) | ✓ (All) | - | - | - | - | ✓ (All) | - |
| **Attendance Exceptions Hub**| `exceptions.resolve` | - | ✓ (Team) | ✓ (Location) | ✓ (All) | ✓ (All) | - | - | - | - | ✓ (All) | - |
| **Biometric Device Config** | `devices.manage` | - | - | - | - | - | - | ✓ | - | - | ✓ (All) | - |
| **Raw Punch Logs View** | `time_events.raw.view` | - | - | ✓ (Location) | ✓ (All) | ✓ (All) | ✓ (All) | ✓ | ✓ | ✓ | ✓ (All) | ✓ (All) |
| **Period Finalisation & Lock**| `finalisation.lock` | - | - | - | ✓ | ✓ | ✓ | - | - | - | ✓ (All) | - |
| **Payroll Export Extraction**| `payroll.export` | - | - | - | ✓ | - | ✓ | - | - | - | ✓ (All) | ✓ (Read) |
| **API Keys & Webhooks** | `integrations.manage` | - | - | - | - | - | - | - | ✓ | - | ✓ (All) | - |
| **Audit Logs Inspection** | `audit.view` | - | - | - | ✓ | - | - | - | - | ✓ | ✓ (All) | ✓ (All) |

---

### 3. ABAC Contextual Scoping Engine

In addition to RBAC role assignment, access is dynamically constrained by Attribute-Based Access Control (ABAC):
- **Hierarchy Scope**: Evaluated via SQL recursive Common Table Expressions (`CTE`) on `tp_employees.reporting_manager_id`.
- **Location Scope**: User assigned to Location `LOC-HYD` is constrained to records where `location_id = 'LOC-HYD'` unless granted global enterprise scope.
- **Department Scope**: Constrained to user's assigned functional unit (`department_id`).
