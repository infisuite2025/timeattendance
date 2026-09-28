# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 17. Edge Case Register & Resolution Algorithms

This document catalogs the critical edge cases in enterprise workforce attendance and details InfiTimePro's deterministic resolution logic.

---

### Master Edge Case Catalog

| ID | Edge Case Scenario | Impact / Risk | Deterministic Resolution Algorithm in InfiTimePro |
|---|---|---|---|
| `EC-001` | **Cross-Midnight Shift (e.g. 22:00 to 06:00)** | Punches on day $D+1$ incorrectly assigned to day $D+1$ instead of $D$. | Shift window anchor binds to shift start time $T_{start}$. A punch at 06:00 on $D+1$ is normalized against the active shift of day $D$. |
| `EC-002` | **Daylight Saving Time (DST) Spring Forward** | A 23:00 to 07:00 shift loses 1 hour in wall-clock time (clocks jump 02:00 $\to$ 03:00). | Calculations compute duration via absolute UTC millisecond delta ($\Delta t = \text{Out}_{\text{UTC}} - \text{In}_{\text{UTC}}$), computing exact 7h work without wall-clock drift error. |
| `EC-003` | **Daylight Saving Time (DST) Fall Backward** | A 23:00 to 07:00 shift gains 1 hour in wall-clock time (02:00 occurs twice). | UTC arithmetic computes true 9 hours worked, accurately flagging 1 hour eligible overtime. |
| `EC-004` | **Rapid Double Punch (Card Double-Tap)** | Employee taps RFID card twice within 5 seconds. | Ingestion engine applies a configurable debounce window (e.g. 60 seconds). Duplicate raw event is flagged as `DUPLICATE_IGNORED`. |
| `EC-005` | **Offline Punch Sync with Past Timestamp** | Field worker syncs punches 3 days late after connectivity restored. | Ingestion preserves hardware timestamp. Automatically triggers attendance recalculation for the historical date and posts an audit flag. |
| `EC-006` | **Punch on Approved Leave** | Employee with approved sick leave punches in at office terminal. | System flags `UNSCHEDULED_ATTENDANCE_ON_LEAVE`. Manager is notified to either cancel leave or void punch via approval workflow. |
| `EC-007` | **Impossible Travel Velocity** | Employee punches in Mumbai at 09:00 AM and in Delhi at 09:30 AM. | Geo-velocity calculator detects $>1,000\text{ km/h}$, flags `CRITICAL_FRAUD_EXCEPTION`, and alerts Security Administrator. |
| `EC-008` | **Retroactive Policy Change** | Admin changes grace period from 15m to 10m for previous month. | Historical attendance remains unchanged. Reprocessing only occurs if Admin explicitly triggers historical re-run with dual-authorization. |
| `EC-009` | **Locked Payroll Period Reopen** | HR attempts to regularize attendance after period has been finalised and locked. | Write operation rejected with `ERR_PERIOD_LOCKED`. Reopening requires `finalisation.unlock` permission and mandatory justification reason. |
| `EC-010` | **Shift Swap Conflict** | Two employees swap shifts, but one is already scheduled for overtime exceeding statutory limits. | Policy engine pre-validates total weekly hours before allowing swap submission, rejecting with specific compliance rule violation. |
