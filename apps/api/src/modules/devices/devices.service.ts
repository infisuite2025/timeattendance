import {
  DeviceDTO,
  CreateDeviceRequestDTO,
  GeofenceConfigDTO,
  DeviceCommandRequestDTO,
  DeviceCommandResponseDTO
} from '@infi-timepro/shared-types';

export class DevicesService {
  private static devices: DeviceDTO[] = [
    {
      id: 'dev-001',
      tenantId: 'tenant-demo-001',
      deviceIdentifier: 'BIO-FACIAL-01',
      name: 'BioMax SpeedFace 01 (Main Gate Turnstile)',
      deviceType: 'face_recognition',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      ipAddress: '192.168.1.104',
      port: 4370,
      macAddress: '00:1A:79:8F:32:01',
      status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 1000 * 12).toISOString(),
      enrolledTemplatesCount: 1248,
      firmwareVersion: 'v4.2.1-lts',
      cpuUsagePercent: 24,
      memoryUsagePercent: 42,
      storageUsagePercent: 38,
      lastSyncLatencyMs: 85,
      serialNumber: 'BM-SF-2026-9901',
      installedAtZone: 'Main Gate East Lobby',
      createdAt: '2026-01-15T00:00:00.000Z'
    },
    {
      id: 'dev-002',
      tenantId: 'tenant-demo-001',
      deviceIdentifier: 'BIO-CAFETERIA-02',
      name: 'Cafeteria Turnstile Terminal 02',
      deviceType: 'biometric_terminal',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      ipAddress: '192.168.1.108',
      port: 4370,
      macAddress: '00:1A:79:8F:32:02',
      status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 1000 * 25).toISOString(),
      enrolledTemplatesCount: 1248,
      firmwareVersion: 'v4.2.1-lts',
      cpuUsagePercent: 18,
      memoryUsagePercent: 39,
      storageUsagePercent: 31,
      lastSyncLatencyMs: 92,
      serialNumber: 'BM-SF-2026-9902',
      installedAtZone: 'Level 2 Cafeteria Access',
      createdAt: '2026-01-15T00:00:00.000Z'
    },
    {
      id: 'dev-003',
      tenantId: 'tenant-demo-001',
      deviceIdentifier: 'RFID-SERVER-01',
      name: 'Datacenter Server Room Access Reader',
      deviceType: 'rfid_reader',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      ipAddress: '192.168.1.112',
      port: 5005,
      macAddress: '00:1A:79:8F:44:11',
      status: 'online',
      lastHeartbeatAt: new Date(Date.now() - 1000 * 40).toISOString(),
      enrolledTemplatesCount: 85,
      firmwareVersion: 'v3.8.0',
      cpuUsagePercent: 12,
      memoryUsagePercent: 28,
      storageUsagePercent: 15,
      lastSyncLatencyMs: 45,
      serialNumber: 'RFID-PRO-2026-401',
      installedAtZone: 'Basement Server Hall',
      createdAt: '2026-02-10T00:00:00.000Z'
    },
    {
      id: 'dev-004',
      tenantId: 'tenant-demo-001',
      deviceIdentifier: 'BIO-MUMBAI-01',
      name: 'Mumbai Reception Biometric Kiosk',
      deviceType: 'face_recognition',
      locationId: 'loc-002',
      locationName: 'Mumbai Financial Centre',
      ipAddress: '10.20.4.15',
      port: 4370,
      macAddress: '00:1A:79:8F:90:88',
      status: 'warning',
      lastHeartbeatAt: new Date(Date.now() - 1000 * 180).toISOString(),
      enrolledTemplatesCount: 420,
      firmwareVersion: 'v4.1.8',
      cpuUsagePercent: 78,
      memoryUsagePercent: 84,
      storageUsagePercent: 91,
      lastSyncLatencyMs: 480,
      serialNumber: 'BM-SF-2026-8812',
      installedAtZone: 'Ground Floor Reception',
      createdAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'dev-005',
      tenantId: 'tenant-demo-001',
      deviceIdentifier: 'BIO-SINGAPORE-01',
      name: 'Singapore Hub Main Gate BioTerminal',
      deviceType: 'biometric_terminal',
      locationId: 'loc-003',
      locationName: 'Singapore Regional Hub',
      ipAddress: '172.16.8.22',
      port: 4370,
      macAddress: '00:1A:79:99:12:44',
      status: 'offline',
      lastHeartbeatAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      enrolledTemplatesCount: 310,
      firmwareVersion: 'v4.0.2',
      cpuUsagePercent: 0,
      memoryUsagePercent: 0,
      storageUsagePercent: 44,
      lastSyncLatencyMs: 0,
      serialNumber: 'BM-SF-2025-1049',
      installedAtZone: 'Main Lobby Turnstile',
      createdAt: '2025-11-20T00:00:00.000Z'
    }
  ];

  private static geofences: GeofenceConfigDTO[] = [
    {
      id: 'geo-001',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      city: 'Bengaluru',
      country: 'India',
      latitude: 12.9716,
      longitude: 77.5946,
      radiusMeters: 100,
      enableAntiMockGps: true,
      minGpsAccuracyMeters: 15,
      autoPunchOnEntry: false,
      activeWorkersCount: 480,
      complianceRatePercentage: 98.4,
      dailyPunchesCount: 842
    },
    {
      id: 'geo-002',
      locationId: 'loc-002',
      locationName: 'Mumbai Financial Centre',
      city: 'Mumbai',
      country: 'India',
      latitude: 19.0760,
      longitude: 72.8777,
      radiusMeters: 150,
      enableAntiMockGps: true,
      minGpsAccuracyMeters: 20,
      autoPunchOnEntry: false,
      activeWorkersCount: 220,
      complianceRatePercentage: 96.8,
      dailyPunchesCount: 380
    },
    {
      id: 'geo-003',
      locationId: 'loc-003',
      locationName: 'Singapore Regional Hub',
      city: 'Singapore',
      country: 'Singapore',
      latitude: 1.2833,
      longitude: 103.8500,
      radiusMeters: 100,
      enableAntiMockGps: true,
      minGpsAccuracyMeters: 10,
      autoPunchOnEntry: true,
      activeWorkersCount: 140,
      complianceRatePercentage: 99.1,
      dailyPunchesCount: 210
    },
    {
      id: 'geo-004',
      locationId: 'loc-004',
      locationName: 'London Tech Hub',
      city: 'London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      radiusMeters: 120,
      enableAntiMockGps: true,
      minGpsAccuracyMeters: 15,
      autoPunchOnEntry: false,
      activeWorkersCount: 95,
      complianceRatePercentage: 97.5,
      dailyPunchesCount: 160
    }
  ];

  static async getDevices(tenantId: string, filter?: { status?: string; search?: string }): Promise<DeviceDTO[]> {
    let list = [...this.devices];
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(d => d.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.deviceIdentifier.toLowerCase().includes(q) || d.locationName.toLowerCase().includes(q));
    }
    return list;
  }

  static async createDevice(tenantId: string, payload: CreateDeviceRequestDTO): Promise<DeviceDTO> {
    const newDevice: DeviceDTO = {
      id: `dev-${Date.now().toString(36)}`,
      tenantId,
      deviceIdentifier: payload.deviceIdentifier,
      name: payload.name,
      deviceType: payload.deviceType,
      locationId: payload.locationId,
      locationName: 'Bengaluru Tech Park HQ',
      ipAddress: payload.ipAddress || '192.168.1.150',
      port: payload.port || 4370,
      macAddress: '00:1A:79:' + Math.floor(10 + Math.random() * 89) + ':AA:BB',
      status: 'online',
      lastHeartbeatAt: new Date().toISOString(),
      enrolledTemplatesCount: 0,
      firmwareVersion: payload.firmwareVersion || 'v4.2.1-lts',
      cpuUsagePercent: 15,
      memoryUsagePercent: 32,
      storageUsagePercent: 20,
      lastSyncLatencyMs: 65,
      serialNumber: payload.serialNumber,
      installedAtZone: payload.installedAtZone,
      createdAt: new Date().toISOString()
    };

    this.devices.unshift(newDevice);
    return newDevice;
  }

  static async executeCommand(payload: DeviceCommandRequestDTO): Promise<DeviceCommandResponseDTO> {
    const device = this.devices.find(d => d.id === payload.deviceId);
    if (!device) throw new Error('Device not found');

    let outputMessage = '';
    switch (payload.command) {
      case 'sync_templates':
        device.enrolledTemplatesCount = 1248;
        outputMessage = `Template synchronization complete: 1,248 face templates and RFID tokens synced to ${device.deviceIdentifier}.`;
        break;
      case 'reboot':
        device.status = 'online';
        device.lastHeartbeatAt = new Date().toISOString();
        outputMessage = `Reboot command sent to ${device.ipAddress}:${device.port}. Terminal rebooting and reconnecting.`;
        break;
      case 'ping':
        outputMessage = `Heartbeat ping successful: round-trip latency ${device.lastSyncLatencyMs}ms. Status: ${device.status.toUpperCase()}.`;
        break;
      default:
        outputMessage = `Command ${payload.command} executed successfully on ${device.deviceIdentifier}.`;
    }

    return {
      success: true,
      commandId: `cmd-${Date.now()}`,
      deviceId: payload.deviceId,
      outputMessage,
      executedAt: new Date().toISOString()
    };
  }

  static async getGeofences(tenantId: string): Promise<GeofenceConfigDTO[]> {
    return this.geofences;
  }

  static async updateGeofence(id: string, updates: Partial<GeofenceConfigDTO>): Promise<GeofenceConfigDTO> {
    const index = this.geofences.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Geofence configuration not found');

    this.geofences[index] = { ...this.geofences[index], ...updates };
    return this.geofences[index];
  }
}
