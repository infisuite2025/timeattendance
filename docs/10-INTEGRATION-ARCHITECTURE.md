# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 10. Integration Architecture & Biometric Hardware Adapters

This document specifies the integration architecture of InfiTimePro, detailing biometric hardware abstractions, on-premises Local Connectors, webhook pipelines, and external HRMS/Payroll connectors.

---

### 1. Hardware Abstraction Layer (HAL)

InfiTimePro abstracts all physical time-capture devices behind a unified TypeScript adapter interface (`IBiometricDeviceAdapter`):

```typescript
export interface IBiometricDeviceAdapter {
  readonly vendorName: string;
  readonly supportedProtocols: ('PUSH_ADMS' | 'PULL_API' | 'SDK_BRIDGE')[];
  
  validatePayload(rawPayload: unknown): boolean;
  normalizeEvent(rawPayload: unknown, context: DeviceContext): NormalizedPunchDTO;
  sendUserEnrollment?(employeeId: string, biometricToken: string): Promise<boolean>;
  checkDeviceHealth(deviceId: string): Promise<DeviceHealthStatus>;
}
```

```mermaid
graph TD
    A[Biometric Hardware / Terminals] -->|Push ADMS HTTP/HTTPS| B[InfiTimePro ADMS Ingestion Endpoint]
    C[Local On-Premises Terminals] -->|LAN Socket| D[InfiTimePro Local Connector Agent]
    D -->|Outbound TLS Tunnel| E[InfiTimePro Ingestion Gateway]
    F[Mobile Flutter App] -->|HTTPS REST| E
    G[Web Kiosks / Portal] -->|HTTPS REST| E
    
    B --> H[Hardware Ingestion Queue (BullMQ)]
    E --> H
    H --> I[Adapter Normalization Worker]
    I --> J[(tp_raw_punches Immutable Fact Store)]
    I --> K[Attendance Processing Worker]
```

---

### 2. InfiTimePro Local Connector Service
For enterprise customers with biometric terminals located strictly inside private enterprise LANs without public IP exposure:
- **Architecture**: A lightweight Go/Node.js daemon deployed on a customer local server.
- **Communications**: Initiates only **outbound** encrypted WebSocket / gRPC over TLS (port 443) to InfiTimePro Cloud.
- **Buffering & Resilience**: Local embedded SQLite queue buffers up to 500,000 punches during internet outages, syncing automatically upon reconnection.

---

### 3. Outbound Webhook Subsystem
InfiTimePro emits cryptographically signed JSON webhooks for key workforce lifecycle events:
- `attendance.day.calculated`
- `attendance.exception.raised`
- `regularisation.approved`
- `overtime.approved`
- `period.finalised`

```http
POST /webhook-receiver HTTP/1.1
Host: hrms.acme.com
X-InfiTimePro-Signature: t=1726300000,v1=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
Content-Type: application/json

{
  "event": "regularisation.approved",
  "tenantId": "ten_01J7K8X9Y0Z1",
  "payload": {
    "requestId": "REQ-2024-0917-001",
    "employeeCode": "TP1012",
    "attendanceDate": "2024-09-12",
    "correctedStatus": "present",
    "netWorkDurationMinutes": 547
  }
}
```

---

### 4. HRMS & Payroll Integration Adapters
InfiTimePro features bi-directional data synchronizers:
- **Inbound HRMS Sync**: Workers, Departments, Locations, and Leave Applications synced via scheduled cron or REST webhooks from Workday, SAP SuccessFactors, BambooHR, and Darwinbox.
- **Outbound Payroll Export**: Pre-formatted pay matrices mapped to ADP, QuickBooks, Gusto, Paychex, or custom delimited SFTP files.
