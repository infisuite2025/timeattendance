import {
  RawPunchEventDTO,
  IngestPunchRequestDTO,
  IngestPunchResponseDTO,
  BatchIngestPunchRequestDTO,
  BatchIngestResponseDTO,
  RawPunchFilterDTO,
  PunchMetricsSummaryDTO,
  DayStatus
} from '@infi-timepro/shared-types';
import crypto from 'crypto';

// Haversine distance calculator for Geofence validation
function calculateHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Default HQ geofence reference
const KNOWN_LOCATIONS = [
  { id: 'loc-001', name: 'Bengaluru Tech Park HQ', lat: 12.9716, lon: 77.5946, radiusMeters: 100 },
  { id: 'loc-002', name: 'Mumbai Financial Centre', lat: 19.0760, lon: 72.8777, radiusMeters: 150 },
  { id: 'loc-003', name: 'Singapore Regional Hub', lat: 1.2833, lon: 103.8500, radiusMeters: 100 },
  { id: 'loc-004', name: 'London Tech Hub', lat: 51.5074, lon: -0.1278, radiusMeters: 120 },
];

export class PunchesService {
  private static punches: RawPunchEventDTO[] = [
    {
      id: 'pch-001',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      deviceTimezone: 'Asia/Kolkata',
      eventType: 'IN',
      source: 'biometric',
      deviceId: 'dev-001',
      deviceName: 'BioMax SpeedFace 01 (Main Gate)',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      latitude: 12.97162,
      longitude: 77.59461,
      accuracyMeters: 5,
      distanceFromGeofenceMeters: 8,
      isFlagged: false,
      idempotencyHash: '8f9b23a104c9e812d3198a0c213f890a',
      syncLatencyMs: 145,
      ipAddress: '192.168.1.104',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: 'pch-002',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
      deviceTimezone: 'Asia/Kolkata',
      eventType: 'IN',
      source: 'mobile_app',
      deviceId: 'dev-mob-002',
      deviceName: 'iPhone 15 Pro (iOS 18.1)',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      latitude: 12.97180,
      longitude: 77.59480,
      accuracyMeters: 12,
      distanceFromGeofenceMeters: 28,
      isFlagged: false,
      idempotencyHash: '4a1c5698b712f90a12e34d678c9012ab',
      syncLatencyMs: 380,
      batteryLevel: 88,
      isMockLocation: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString()
    },
    {
      id: 'pch-003',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      deviceTimezone: 'Asia/Kolkata',
      eventType: 'IN',
      source: 'geofence',
      deviceId: 'dev-mob-003',
      deviceName: 'Samsung Galaxy S24',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      latitude: 12.97520,
      longitude: 77.59810,
      accuracyMeters: 45,
      distanceFromGeofenceMeters: 520,
      isFlagged: true,
      flagReason: 'Outside geofence perimeter (520m away from center)',
      idempotencyHash: '3d8a1c9012f45e78bc90123a456def78',
      syncLatencyMs: 620,
      batteryLevel: 42,
      isMockLocation: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString()
    },
    {
      id: 'pch-004',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'David Rodriguez',
      department: 'Customer Success',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
      deviceTimezone: 'Asia/Kolkata',
      eventType: 'IN',
      source: 'web_portal',
      deviceId: 'dev-web-001',
      deviceName: 'Chrome 128 / macOS 15.0',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      ipAddress: '49.207.198.24',
      isFlagged: false,
      idempotencyHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
      syncLatencyMs: 82,
      createdAt: new Date(Date.now() - 1000 * 60 * 85).toISOString()
    },
    {
      id: 'pch-005',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'Elena Rostova',
      department: 'Marketing',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      deviceTimezone: 'Asia/Kolkata',
      eventType: 'IN',
      source: 'mobile_app',
      deviceId: 'dev-mob-005',
      deviceName: 'Google Pixel 8 Pro',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      latitude: 12.9716,
      longitude: 77.5946,
      accuracyMeters: 5,
      isFlagged: true,
      flagReason: 'Mock GPS location detected by mobile sensor telemetry',
      isMockLocation: true,
      idempotencyHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      syncLatencyMs: 410,
      batteryLevel: 94,
      createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString()
    },
    {
      id: 'pch-006',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      deviceTimezone: 'Asia/Kolkata',
      eventType: 'BREAK_OUT',
      source: 'biometric',
      deviceId: 'dev-002',
      deviceName: 'Cafeteria Turnstile 02',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      isFlagged: false,
      idempotencyHash: '7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b',
      syncLatencyMs: 110,
      ipAddress: '192.168.1.108',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    }
  ];

