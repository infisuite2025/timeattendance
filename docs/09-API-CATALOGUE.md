# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 09. REST API Catalogue & OpenAPI Specifications

This document catalogs all core RESTful API endpoints under `/api/v1/*`, detailing HTTP verbs, request payloads, response structures, and error envelopes.

---

### 1. Standard API Conventions & Envelopes

#### Success Envelope (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1248,
    "totalPages": 125
  },
  "timestamp": "2026-09-14T17:20:00Z",
  "requestId": "req_01J7K8X9Y0Z1"
}
```

#### Error Envelope (`400`, `401`, `403`, `404`, `422`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "ERR_PUNCH_GEOFENCE_BREACH",
    "message": "Recorded punch coordinates fall outside permitted geofence perimeter.",
    "details": [
      {
        "field": "coordinates",
        "issue": "Distance to perimeter is 450 meters (Threshold: 100 meters)"
      }
    ]
  },
  "timestamp": "2026-09-14T17:20:00Z",
  "requestId": "req_01J7K8X9Y0Z1"
}
```

---

### 2. Core API Endpoint Catalogue

#### A. Authentication & User Profile
- `POST /api/v1/auth/login`: Authenticate with username/email and password.
- `POST /api/v1/auth/sso/callback`: Handle SAML / OAuth 2.0 IdP assertions.
- `POST /api/v1/auth/refresh`: Rotate refresh tokens and issue fresh access JWT.
- `POST /api/v1/auth/logout`: Invalidate current user session.
- `GET /api/v1/me/profile`: Retrieve authenticated employee profile, permissions, and tenant metadata.

#### B. Dashboard & Analytics
- `GET /api/v1/analytics/dashboard-summary`: Retrieve 8 real-time KPI metrics (`totalEmployees`, `presentCount`, `notArrivedCount`, `lateCount`, `onLeaveCount`, `wfhCount`, `fieldDutyCount`, `missingPunchCount`).
- `GET /api/v1/analytics/hourly-trend`: Retrieve hourly attendance breakdown (6 AM - 8 PM).
- `GET /api/v1/analytics/location-distribution`: Percentage and headcount breakdown by work location.
- `GET /api/v1/analytics/recent-punches`: Stream of latest 10 punches across the enterprise.
- `GET /api/v1/analytics/attention-required`: Aggregated count of open anomalies needing immediate action.

#### C. Live Attendance & Records
- `GET /api/v1/attendance/live-stream`: Filterable, paginated live attendance feed with employee status pills.
- `GET /api/v1/attendance/days/:id`: Detailed attendance day record with calculation proof, punches, and shift details.
- `POST /api/v1/attendance/reprocess`: Trigger recalculation for an employee or date range.

#### D. Time Event Ingestion & Raw Logs
- `POST /api/v1/time-events/punch`: Ingest single or batch punch telemetry (device, web, or mobile).
- `GET /api/v1/time-events/raw`: Paginated table of raw immutable punches with filter by source and status.
- `POST /api/v1/time-events/export`: Asynchronously generate CSV/Excel export of raw punch records.

#### E. Shifts, Groups & Rostering
- `GET /api/v1/shifts`: List all shifts in shift library with status and grace rules.
- `POST /api/v1/shifts`: Create a new shift definition with version tracking.
- `PUT /api/v1/shifts/:id`: Update shift parameters (creates a new effective-dated version).
- `GET /api/v1/shifts/groups`: List shift groups with rotational patterns.
- `POST /api/v1/shifts/groups`: Create a shift group.
- `GET /api/v1/shifts/schedule-matrix`: Retrieve weekly roster Gantt matrix by employee and date.
- `POST /api/v1/shifts/assignments/bulk`: Assign shifts to multiple employees with date horizons.
- `POST /api/v1/shifts/publish-schedule`: Seal and broadcast weekly roster to employees.

#### F. Exceptions, Regularisation & Approvals
- `GET /api/v1/exceptions`: List attendance exceptions with severity and resolution state.
- `PATCH /api/v1/exceptions/:id/resolve`: Administratively resolve an exception with justification notes.
- `GET /api/v1/regularisations`: Retrieve list of regularisation requests with status counters.
- `POST /api/v1/regularisations`: Submit new attendance regularisation request with attachment.
- `GET /api/v1/approvals/inbox`: Retrieve pending approval instances for the authenticated manager.
- `POST /api/v1/approvals/:instanceId/action`: Execute approval action (`APPROVE`, `REJECT`, `SEND_BACK`).
- `GET /api/v1/approvals/history`: Filterable log of past approval decisions with turnaround metrics.

#### G. Devices, Geofencing & Integrations
- `GET /api/v1/devices`: List all registered biometric terminals, face recognition units, and web kiosks.
- `POST /api/v1/devices/heartbeat`: Biometric hardware heartbeat ping.
- `GET /api/v1/locations/geofences`: Retrieve active circular/polygon geofence zones.
- `POST /api/v1/integrations/webhooks`: Register external webhook subscriber with cryptographic signing secret.
- `POST /api/v1/payroll/export`: Generate payroll handoff dataset for pay period.
