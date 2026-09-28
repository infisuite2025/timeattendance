# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 14. Internationalization (i18n), Multi-Timezone & Multi-Currency Architecture

This document specifies the global localization engines of InfiTimePro, covering IANA timezone arithmetic, daylight saving time (DST) transitions, multi-locale date/time formatting, and currency standards.

---

### 1. Multi-Timezone Architecture & Invariant Rules

1. **Storage Invariance**: All timestamps in `infi_timepro_db` are stored in UTC (`TIMESTAMP` or `DATETIME(6) UTC`).
2. **Contextual Ingestion**: Ingested punches capture the reporting device's local timezone offset and IANA identifier (e.g. `Asia/Kolkata`, `America/New_York`, `Europe/London`, `Asia/Dubai`).
3. **Shift Boundary Invariance**: Shifts are defined relative to the IANA timezone of the assigned physical location (`tp_locations.timezone`).
4. **Cross-Midnight Normalization**: Shifts spanning midnight (e.g. 22:00 to 06:00) belong to the shift start date regardless of whether punches occur on $D$ or $D+1$.

```typescript
// Sample Timezone Normalization Function (using Luxon / Temporal)
import { DateTime } from 'luxon';

export function resolvePunchToAttendanceDate(
  punchTimestampUtc: Date,
  locationTimezone: string,
  shiftStartLocalTime: string // "22:00"
): string {
  const localDt = DateTime.fromJSDate(punchTimestampUtc, { zone: locationTimezone });
  const shiftHour = parseInt(shiftStartLocalTime.split(':')[0], 10);
  
  // If night shift starts late (e.g. 22:00) and punch is early morning (e.g. 05:00 next day)
  if (shiftHour >= 18 && localDt.hour < 12) {
    return localDt.minus({ days: 1 }).toISODate()!;
  }
  return localDt.toISODate()!;
}
```

---

### 2. Internationalization (i18n) & RTL Support

- **ICU Standard**: Message formatting uses ICU standard syntax supporting variable replacement and pluralization.
- **Language Packs**: Core platform supports English (`en-US`), Hindi (`hi-IN`), Arabic (`ar-SA`), Spanish (`es-ES`), French (`fr-FR`), and Portuguese (`pt-BR`).
- **Bi-Directional Layouts (RTL)**: Automatic CSS dir attribute flipping (`dir="rtl"`) for Arabic with mirroring of navigation bars, icons, chevron directions, and tables.

---

### 3. Multi-Currency Standards

- **Standard**: ISO 4217 currency codes (`USD`, `INR`, `EUR`, `GBP`, `AED`, `SAR`).
- **Storage**: Numeric financial figures are stored as fixed-precision decimals (`DECIMAL(14,4)`).
- **Exchange Rates**: Tenant currency rates cached daily with historical snapshot lookup for overtime financial liability estimations.