  static async getPunches(tenantId: string, filter?: RawPunchFilterDTO): Promise<{ punches: RawPunchEventDTO[]; total: number }> {
    let result = [...this.punches];

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p => 
        p.employeeName.toLowerCase().includes(q) ||
        p.employeeCode.toLowerCase().includes(q) ||
        (p.deviceName && p.deviceName.toLowerCase().includes(q)) ||
        (p.flagReason && p.flagReason.toLowerCase().includes(q))
      );
    }

    if (filter?.source && filter.source !== 'all') {
      result = result.filter(p => p.source === filter.source);
    }

    if (filter?.eventType && filter.eventType !== 'all') {
      result = result.filter(p => p.eventType === filter.eventType);
    }

    if (filter?.isFlagged !== undefined) {
      result = result.filter(p => p.isFlagged === filter.isFlagged);
    }

    if (filter?.departmentId) {
      result = result.filter(p => p.department.toLowerCase() === filter.departmentId?.toLowerCase());
    }

    // Sort descending by timestamp
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = filter?.page || 1;
    const limit = filter?.limit || 25;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      punches: paginated,
      total: result.length
    };
  }

  static async ingestPunch(tenantId: string, payload: IngestPunchRequestDTO): Promise<IngestPunchResponseDTO> {
    // 1. Generate Idempotency Hash
    const hashInput = `${tenantId}:${payload.employeeId}:${payload.timestamp}:${payload.eventType}:${payload.source}`;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 32);

    // 2. Check for duplicate punch within replay window
    const isDuplicate = this.punches.some(p => p.idempotencyHash === hash);
    if (isDuplicate) {
      return {
        success: false,
        punchId: '',
        status: 'duplicate',
        flagReason: 'Duplicate punch packet rejected (identical idempotency hash within replay window)',
        idempotencyHash: hash,
        message: 'Duplicate punch ignored'
      };
    }

    // 3. Geofence & Sensor Validation
    let isFlagged = false;
    let flagReason: string | undefined = undefined;
    let distanceFromGeofence = 0;

    if (payload.isMockLocation) {
      isFlagged = true;
      flagReason = 'Mock GPS location detected by mobile sensor telemetry';
    } else if (payload.latitude && payload.longitude) {
      const loc = KNOWN_LOCATIONS.find(l => l.id === payload.locationId) || KNOWN_LOCATIONS[0];
      distanceFromGeofence = calculateHaversineDistanceMeters(payload.latitude, payload.longitude, loc.lat, loc.lon);

      if (distanceFromGeofence > loc.radiusMeters) {
        isFlagged = true;
        flagReason = `Outside geofence perimeter (${distanceFromGeofence}m away, allowable: ${loc.radiusMeters}m)`;
      }
    }

    // 4. Save Raw Punch
    const newPunchId = `pch-${Date.now().toString(36)}`;
    const newRecord: RawPunchEventDTO = {
      id: newPunchId,
      tenantId,
      employeeId: payload.employeeId,
      employeeCode: 'EMP-' + payload.employeeId.replace('emp-', ''),
      employeeName: payload.employeeId === 'emp-001' ? 'Sarah Jenkins' : 'Employee ' + payload.employeeId,
      department: 'Engineering',
      timestamp: payload.timestamp,
      deviceTimezone: 'Asia/Kolkata',
      eventType: payload.eventType,
      source: payload.source,
      deviceId: payload.deviceId || 'dev-ingest',
      deviceName: payload.deviceIdentifier || (payload.source === 'mobile_app' ? 'Mobile App' : 'Biometric Terminal'),
      locationId: payload.locationId || 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracyMeters: payload.accuracyMeters,
      distanceFromGeofenceMeters: distanceFromGeofence,
      isFlagged,
      flagReason,
      idempotencyHash: hash,
      syncLatencyMs: payload.offlineQueuedAt 
        ? Math.max(0, new Date().getTime() - new Date(payload.offlineQueuedAt).getTime())
        : 85,
      offlineQueuedAt: payload.offlineQueuedAt,
      batteryLevel: payload.batteryLevel,
      photoUrl: payload.photoUrl,
      isMockLocation: payload.isMockLocation,
      createdAt: new Date().toISOString()
    };

    this.punches.unshift(newRecord);

    return {
      success: true,
      punchId: newPunchId,
      status: isFlagged ? 'flagged' : 'accepted',
      flagReason,
      idempotencyHash: hash,
      processedDayId: `day-${newRecord.employeeId}-${payload.timestamp.split('T')[0]}`,
      evaluatedDayStatus: isFlagged ? 'late' : 'present',
      message: isFlagged 
        ? 'Punch accepted but flagged for HR compliance review' 
        : 'Punch ingested successfully and attendance recalculated'
    };
  }

  static async batchIngest(tenantId: string, batch: BatchIngestPunchRequestDTO): Promise<BatchIngestResponseDTO> {
    const results: IngestPunchResponseDTO[] = [];
    let accepted = 0;
    let flagged = 0;
    let duplicate = 0;

    for (const item of batch.punches) {
      const res = await this.ingestPunch(tenantId, item);
      results.push(res);
      if (res.status === 'accepted') accepted++;
      else if (res.status === 'flagged') flagged++;
      else if (res.status === 'duplicate') duplicate++;
    }

    return {
      totalReceived: batch.punches.length,
      acceptedCount: accepted,
      flaggedCount: flagged,
      duplicateCount: duplicate,
      results
    };
  }

  static async getMetrics(tenantId: string): Promise<PunchMetricsSummaryDTO> {
    const total = this.punches.length;
    const mobile = this.punches.filter(p => p.source === 'mobile_app' || p.source === 'geofence').length;
    const bio = this.punches.filter(p => p.source === 'biometric' || p.source === 'face_recognition' || p.source === 'rfid').length;
    const web = this.punches.filter(p => p.source === 'web_portal' || p.source === 'qr_kiosk').length;
    const flagged = this.punches.filter(p => p.isFlagged).length;
    const avgLatency = Math.round(this.punches.reduce((acc, p) => acc + (p.syncLatencyMs || 0), 0) / (total || 1));

    const compliantMobile = this.punches.filter(p => (p.source === 'mobile_app' || p.source === 'geofence') && !p.isFlagged).length;
    const geofenceRate = mobile > 0 ? Math.round((compliantMobile / mobile) * 100) : 100;

    return {
      totalToday: total,
      mobileGpsCount: mobile,
      biometricCount: bio,
      webKioskCount: web,
      flaggedCount: flagged,
      avgSyncLatencyMs: avgLatency,
      geofenceCompliancePercentage: geofenceRate
    };
  }
}
