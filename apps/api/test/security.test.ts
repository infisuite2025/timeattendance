import { describe, it, expect } from 'vitest';
import { SecurityService } from '../src/modules/security/security.service.js';

describe('AI Biometric Anti-Spoofing Module', () => {

  it('should return threat summary with correct threat level classification', async () => {
    const summary = await SecurityService.getThreatSummary('tenant-001');
    expect(summary.totalDevicesRegistered).toBeGreaterThanOrEqual(6);
    expect(summary.devicesPassedAttestation).toBeGreaterThanOrEqual(3);
    expect(summary.devicesWithWarning).toBeGreaterThanOrEqual(2);
    expect(summary.devicesBlocked).toBeGreaterThanOrEqual(1);
    expect(summary.blacklistedAppsActive).toBeGreaterThanOrEqual(6);
    expect(summary.livenessPassRate).toBeGreaterThan(50);
    expect(['low', 'medium', 'high', 'critical']).toContain(summary.overallThreatLevel);
    // Has unresolved critical events → should be critical
    expect(summary.overallThreatLevel).toBe('critical');
  });

  it('should list liveness checks and filter by result', async () => {
    const all = await SecurityService.getLivenessChecks('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(8);

    const passed = await SecurityService.getLivenessChecks('tenant-001', undefined, 'passed');
    expect(passed.length).toBeGreaterThanOrEqual(4);
    passed.forEach(l => expect(l.result).toBe('passed'));

    const failed = await SecurityService.getLivenessChecks('tenant-001', undefined, 'failed');
    expect(failed.length).toBeGreaterThanOrEqual(2);
    failed.forEach(l => {
      expect(l.result).toBe('failed');
      expect(l.actionRequired).toBe(true);
    });
  });

  it('should list spoof events and validate critical event fields', async () => {
    const events = await SecurityService.getSpoofEvents('tenant-001');
    expect(events.length).toBeGreaterThanOrEqual(5);

    const critical = events.filter(e => e.threatLevel === 'critical');
    expect(critical.length).toBeGreaterThanOrEqual(2);
    critical.forEach(e => {
      expect(e.punchBlocked).toBe(true);
      expect(e.mlModelConfidence).toBeGreaterThan(80);
    });

    const blocked = events.filter(e => e.punchBlocked);
    expect(blocked.length).toBeGreaterThanOrEqual(4);
  });

  it('should resolve a spoof event and update its status', async () => {
    const events = await SecurityService.getSpoofEvents('tenant-001', 'confirmed');
    expect(events.length).toBeGreaterThanOrEqual(1);

    const targetId = events[0].id;
    const resolved = await SecurityService.resolveSpoofEvent(
      targetId,
      'Naresh Andukoori',
      'Employee counselled. Device re-enrolled on company hardware.'
    );
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedBy).toBe('Naresh Andukoori');
    expect(resolved.resolvedAt).toBeDefined();
    expect(resolved.resolutionNotes).toContain('counselled');
  });

  it('should list device attestations and filter by status', async () => {
    const all = await SecurityService.getDeviceAttestations('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(6);

    const failed = await SecurityService.getDeviceAttestations('tenant-001', 'failed');
    expect(failed.length).toBeGreaterThanOrEqual(1);
    failed.forEach(a => {
      expect(a.attestationStatus).toBe('failed');
      expect(a.isRooted || a.isMockLocationEnabled || a.blacklistedAppsFound.length > 0).toBe(true);
    });

    const warnings = await SecurityService.getDeviceAttestations('tenant-001', 'warning');
    expect(warnings.length).toBeGreaterThanOrEqual(2);
  });

  it('should revoke a device and mark it as failed attestation', async () => {
    const devices = await SecurityService.getDeviceAttestations('tenant-001', 'warning');
    const target = devices[0];
    const revoked = await SecurityService.revokeDevice(target.deviceId, 'Naresh Andukoori');
    expect(revoked.attestationStatus).toBe('failed');
    expect(revoked.warningReason).toContain('Manually revoked');
  });

  it('should manage app blacklist — add and toggle entries', async () => {
    const initial = await SecurityService.getBlacklistedApps('tenant-001');
    const initialCount = initial.length;

    const newApp = await SecurityService.addToBlacklist('tenant-001', {
      appPackageName: 'com.evil.proxy.injector',
      appDisplayName: 'Evil Proxy Injector',
      platform: 'android',
      threatCategory: 'root_jailbreak',
      severity: 'critical',
      addedBy: 'Naresh Andukoori',
      description: 'Network traffic interception tool that can bypass certificate pinning.',
    });
    expect(newApp.id).toBeDefined();
    expect(newApp.isActive).toBe(true);
    expect(newApp.detectedCount).toBe(0);

    const updated = await SecurityService.getBlacklistedApps('tenant-001');
    expect(updated.length).toBe(initialCount + 1);

    // Toggle off
    const toggled = await SecurityService.toggleBlacklistEntry(newApp.id, false);
    expect(toggled.isActive).toBe(false);
  });

  it('should enforce tenant isolation — other tenants see no security data', async () => {
    const summary = await SecurityService.getThreatSummary('tenant-999');
    expect(summary.totalDevicesRegistered).toBe(0);
    expect(summary.criticalThreatCount).toBe(0);

    const events = await SecurityService.getSpoofEvents('tenant-999');
    expect(events.length).toBe(0);

    const blacklist = await SecurityService.getBlacklistedApps('tenant-999');
    expect(blacklist.length).toBe(0);
  });

});
