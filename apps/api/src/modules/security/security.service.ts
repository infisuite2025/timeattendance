import {
  SecLivenessCheckDTO,
  SecSpoofEventDTO,
  SecDeviceAttestationDTO,
  SecBlacklistedAppDTO,
  SecThreatSummaryDTO,
  SecThreatLevel,
} from '@infi-timepro/shared-types';

export class SecurityService {

  // ─── Blacklisted Apps ──────────────────────────────────────────────────────
  private static blacklistedApps: SecBlacklistedAppDTO[] = [
    { id: 'bla-001', tenantId: 'tenant-001', appPackageName: 'com.lexa.fakegps', appDisplayName: 'Fake GPS Location', platform: 'android', threatCategory: 'gps_spoof', severity: 'critical', detectedCount: 47, addedAt: '2025-01-10T09:00:00.000Z', addedBy: 'Naresh Andukoori', isActive: true, description: 'Allows users to broadcast arbitrary GPS coordinates bypassing hardware sensor validation.' },
    { id: 'bla-002', tenantId: 'tenant-001', appPackageName: 'com.incorporateapps.fakegps.fre', appDisplayName: 'Fake GPS Run', platform: 'android', threatCategory: 'gps_spoof', severity: 'critical', detectedCount: 23, addedAt: '2025-02-05T09:00:00.000Z', addedBy: 'Naresh Andukoori', isActive: true, description: 'Uses Android Mock Location developer API to override real GPS coordinates.' },
    { id: 'bla-003', tenantId: 'tenant-001', appPackageName: 'com.itools.iappstore', appDisplayName: 'iTools - iOS Mock Location', platform: 'ios', threatCategory: 'gps_spoof', severity: 'high', detectedCount: 12, addedAt: '2025-03-01T09:00:00.000Z', addedBy: 'System Auto-Detect', isActive: true, description: 'Desktop companion tool that simulates GPS location on iOS devices without jailbreak.' },
    { id: 'bla-004', tenantId: 'tenant-001', appPackageName: 'org.meefik.busybox', appDisplayName: 'BusyBox (Root Utility)', platform: 'android', threatCategory: 'root_jailbreak', severity: 'high', detectedCount: 8, addedAt: '2025-04-12T09:00:00.000Z', addedBy: 'Naresh Andukoori', isActive: true, description: 'Commonly installed alongside root access tools. Indicates device integrity compromise.' },
    { id: 'bla-005', tenantId: 'tenant-001', appPackageName: 'com.topjohnwu.magisk', appDisplayName: 'Magisk (Systemless Root)', platform: 'android', threatCategory: 'root_jailbreak', severity: 'critical', detectedCount: 31, addedAt: '2025-01-20T09:00:00.000Z', addedBy: 'System Auto-Detect', isActive: true, description: 'Systemless root manager that can bypass Android SafetyNet/Play Integrity API checks.' },
    { id: 'bla-006', tenantId: 'tenant-001', appPackageName: 'ai.deepfake.faceswap.pro', appDisplayName: 'AI Face Swap Pro', platform: 'android', threatCategory: 'deepfake', severity: 'critical', detectedCount: 5, addedAt: '2025-06-01T09:00:00.000Z', addedBy: 'ML Threat Engine v2.1', isActive: true, description: 'Real-time AI face-swap capable of defeating 2D facial recognition systems.' },
    { id: 'bla-007', tenantId: 'tenant-001', appPackageName: 'com.screen.recorder.mirror', appDisplayName: 'Screen Mirror & Recorder', platform: 'android', threatCategory: 'screen_replay', severity: 'medium', detectedCount: 3, addedAt: '2025-07-15T09:00:00.000Z', addedBy: 'Naresh Andukoori', isActive: false, description: 'Can be used to replay recorded biometric sessions to bypass facial recognition.' },
  ];

