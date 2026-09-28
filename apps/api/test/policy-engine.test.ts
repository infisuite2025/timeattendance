import { describe, it, expect } from 'vitest';
import { policyEngineService } from '../src/modules/policies/policy-engine.service.js';

describe('InfiTimePro Policy Engine & Deterministic Proof Engine', () => {
  it('should mark attendance as Present when arrival is within grace period', () => {
    const result = policyEngineService.evaluatePolicy({
      policyId: 'pol_gen_001',
      firstInTime: '09:12', // 12 mins late, within 15m grace
      lastOutTime: '18:15',
      shiftStartTime: '09:00',
      shiftEndTime: '18:00',
      recordedBreakMinutes: 60,
    });

    expect(result.dayStatus).toBe('present');
    expect(result.isLate).toBe(false);
    expect(result.lateByMinutes).toBe(12);
    expect(result.explanation).toContain('Gross duration');
  });

  it('should flag Late Arrival when clock-in exceeds grace period', () => {
    const result = policyEngineService.evaluatePolicy({
      policyId: 'pol_gen_001',
      firstInTime: '09:35', // 35 mins late (exceeds 15m grace)
      lastOutTime: '18:35',
      shiftStartTime: '09:00',
      shiftEndTime: '18:00',
      recordedBreakMinutes: 60,
    });

    expect(result.isLate).toBe(true);
    expect(result.lateByMinutes).toBe(35);
    expect(result.dayStatus).toBe('late');
  });

  it('should classify as Half-Day when net duration is between half-day and full-day threshold', () => {
    const result = policyEngineService.evaluatePolicy({
      policyId: 'pol_gen_001',
      firstInTime: '09:00',
      lastOutTime: '14:30', // Gross: 330m - 60m = 270m net (between 240m and 480m)
      shiftStartTime: '09:00',
      shiftEndTime: '18:00',
      recordedBreakMinutes: 60,
    });

    expect(result.dayStatus).toBe('half_day');
    expect(result.netWorkDurationMinutes).toBe(270);
    expect(result.shortfallMinutes).toBe(210);
  });

  it('should calculate qualified overtime when net work hours exceed expected shift duration', () => {
    const result = policyEngineService.evaluatePolicy({
      policyId: 'pol_gen_001',
      firstInTime: '09:00',
      lastOutTime: '20:00', // 11h gross - 1h break = 10h net (600m) -> 120m overtime
      shiftStartTime: '09:00',
      shiftEndTime: '18:00',
      recordedBreakMinutes: 60,
    });

    expect(result.overtimeMinutes).toBe(120);
    expect(result.shortfallMinutes).toBe(0);
  });
});
