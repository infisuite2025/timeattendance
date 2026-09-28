# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 18. Quality Assurance & Test Automation Strategy

This document defines the comprehensive test strategy, automation frameworks, coverage targets, and test tiers for InfiTimePro.

---

### 1. Test Pyramid & Automation Frameworks

```
       / \
      / E2E \         Playwright (Web) & Flutter Driver (Mobile)
     /-------\
    /   API   \       Vitest / Supertest / OpenAPI Schemathesis
   /-----------\
  / Integration \     Testcontainers (MySQL 8 + Redis)
 /---------------\
/   Unit Tests    \   Vitest (TypeScript Domain Services) & Flutter Test (Dart)
-------------------
```

| Test Tier | Framework / Tool | Scope & Purpose | Coverage Target |
|---|---|---|---|
| **Unit Tests** | Vitest / Jest | Pure mathematical calculations, policy evaluation, duration math, timezone conversion. | > 95% |
| **Integration Tests** | Testcontainers + Vitest | Repository layer, tenancy query isolation, database migrations, Redis queue jobs. | > 85% |
| **API Contract Tests** | Supertest + Schemathesis | OpenAPI v3 specification conformance, RBAC/ABAC authorization guards, error codes. | 100% of endpoints |
| **Web E2E Tests** | Playwright | Full browser user journeys (Login, Dashboard, Regularisation, Approvals, Roster Gantt). | Core user journeys |
| **Mobile Widget & Flow Tests**| Flutter Test / Integration | Offline punch creation, SQLite sync, geofencing sensor mocking, BLoC state changes. | Core mobile flows |
| **Performance Benchmarks** | k6 / Artillery | Ingestion throughput (10,000 punches/sec), large tenant dashboard queries (<200ms). | Peak load verified |

---

### 2. Mandatory Core Automated Test Suites

1. **Tenancy Isolation Suite (`test/tenancy.spec.ts`)**:
   - Verify Tenant A cannot read or write Tenant B's employees, punches, shifts, or regularisations even with crafted direct IDs.
2. **Attendance Math & Grace Suite (`test/attendance-engine.spec.ts`)**:
   - Verify exact minute calculations for On-time, Grace-allowed, Late arrival, Half-day threshold, and Multi-break deductions.
3. **Cross-Midnight & DST Suite (`test/timezone-dst.spec.ts`)**:
   - Verify overnight shifts across UTC date transitions and daylight saving time forward/backward jumps.
4. **Approval State Machine Suite (`test/approvals.spec.ts`)**:
   - Verify linear and multi-tier approval flows, maker-checker prevention, and attendance day status updates upon approval.
5. **Period Finalisation Lock Suite (`test/finalisation.spec.ts`)**:
   - Verify locked periods reject regularisations and punch modifications.
