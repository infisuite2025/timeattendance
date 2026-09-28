import React, { useState } from 'react';
import {
  Clock,
  Smartphone,
  Fingerprint,
  Globe,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Download,
  RefreshCw,
  PlusCircle,
  Eye,
  X,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Battery,
  Wifi,
  Terminal,
  Activity,
  Zap,
  Map
} from 'lucide-react';
import { RawPunchEventDTO, PunchSource, PunchType } from '@infi-timepro/shared-types';
import { useI18n } from '../../context/I18nContext.tsx';

export const PunchTimelinePage: React.FC = () => {
  const { t } = useI18n();
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState('today');

  // Slide-over & Modal States
  const [inspectedPunch, setInspectedPunch] = useState<RawPunchEventDTO | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation Form State
  const [simEmployeeId, setSimEmployeeId] = useState('emp-001');
  const [simEventType, setSimEventType] = useState<PunchType>('IN');
  const [simSource, setSimSource] = useState<PunchSource>('mobile_app');
  const [simDistance, setSimDistance] = useState<number>(15);
  const [simMockGps, setSimMockGps] = useState<boolean>(false);

  // Mock Punches State
  const [punches, setPunches] = useState<RawPunchEventDTO[]>([
    {
      id: 'pch-001',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      timestamp: '2026-09-14T09:02:14.230Z',
      deviceTimezone: 'Asia/Kolkata (+05:30)',
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
      createdAt: '2026-09-14T09:02:14.375Z'
    },
    {
      id: 'pch-002',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      timestamp: '2026-09-14T09:14:48.110Z',
      deviceTimezone: 'Asia/Kolkata (+05:30)',
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
      createdAt: '2026-09-14T09:14:48.490Z'
    },
    {
      id: 'pch-003',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      timestamp: '2026-09-14T09:28:10.005Z',
      deviceTimezone: 'Asia/Kolkata (+05:30)',
      eventType: 'IN',
      source: 'geofence',
      deviceId: 'dev-mob-003',
      deviceName: 'Samsung Galaxy S24 (Android 15)',
      locationId: 'loc-001',
      locationName: 'Bengaluru Tech Park HQ',
      latitude: 12.97520,
      longitude: 77.59810,
      accuracyMeters: 45,
      distanceFromGeofenceMeters: 520,
      isFlagged: true,
      flagReason: 'Outside geofence perimeter (520m away from authorized perimeter)',
      idempotencyHash: '3d8a1c9012f45e78bc90123a456def78',
      syncLatencyMs: 620,
      batteryLevel: 42,
      isMockLocation: false,
      createdAt: '2026-09-14T09:28:10.625Z'
    },
    {
      id: 'pch-004',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-004',
      employeeCode: 'EMP-1004',
      employeeName: 'David Rodriguez',
      department: 'Customer Success',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      timestamp: '2026-09-14T09:45:00.800Z',
      deviceTimezone: 'Asia/Kolkata (+05:30)',
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
      createdAt: '2026-09-14T09:45:00.882Z'
    },
    {
      id: 'pch-005',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-005',
      employeeCode: 'EMP-1005',
      employeeName: 'Elena Rostova',
      department: 'Marketing',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      timestamp: '2026-09-14T10:12:30.400Z',
      deviceTimezone: 'Asia/Kolkata (+05:30)',
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
      createdAt: '2026-09-14T10:12:30.810Z'
    },
    {
      id: 'pch-006',
      tenantId: 'tenant-demo-001',
      employeeId: 'emp-001',
      employeeCode: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      timestamp: '2026-09-14T13:05:12.110Z',
      deviceTimezone: 'Asia/Kolkata (+05:30)',
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
      createdAt: '2026-09-14T13:05:12.220Z'
    }
  ]);

  // Handle Simulation
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    setTimeout(() => {
      const isOutside = simDistance > 100;
      const isFlagged = simMockGps || isOutside;
      let flagReason: string | undefined = undefined;
      if (simMockGps) flagReason = 'Mock GPS location detected by mobile sensor telemetry';
      else if (isOutside) flagReason = `Outside geofence perimeter (${simDistance}m away, allowable: 100m)`;

      const newPunch: RawPunchEventDTO = {
        id: `pch-${Date.now().toString(36)}`,
        tenantId: 'tenant-demo-001',
        employeeId: simEmployeeId,
        employeeCode: simEmployeeId === 'emp-001' ? 'EMP-1001' : 'EMP-1002',
        employeeName: simEmployeeId === 'emp-001' ? 'Sarah Jenkins' : 'Michael Chang',
        department: simEmployeeId === 'emp-001' ? 'Engineering' : 'Product Design',
        avatarUrl: simEmployeeId === 'emp-001'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        timestamp: new Date().toISOString(),
        deviceTimezone: 'Asia/Kolkata (+05:30)',
        eventType: simEventType,
        source: simSource,
        deviceId: 'sim-dev-01',
        deviceName: simSource === 'mobile_app' ? 'iPhone 16 Pro (Simulator)' : 'Biometric Terminal HQ',
        locationId: 'loc-001',
        locationName: 'Bengaluru Tech Park HQ',
        latitude: 12.9716,
        longitude: 77.5946,
        distanceFromGeofenceMeters: simDistance,
        accuracyMeters: 8,
        isFlagged,
        flagReason,
        isMockLocation: simMockGps,
        idempotencyHash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        syncLatencyMs: Math.floor(Math.random() * 200) + 50,
        batteryLevel: 92,
        createdAt: new Date().toISOString()
      };

      setPunches(prev => [newPunch, ...prev]);
      setIsSimulating(false);
      setShowSimulateModal(false);
    }, 600);
  };

  // Filter Punches
  const filteredPunches = punches.filter(p => {
    const matchesSearch = 
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.deviceName && p.deviceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.flagReason && p.flagReason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSource = selectedSource === 'all' || p.source === selectedSource;
    const matchesEventType = selectedEventType === 'all' || p.eventType === selectedEventType;
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'flagged' && p.isFlagged) || 
      (selectedStatus === 'accepted' && !p.isFlagged);

    return matchesSearch && matchesSource && matchesEventType && matchesStatus;
  });

  const getSourceIcon = (source: PunchSource) => {
    switch (source) {
      case 'mobile_app': return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'biometric':
      case 'face_recognition': return <Fingerprint className="w-4 h-4 text-emerald-600" />;
      case 'geofence': return <MapPin className="w-4 h-4 text-purple-600" />;
      case 'web_portal': return <Globe className="w-4 h-4 text-indigo-600" />;
      default: return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventTypeBadge = (type: PunchType) => {
    switch (type) {
      case 'IN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">PUNCH IN</span>;
      case 'OUT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">PUNCH OUT</span>;
      case 'BREAK_OUT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">BREAK OUT</span>;
      case 'BREAK_IN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">BREAK IN</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Gateway Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('attendance.punch_timeline_raw_time_events', 'Punch Timeline & Raw Time Events')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Gateway Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Immutable, audit-ready stream of raw biometric, mobile GPS, and device telemetry punches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Zap className="w-4 h-4 text-blue-600" />
            Simulate Ingestion
          </button>
          <button
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Export Telemetry
          </button>
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reprocess Queue
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">1,482</div>
            <div className="text-xs font-medium text-slate-500">Total Punches Today</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">↑ 12% vs last week</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">842</div>
            <div className="text-xs font-medium text-slate-500">Mobile GPS (98.2% in Geofence)</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Avg Accuracy: ±8m</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">640</div>
            <div className="text-xs font-medium text-slate-500">Biometric & Terminals</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">All 14 terminals online</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">18</div>
            <div className="text-xs font-medium text-slate-500">Flagged & Policy Breaches</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Requires supervisor sign-off</div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('attendance.search_employee_name_code_devi', 'Search employee name, code, device serial, IP or flag reason...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Channel / Source Dropdown */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Channels</option>
              <option value="biometric">Biometric & Face</option>
              <option value="mobile_app">Mobile App</option>
              <option value="geofence">Geofence Auto-Trigger</option>
              <option value="web_portal">Web Portal</option>
            </select>

            {/* Event Type Dropdown */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="IN">Punch IN</option>
              <option value="OUT">Punch OUT</option>
              <option value="BREAK_OUT">Break OUT</option>
              <option value="BREAK_IN">Break IN</option>
            </select>

            {/* Verification Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="accepted">Accepted Only</option>
              <option value="flagged">Flagged & Breaches Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Telemetry Stream Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">{t('attendance.ingested_raw_telemetry_stream', 'Ingested Raw Telemetry Stream')}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {filteredPunches.length} events
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Gateway Cluster: ap-south-1 / UTC+05:30
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp (UTC / Local)</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Channel & Device</th>
                <th className="py-3.5 px-4">Location & Geofence</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPunches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No punch telemetry matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredPunches.map((punch) => {
                  const date = new Date(punch.timestamp);
                  const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                  const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={punch.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp & Latency */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-900 text-xs">
                          {timeFormatted}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{dateFormatted}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-emerald-600 bg-emerald-50 px-1 rounded text-[10px]">
                            {punch.syncLatencyMs}ms
                          </span>
                        </div>
                      </td>

                      {/* Employee */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={punch.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                            alt={punch.employeeName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{punch.employeeName}</div>
                            <div className="text-xs text-slate-500">{punch.employeeCode} • {punch.department}</div>
                          </div>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4">
                        {getEventTypeBadge(punch.eventType)}</td>

                      {/* Channel & Device */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                            {getSourceIcon(punch.source)}</div>
                          <div>
                            <div className="font-medium text-slate-800 text-xs capitalize">
                              {punch.source.replace('_', ' ')}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                              {punch.deviceName || punch.deviceId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Geofence */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-800">
                          {punch.locationName || 'Bengaluru Tech Park HQ'}</div>
                        {punch.distanceFromGeofenceMeters !== undefined && (
                          <div className="text-[11px] mt-0.5">
                            {punch.distanceFromGeofenceMeters > 100 ? (
                              <span className="text-rose-600 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {punch.distanceFromGeofenceMeters}m away (Out of bounds)</span>
                            ) : (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Within {punch.distanceFromGeofenceMeters}m of center
                              </span>
                            )}</div>
                        )}</td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {punch.isFlagged ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span className="truncate max-w-[150px]" title={punch.flagReason}>
                              {punch.isMockLocation ? 'Mock GPS Detected' : 'Geofence Breach'}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Verified & Passed</span>
                          </div>
                        )}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setInspectedPunch(punch)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Inspect Payload
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Slide-Over Payload Telemetry Inspector Drawer */}
      {inspectedPunch && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInspectedPunch(null)}
          />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Drawer Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">{t('attendance.punch_telemetry_inspector', 'Punch Telemetry Inspector')}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {inspectedPunch.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedPunch(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Employee Header */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={inspectedPunch.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={inspectedPunch.employeeName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{inspectedPunch.employeeName}</h3>
                    <p className="text-xs text-slate-500">{inspectedPunch.employeeCode} • {inspectedPunch.department}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {getEventTypeBadge(inspectedPunch.eventType)}
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium capitalize">{inspectedPunch.source}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status Banner */}
                {inspectedPunch.isFlagged ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      Policy Breach Flagged
                    </div>
                    <p className="text-xs text-rose-700 mt-1">
                      {inspectedPunch.flagReason}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Cryptographically Verified & Compliant
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      All biometric and GPS geofence checks passed successfully.
                    </p>
                  </div>
                )}

                {/* Telemetry Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Device & Ingestion Telemetry</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Device Model / Name</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{inspectedPunch.deviceName || 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Device ID / MAC</div>
                      <div className="font-semibold text-slate-800 mt-0.5 font-mono">{inspectedPunch.deviceId || 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Client IP Address</div>
                      <div className="font-semibold text-slate-800 mt-0.5 font-mono">{inspectedPunch.ipAddress || '192.168.1.104'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400">Sync Latency</div>
                      <div className="font-semibold text-emerald-600 mt-0.5">{inspectedPunch.syncLatencyMs} ms</div>
                    </div>
                    {inspectedPunch.batteryLevel !== undefined && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-400">Battery Level</div>
                        <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5 text-slate-500" />
                          {inspectedPunch.batteryLevel}%
                        </div>
                      </div>
                    )}
                    {inspectedPunch.accuracyMeters !== undefined && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-slate-400">GPS Accuracy</div>
                        <div className="font-semibold text-slate-800 mt-0.5">±{inspectedPunch.accuracyMeters} meters</div>
                      </div>
                    )}</div>
                </div>

                {/* Raw JSON Code Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Raw Ingestion JSON Payload</h4>
                    <span className="text-[10px] text-slate-400 font-mono">SHA-256 Idempotency Hash Verified</span>
                  </div>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                    {JSON.stringify(inspectedPunch, null, 2)}</pre>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setInspectedPunch(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Simulate Punch Ingestion Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white">{t('attendance.simulate_device_punch_ingestio', 'Simulate Device Punch Ingestion')}</h3>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('attendance.employee', 'Employee')}</label>
                <select
                  value={simEmployeeId}
                  onChange={(e) => setSimEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="emp-001">Sarah Jenkins (EMP-1001) - Engineering</option>
                  <option value="emp-002">Michael Chang (EMP-1002) - Product Design</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('attendance.event_type', 'Event Type')}</label>
                  <select
                    value={simEventType}
                    onChange={(e) => setSimEventType(e.target.value as PunchType)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IN">PUNCH IN</option>
                    <option value="OUT">PUNCH OUT</option>
                    <option value="BREAK_OUT">BREAK OUT</option>
                    <option value="BREAK_IN">BREAK IN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('attendance.ingestion_channel', 'Ingestion Channel')}</label>
                  <select
                    value={simSource}
                    onChange={(e) => setSimSource(e.target.value as PunchSource)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mobile_app">Mobile App (GPS)</option>
                    <option value="biometric">Biometric Facial Terminal</option>
                    <option value="geofence">Background Geofence</option>
                    <option value="web_portal">Web Kiosk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('attendance.simulated_distance_from_geofen', 'Simulated Distance from Geofence Center (Meters)')}</label>
                <input
                  type="number"
                  value={simDistance}
                  onChange={(e) => setSimDistance(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Allowable HQ perimeter: 100 meters. (Values &gt; 100 will trigger an automatic policy breach flag).
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simMockGps}
                    onChange={(e) => setSimMockGps(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Simulate Mock GPS Spoofing Sensor Trigger</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Ingesting...
                    </>
                  ) : (
                    'Transmit Punch Packet'
                  )}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
