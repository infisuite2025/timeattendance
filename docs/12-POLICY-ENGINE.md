# InfiTimePro – Enterprise Time & Attendance SaaS Platform
## 12. Policy Engine & Rule Configuration

This document specifies the rule configuration architecture of InfiTimePro, defining policy inheritance, precedence resolution, effective-dating mechanisms, and rule evaluation pipelines.

---

### 1. Policy Inheritance & Precedence Hierarchy

InfiTimePro allows granular policy overrides without requiring bespoke code changes. When evaluating an employee's attendance, the policy engine resolves parameters using the following strict top-down precedence hierarchy:

```mermaid
graph TD
    A[Individual Employee Override (Highest Priority)] --> B[Employee Category / Worker Type]
    B --> C[Department Policy]
    C --> D[Location / Branch Policy]
    D --> E[Legal Entity / Company Policy]
    E --> F[Tenant Global Default Policy (Fallback)]
```

---

### 2. Core Policy Parameter Modules

#### A. Punch Rules & Grace Window Policy
- `graceInMinutes`: Allowed window after shift start before lateness penalty triggers (Default: 15 mins).
- `graceOutMinutes`: Allowed early exit window before shift end without shortfall penalty (Default: 15 mins).
- `monthlyLateGraceCount`: Number of late arrival instances permitted per calendar month without wage/leave deduction (e.g. 3 free lates).
- `lateDeductionFormula`: Action taken on $N^{\text{th}}$ late occurrence (`MARK_HALF_DAY`, `DEDUCT_LEAVE`, `LOSS_OF_PAY`).

#### B. Threshold & Duration Rules
- `fullDayPresentThresholdMinutes`: Minimum net work minutes to earn a full day credit (e.g. 480 mins).
- `halfDayPresentThresholdMinutes`: Minimum net work minutes to qualify for half day (e.g. 240 mins).
- `autoHalfDayOnLateMinutes`: Immediate half-day designation if arrival is delayed beyond threshold (e.g. $>120$ mins late).

#### C. Break Deduction Rules
- `breakType`: `FIXED`, `FLEXIBLE`, or `UNPAID_EXCLUDED`.
- `mandatoryLunchDeductionMinutes`: Auto-deducted duration if no break punches are recorded and shift spans meal window (e.g. 60 mins).
- `maxPaidBreakMinutes`: Upper cap on paid tea/coffee pauses (e.g. 30 mins).

#### D. Overtime & Comp-Off Rules
- `otMinQualificationMinutes`: Minimum continuous extra minutes required before overtime is recognized (e.g. 30 mins).
- `otRoundingMinutes`: Rounding interval for payable overtime (e.g. 15-minute blocks).
- `compOffEligibilityThresholdMinutes`: Minimum hours worked on a holiday or rest-day to earn 1 day of compensatory off (e.g. 360 mins).
- `compOffExpiryDays`: Validity horizon for comp-off leave balance (e.g. 60 days from accrual).

---

### 3. Effective-Dating & Version Control

Every policy record is immutable once applied to an attendance cycle:
- Modifications create a new version (`policy_version_id`) with `effective_from` set to a future or current date.
- Historical attendance records retain their foreign key reference to the exact `policy_version_id` that was active at the time of calculation.
- Reprocessing historical periods requires explicit administrative confirmation to use either the historical version or the revised policy version.