  // ─── Device Attestations ───────────────────────────────────────────────────
  private static deviceAttestations: SecDeviceAttestationDTO[] = [
    { id: 'att-001', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', deviceId: 'dev-mob-001', deviceModel: 'iPhone 15 Pro', platform: 'ios', osVersion: 'iOS 17.4.1', appVersion: '2.4.1', attestationStatus: 'passed', isRooted: false, isMockLocationEnabled: false, isEmulator: false, safetyNetStatus: 'passed', playIntegrityStatus: 'strong', blacklistedAppsFound: [], lastCheckedAt: '2025-09-14T08:45:00.000Z', firstRegisteredAt: '2025-01-15T09:00:00.000Z' },
    { id: 'att-002', tenantId: 'tenant-001', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', deviceId: 'dev-mob-002', deviceModel: 'Samsung Galaxy S24 Ultra', platform: 'android', osVersion: 'Android 14 (One UI 6.1)', appVersion: '2.4.1', attestationStatus: 'passed', isRooted: false, isMockLocationEnabled: false, isEmulator: false, safetyNetStatus: 'passed', playIntegrityStatus: 'strong', blacklistedAppsFound: [], lastCheckedAt: '2025-09-14T09:02:00.000Z', firstRegisteredAt: '2025-02-01T09:00:00.000Z' },
    { id: 'att-003', tenantId: 'tenant-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', employeeCode: 'EMP-1005', deviceId: 'dev-mob-003', deviceModel: 'Google Pixel 8 Pro', platform: 'android', osVersion: 'Android 14', appVersion: '2.3.9', attestationStatus: 'warning', isRooted: false, isMockLocationEnabled: true, isEmulator: false, safetyNetStatus: 'passed', playIntegrityStatus: 'basic', blacklistedAppsFound: ['com.lexa.fakegps'], lastCheckedAt: '2025-09-13T17:30:00.000Z', firstRegisteredAt: '2025-03-10T09:00:00.000Z', warningReason: 'Mock Location enabled & blacklisted GPS spoof app detected' },
    { id: 'att-004', tenantId: 'tenant-001', employeeId: 'EMP-1006', employeeName: 'Fatima Al-Zaabi', employeeCode: 'EMP-1006', deviceId: 'dev-mob-004', deviceModel: 'iPhone 14', platform: 'ios', osVersion: 'iOS 17.2', appVersion: '2.4.0', attestationStatus: 'passed', isRooted: false, isMockLocationEnabled: false, isEmulator: false, safetyNetStatus: 'passed', playIntegrityStatus: 'strong', blacklistedAppsFound: [], lastCheckedAt: '2025-09-14T08:50:00.000Z', firstRegisteredAt: '2025-06-01T09:00:00.000Z' },
    { id: 'att-005', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', deviceId: 'dev-mob-005', deviceModel: 'OnePlus 12', platform: 'android', osVersion: 'Android 14 (OxygenOS 14)', appVersion: '2.4.1', attestationStatus: 'failed', isRooted: true, isMockLocationEnabled: true, isEmulator: false, safetyNetStatus: 'failed', playIntegrityStatus: 'failed', blacklistedAppsFound: ['com.topjohnwu.magisk', 'com.lexa.fakegps'], lastCheckedAt: '2025-09-12T11:15:00.000Z', firstRegisteredAt: '2025-04-15T09:00:00.000Z', warningReason: 'Device rooted via Magisk. Mock Location active. Multiple high-risk apps detected. Punch blocked.' },
    { id: 'att-006', tenantId: 'tenant-001', employeeId: 'EMP-3350', employeeName: 'Khalid Hassan', employeeCode: 'EMP-3350', deviceId: 'dev-mob-006', deviceModel: 'Xiaomi Mi 13', platform: 'android', osVersion: 'Android 13 (MIUI 14)', appVersion: '2.3.8', attestationStatus: 'warning', isRooted: false, isMockLocationEnabled: false, isEmulator: false, safetyNetStatus: 'passed', playIntegrityStatus: 'basic', blacklistedAppsFound: ['org.meefik.busybox'], lastCheckedAt: '2025-09-11T14:00:00.000Z', firstRegisteredAt: '2025-05-20T09:00:00.000Z', warningReason: 'BusyBox utility detected — possible root preparation. Monitoring elevated.' },
  ];

  // ─── Liveness Checks ───────────────────────────────────────────────────────
  private static livenessChecks: SecLivenessCheckDTO[] = [
    { id: 'lv-001', tenantId: 'tenant-001', employeeId: 'EMP-1001', employeeName: 'Sarah Jenkins', employeeCode: 'EMP-1001', deviceId: 'dev-mob-001', checkType: '3d_passive', result: 'passed', confidenceScore: 98.7, livenessScore: 99.1, challengeType: 'passive', timestamp: '2025-09-14T09:01:23.000Z', processingTimeMs: 412, modelVersion: 'InfiLiveness-v3.2', actionRequired: false },
    { id: 'lv-002', tenantId: 'tenant-001', employeeId: 'EMP-1003', employeeName: 'David Park', employeeCode: 'EMP-1003', deviceId: 'dev-mob-002', checkType: '3d_passive', result: 'passed', confidenceScore: 97.3, livenessScore: 98.4, challengeType: 'passive', timestamp: '2025-09-14T09:15:44.000Z', processingTimeMs: 388, modelVersion: 'InfiLiveness-v3.2', actionRequired: false },
    { id: 'lv-003', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', deviceId: 'dev-mob-005', checkType: 'blink_challenge', result: 'failed', confidenceScore: 31.2, livenessScore: 28.5, challengeType: 'blink', timestamp: '2025-09-12T11:10:02.000Z', processingTimeMs: 1240, modelVersion: 'InfiLiveness-v3.2', failureReason: 'Liveness confidence below threshold (28.5 < 70.0). Possible photo/video replay detected.', actionRequired: true, spoofEventId: 'spoof-003' },
    { id: 'lv-004', tenantId: 'tenant-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', employeeCode: 'EMP-1005', deviceId: 'dev-mob-003', checkType: '3d_passive', result: 'warning', confidenceScore: 74.1, livenessScore: 72.8, challengeType: 'passive', timestamp: '2025-09-13T17:28:55.000Z', processingTimeMs: 890, modelVersion: 'InfiLiveness-v3.2', failureReason: 'Score marginally above threshold. Mock location app active on device.', actionRequired: true },
    { id: 'lv-005', tenantId: 'tenant-001', employeeId: 'EMP-1006', employeeName: 'Fatima Al-Zaabi', employeeCode: 'EMP-1006', deviceId: 'dev-mob-004', checkType: '3d_passive', result: 'passed', confidenceScore: 99.1, livenessScore: 99.4, challengeType: 'passive', timestamp: '2025-09-14T08:55:17.000Z', processingTimeMs: 356, modelVersion: 'InfiLiveness-v3.2', actionRequired: false },
    { id: 'lv-006', tenantId: 'tenant-001', employeeId: 'EMP-3350', employeeName: 'Khalid Hassan', employeeCode: 'EMP-3350', deviceId: 'dev-mob-006', checkType: 'head_turn_challenge', result: 'passed', confidenceScore: 91.4, livenessScore: 93.2, challengeType: 'head_turn', timestamp: '2025-09-14T08:41:30.000Z', processingTimeMs: 622, modelVersion: 'InfiLiveness-v3.2', actionRequired: false },
    { id: 'lv-007', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201', deviceId: 'dev-mob-005', checkType: 'deepfake_scan', result: 'failed', confidenceScore: 12.0, livenessScore: 9.8, challengeType: 'deepfake_analysis', timestamp: '2025-09-11T08:30:10.000Z', processingTimeMs: 2100, modelVersion: 'InfiAntiDeepfake-v1.5', failureReason: 'GAN-generated face detected with 88% confidence. Frame temporal consistency failed. Punch blocked & HR alerted.', actionRequired: true, spoofEventId: 'spoof-001' },
    { id: 'lv-008', tenantId: 'tenant-001', employeeId: 'EMP-4412', employeeName: 'Priya Mehta', employeeCode: 'EMP-4412', deviceId: 'dev-mob-007', checkType: '3d_passive', result: 'passed', confidenceScore: 96.8, livenessScore: 97.5, challengeType: 'passive', timestamp: '2025-09-14T09:30:00.000Z', processingTimeMs: 402, modelVersion: 'InfiLiveness-v3.2', actionRequired: false },
  ];

  // ─── Spoof Events ──────────────────────────────────────────────────────────
  private static spoofEvents: SecSpoofEventDTO[] = [
    {
      id: 'spoof-001', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201',
      eventType: 'deepfake_face', threatLevel: 'critical', detectedAt: '2025-09-11T08:30:10.000Z',
      deviceId: 'dev-mob-005', deviceModel: 'OnePlus 12', latitude: 28.6139, longitude: 77.2090,
      detectionMethod: 'InfiAntiDeepfake-v1.5 Neural Network Analysis',
      description: 'GAN-synthesized face detected during morning punch-in attempt. Temporal frame consistency failed. Neural texture analysis flagged as non-biological.',
      evidenceImageUrl: '/secure/evidence/spoof-001-frame.jpg',
      punchBlocked: true, hrAlerted: true, managerAlerted: true,
      status: 'confirmed', resolvedAt: undefined,
      mlModelConfidence: 88.0, falsePositiveProbability: 2.1,
    },
    {
      id: 'spoof-002', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201',
      eventType: 'gps_spoof', threatLevel: 'high', detectedAt: '2025-09-10T17:45:22.000Z',
      deviceId: 'dev-mob-005', deviceModel: 'OnePlus 12', latitude: 28.6139, longitude: 77.2090,
      detectionMethod: 'Sensor Fusion Cross-Validation',
      description: 'GPS coordinates inconsistent with accelerometer/gyroscope motion data. Reported location: Office Headquarters, Delhi. Cell tower triangulation: 12.4km away in Gurgaon. Fake GPS app signature detected in memory.',
      punchBlocked: true, hrAlerted: true, managerAlerted: true,
      status: 'confirmed', resolvedAt: undefined,
      mlModelConfidence: 94.5, falsePositiveProbability: 1.2,
    },
    {
      id: 'spoof-003', tenantId: 'tenant-001', employeeId: 'EMP-2201', employeeName: 'Ramesh Gupta', employeeCode: 'EMP-2201',
      eventType: 'photo_replay', threatLevel: 'critical', detectedAt: '2025-09-12T11:10:02.000Z',
      deviceId: 'dev-mob-005', deviceModel: 'OnePlus 12', latitude: 28.6139, longitude: 77.2090,
      detectionMethod: 'Blink Challenge + Micro-texture Analysis',
      description: 'Static image presented to camera detected via blink challenge failure. Micro-texture analysis shows moire pattern consistent with screen display. No natural skin micro-movements detected.',
      punchBlocked: true, hrAlerted: true, managerAlerted: false,
      status: 'confirmed',
      mlModelConfidence: 97.3, falsePositiveProbability: 0.5,
    },
    {
      id: 'spoof-004', tenantId: 'tenant-001', employeeId: 'EMP-1005', employeeName: 'Ananya Krishnan', employeeCode: 'EMP-1005',
      eventType: 'gps_spoof', threatLevel: 'medium', detectedAt: '2025-09-13T17:28:55.000Z',
      deviceId: 'dev-mob-003', deviceModel: 'Google Pixel 8 Pro', latitude: 12.9716, longitude: 77.5946,
      detectionMethod: 'Mock Location Flag + App Blacklist',
      description: 'Android Mock Location developer flag active. Blacklisted app com.lexa.fakegps detected in device app registry. Punch allowed with warning — location accuracy downgraded to "unverified".',
      punchBlocked: false, hrAlerted: false, managerAlerted: true,
      status: 'under_review',
      mlModelConfidence: 78.2, falsePositiveProbability: 12.5,
    },
    {
      id: 'spoof-005', tenantId: 'tenant-001', employeeId: 'EMP-5580', employeeName: 'Mohammed Al-Farsi', employeeCode: 'EMP-5580',
      eventType: 'root_bypass', threatLevel: 'high', detectedAt: '2025-09-08T08:22:00.000Z',
      deviceId: 'dev-mob-008', deviceModel: 'Redmi Note 13', latitude: 25.2048, longitude: 55.2708,
      detectionMethod: 'Play Integrity API - MEETS_STRONG_INTEGRITY failed',
      description: 'Device failed Google Play Integrity STRONG check. Bootloader unlocked. System partition modified. Cannot guarantee biometric hardware enclave integrity.',
      punchBlocked: true, hrAlerted: true, managerAlerted: true,
      status: 'resolved', resolvedAt: '2025-09-09T10:00:00.000Z',
      resolvedBy: 'Naresh Andukoori', resolutionNotes: 'Employee re-enrolled on company-issued device. Personal device revoked from mobile punch registry.',
      mlModelConfidence: 99.1, falsePositiveProbability: 0.1,
    },
  ];

  // ─── Public API ────────────────────────────────────────────────────────────

  static async getThreatSummary(tenantId: string): Promise<SecThreatSummaryDTO> {
    const events = this.spoofEvents.filter(e => e.tenantId === tenantId);
    const attestations = this.deviceAttestations.filter(a => a.tenantId === tenantId);
    const liveness = this.livenessChecks.filter(l => l.tenantId === tenantId);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      totalDevicesRegistered: attestations.length,
      devicesPassedAttestation: attestations.filter(a => a.attestationStatus === 'passed').length,
      devicesWithWarning: attestations.filter(a => a.attestationStatus === 'warning').length,
      devicesBlocked: attestations.filter(a => a.attestationStatus === 'failed').length,
      totalSpoofEventsLast30Days: events.filter(e => e.detectedAt >= last30Days).length,
      criticalThreatCount: events.filter(e => e.threatLevel === 'critical' && e.status !== 'resolved').length,
      highThreatCount: events.filter(e => e.threatLevel === 'high' && e.status !== 'resolved').length,
      punchesBlockedLast30Days: events.filter(e => e.punchBlocked && e.detectedAt >= last30Days).length,
      livenessPassRate: Math.round((liveness.filter(l => l.result === 'passed').length / liveness.length) * 100 * 10) / 10,
      avgLivenessScore: Math.round(liveness.reduce((s, l) => s + l.livenessScore, 0) / liveness.length * 10) / 10,
      blacklistedAppsActive: this.blacklistedApps.filter(a => a.tenantId === tenantId && a.isActive).length,
      totalBlacklistDetections: this.blacklistedApps.filter(a => a.tenantId === tenantId).reduce((s, a) => s + a.detectedCount, 0),
      overallThreatLevel: events.some(e => e.threatLevel === 'critical' && e.status !== 'resolved') ? 'critical'
        : events.some(e => e.threatLevel === 'high' && e.status !== 'resolved') ? 'high'
        : events.some(e => e.threatLevel === 'medium' && e.status !== 'resolved') ? 'medium'
        : 'low',
    };
  }

  static async getLivenessChecks(tenantId: string, employeeId?: string, result?: string): Promise<SecLivenessCheckDTO[]> {
    return this.livenessChecks.filter(l =>
      l.tenantId === tenantId &&
      (!employeeId || l.employeeId === employeeId) &&
      (!result || l.result === result)
    );
  }

  static async getSpoofEvents(tenantId: string, status?: string, threatLevel?: string): Promise<SecSpoofEventDTO[]> {
    return this.spoofEvents.filter(e =>
      e.tenantId === tenantId &&
      (!status || e.status === status) &&
      (!threatLevel || e.threatLevel === threatLevel)
    );
  }

  static async resolveSpoofEvent(eventId: string, resolvedBy: string, notes: string): Promise<SecSpoofEventDTO> {
    const event = this.spoofEvents.find(e => e.id === eventId);
    if (!event) throw new Error(`Spoof event ${eventId} not found`);
    event.status = 'resolved';
    event.resolvedAt = new Date().toISOString();
    event.resolvedBy = resolvedBy;
    event.resolutionNotes = notes;
    return event;
  }

  static async getDeviceAttestations(tenantId: string, status?: string): Promise<SecDeviceAttestationDTO[]> {
    return this.deviceAttestations.filter(a =>
      a.tenantId === tenantId &&
      (!status || a.attestationStatus === status)
    );
  }

  static async revokeDevice(deviceId: string, revokedBy: string): Promise<SecDeviceAttestationDTO> {
    const attestation = this.deviceAttestations.find(a => a.deviceId === deviceId);
    if (!attestation) throw new Error(`Device ${deviceId} not found`);
    attestation.attestationStatus = 'failed';
    attestation.warningReason = `Manually revoked by ${revokedBy} on ${new Date().toLocaleDateString()}`;
    return attestation;
  }

  static async getBlacklistedApps(tenantId: string): Promise<SecBlacklistedAppDTO[]> {
    return this.blacklistedApps.filter(a => a.tenantId === tenantId);
  }

  static async addToBlacklist(tenantId: string, payload: Partial<SecBlacklistedAppDTO>): Promise<SecBlacklistedAppDTO> {
    const entry: SecBlacklistedAppDTO = {
      id: `bla-${Date.now()}`,
      tenantId,
      appPackageName: payload.appPackageName!,
      appDisplayName: payload.appDisplayName || payload.appPackageName!,
      platform: payload.platform || 'android',
      threatCategory: payload.threatCategory || 'gps_spoof',
      severity: payload.severity || 'high',
      detectedCount: 0,
      addedAt: new Date().toISOString(),
      addedBy: payload.addedBy || 'Admin',
      isActive: true,
      description: payload.description || '',
    };
    this.blacklistedApps.push(entry);
    return entry;
  }

  static async toggleBlacklistEntry(appId: string, isActive: boolean): Promise<SecBlacklistedAppDTO> {
    const app = this.blacklistedApps.find(a => a.id === appId);
    if (!app) throw new Error(`App ${appId} not found`);
    app.isActive = isActive;
    return app;
  }
}
