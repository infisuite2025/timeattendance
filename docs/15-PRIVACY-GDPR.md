# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 15. Privacy, PII Classification & GDPR Compliance

This document outlines the data governance, personal data protection, and statutory compliance controls engineered into InfiTimePro.

---

### 1. Data Classification Schema

| Classification Level | Examples in InfiTimePro | Storage & Access Controls |
|---|---|---|
| **Public** | Tenant marketing branding, public API docs | Standard CDN caching |
| **Internal Business** | Shift definitions, holiday calendars, department names | Tenant-isolated database access |
| **Confidential** | Aggregate attendance KPIs, labor cost estimates | Role-restricted access (MGR, HR, TAD) |
| **Personally Identifiable (PII)** | Employee Name, Email, Phone, Employee ID, Avatars | Encrypted at rest, masked in logs, RBAC restricted |
| **Highly Sensitive / Biometric** | GPS coordinates, punch selfies, raw terminal IDs | AES-256 encrypted columns, never logged, strict retention |

---

### 2. GDPR Articles Implementation

- **Article 5 (Data Minimisation)**: InfiTimePro does not store raw biometric templates (e.g. fingerprint minutiae or facial feature vectors). Matching is performed locally on biometric hardware terminals.
- **Article 15 (Right of Access)**: Employees can export their full attendance history, punch logs, and regularisation submissions in structured JSON/PDF formats.
- **Article 16 (Right to Rectification)**: Realized via the audited **Regularisation Workflow**, allowing corrections with dual approvals and audit preservation.
- **Article 17 (Right to Erasure / Anonymization)**: Upon worker exit and expiration of statutory payroll retention periods (e.g. 7 years for tax authorities), PII fields are irreversibly anonymized (`first_name = 'ANONYMIZED'`, `email = 'anon_123@deleted.local'`) while preserving statistical sums.
