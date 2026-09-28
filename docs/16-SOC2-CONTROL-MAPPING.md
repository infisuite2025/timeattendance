# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 16. SOC 2 Type II Control Mapping & Compliance

This document maps the technical controls within the InfiTimePro SaaS platform to the AICPA Trust Services Criteria for SOC 2 Type II readiness.

---

### 1. Trust Services Criteria Mapping

| SOC 2 Domain | InfiTimePro Technical Control Implementation | Audit Evidence Mechanism |
|---|---|---|
| **CC6.1 (Access Control)** | RBAC & ABAC engine, mandatory MFA for administrators, least-privilege scoping. | `tp_roles`, `tp_role_permissions`, JWT claim verification logs. |
| **CC6.6 (Boundary Protection)** | API Gateway rate limiting, WAF rules, CORS allowlisting, tenant isolation middleware. | Ingress access logs, rate-limit rejection counters. |
| **CC6.8 (Malware Defense)** | ClamAV / AWS GuardDuty virus scanning hook on regularisation attachment uploads. | Secure file upload validation logs in `tp_files`. |
| **CC7.2 (Anomaly Detection)** | Automated detection of impossible travel velocity, geofence breaches, and duplicate punches. | `tp_attendance_exceptions`, real-time alert logs. |
| **CC8.1 (Change Governance)** | Immutable audit logging across all shift assignments, policy versions, and period locks. | `tp_audit_logs` capturing `previous_state`, `new_state`, `actor_user_id`. |
| **A1.2 (Availability & Disaster Recovery)** | Multi-AZ MySQL replication, automated hourly snapshots, point-in-time recovery (PITR) to 5-minute RPO. | Cloud backup manifests, automated DR restore test reports. |
| **PI1.2 (Processing Integrity)** | Deduplication hashes on raw punches, atomic transactions on calculations, mathematical explainability proof generation. | `tp_attendance_days.calculation_audit_log` JSON proofs. |
