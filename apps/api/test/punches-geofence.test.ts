import { describe, it, expect } from 'vitest';
import { PunchesService } from '../src/modules/punches/punches.service.js';

describe('InfiTimePro Punch Ingestion & Anti-Spoofing Geofence Engine', () => {
  it('should accept valid biometric punch within acceptable geofence perimeter', async () => {
    const res = await PunchesService.ingestPunch('tenant-test-01', {
      employeeId: 'emp-test-01',
      timestamp: '2026-09-14T09:00:00.000Z',
      eventType: 'IN',
      source: 'biometric',
      locationId: 'loc-001',
      latitude: 12.9716, // exact center
      longitude: 77.5946,
      accuracyMeters: 5
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe('accepted');
    expect(res.idempotencyHash).toBeDefined();
    expect(res.idempotencyHash.length).toBe(32);
  });

  it('should flag punch when mobile GPS coordinate falls outside allowable geofence radius', async () => {
    const res = await PunchesService.ingestPunch('tenant-test-01', {
      employeeId: 'emp-test-02',
      timestamp: '2026-09-14T09:05:00.000Z',
      eventType: 'IN',
      source: 'mobile_app',
      locationId: 'loc-001',
      latitude: 12.9800, // ~1km away
      longitude: 77.6000,
      accuracyMeters: 10
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe('flagged');
    expect(res.flagReason).toContain('Outside geofence perimeter');
  });

  it('should flag punch when mobile sensor flags Mock Location / GPS spoofing', async () => {
    const res = await PunchesService.ingestPunch('tenant-test-01', {
      employeeId: 'emp-test-03',
      timestamp: '2026-09-14T09:10:00.000Z',
      eventType: 'IN',
      source: 'mobile_app',
      locationId: 'loc-001',
      latitude: 12.9716,
      longitude: 77.5946,
      isMockLocation: true
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe('flagged');
    expect(res.flagReason).toContain('Mock GPS location detected');
  });

  it('should reject replay duplicate packets with identical SHA-256 idempotency hash', async () => {
    const payload = {
      employeeId: 'emp-test-04',
      timestamp: '2026-09-14T09:15:00.000Z',
      eventType: 'IN' as const,
      source: 'mobile_app' as const,
      locationId: 'loc-001',
      latitude: 12.9716,
      longitude: 77.5946
    };

    const firstRes = await PunchesService.ingestPunch('tenant-test-01', payload);
    expect(firstRes.success).toBe(true);
    expect(firstRes.status).toBe('accepted');

    const duplicateRes = await PunchesService.ingestPunch('tenant-test-01', payload);
    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.status).toBe('duplicate');
    expect(duplicateRes.flagReason).toContain('Duplicate punch packet rejected');
  });

  it('should process batch ingestion with accurate counters', async () => {
    const batchRes = await PunchesService.batchIngest('tenant-test-01', {
      punches: [
        {
          employeeId: 'emp-batch-01',
          timestamp: '2026-09-14T09:20:00.000Z',
          eventType: 'IN',
          source: 'biometric',
          locationId: 'loc-001',
          latitude: 12.9716,
          longitude: 77.5946
        },
        {
          employeeId: 'emp-batch-02',
          timestamp: '2026-09-14T09:21:00.000Z',
          eventType: 'IN',
          source: 'mobile_app',
          locationId: 'loc-001',
          latitude: 12.9716,
          longitude: 77.5946,
          isMockLocation: true
        }
      ]
    });

    expect(batchRes.totalReceived).toBe(2);
    expect(batchRes.acceptedCount).toBe(1);
    expect(batchRes.flaggedCount).toBe(1);
  });
});
