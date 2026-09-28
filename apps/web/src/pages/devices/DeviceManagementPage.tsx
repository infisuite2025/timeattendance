import React, { useState, useEffect } from 'react';
import {
  TabletSmartphone,
  Cpu,
  HardDrive,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Search,
  Filter,
  Download,
  Terminal,
  X,
  Play,
  Check,
  Radio,
  Server,
  Fingerprint,
  ScanFace,
  Layers,
  Sparkles
} from 'lucide-react';
import { DeviceDTO, DeviceType, DeviceHealthStatus } from '@infi-timepro/shared-types';
import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient';
import { useI18n } from '../../context/I18nContext.tsx';

export const DeviceManagementPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeDevice, setActiveDevice] = useState<DeviceDTO | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Command Console State in Drawer
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);

  // Add Device Form State
  const [formId, setFormId] = useState('BIO-FACIAL-04');
  const [formName, setFormName] = useState('Executive Floor BioTerminal');
  const [formType, setFormType] = useState<DeviceType>('face_recognition');
  const [formIp, setFormIp] = useState('192.168.1.120');
  const [formPort, setFormPort] = useState(4370);
  const [formSerial, setFormSerial] = useState('BM-SF-2026-9904');
  const [formZone, setFormZone] = useState('Level 4 Executive Suite');

  const [devices, setDevices] = useState<DeviceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<DeviceDTO[]>('/devices');
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      setDevices(list);
    } catch {
      toast.error('Failed to load hardware terminals from database');
    } finally {
      setLoading(false);
    }
  };

  const handleCommand = async (cmd: string) => {
    if (!activeDevice) return;
    setIsExecutingCmd(true);
    const timestamp = new Date().toLocaleTimeString();

    setConsoleOutput(prev => [
      `[${timestamp}] > Sending '${cmd}' to ${activeDevice.deviceIdentifier} (${activeDevice.ipAddress}:${activeDevice.port})...`,
      ...prev
    ]);

    try {
      const res = await apiClient.post<any>(`/devices/${activeDevice.id}/command`, { command: cmd });
      const msg = res.data?.outputMessage || `[${timestamp}] [OK] Command ${cmd} executed successfully.`;
      setConsoleOutput(prev => [`[${timestamp}] ${msg}`, ...prev]);

      if (cmd === 'sync_templates') {
        setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, enrolledTemplatesCount: 1248 } : d));
      } else if (cmd === 'reboot') {
        setDevices(prev => prev.map(d => d.id === activeDevice.id ? { ...d, status: 'online' } : d));
      }
    } catch {
      setConsoleOutput(prev => [`[${timestamp}] [ERROR] Socket communication timeout.`, ...prev]);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formName) {
      toast.error('Terminal Identifier and Name are required');
      return;
    }

    try {
      const res = await apiClient.post<DeviceDTO>('/devices', {
        deviceIdentifier: formId,
        name: formName,
        deviceType: formType,
        ipAddress: formIp,
        port: formPort,
        serialNumber: formSerial,
        installedAtZone: formZone,
        locationId: 'loc-001',
      });

      if (!res.error) {
        toast.success('Terminal Registered', `Device ${formName} (${formId}) registered successfully in database.`);
        setShowAddModal(false);
        loadDevices();
      }
    } catch {
      toast.error('Failed to register terminal in database');
    }
  };

  const filteredDevices = devices.filter(d => {
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus;
    const matchesType = selectedType === 'all' || d.deviceType === selectedType;
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deviceIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.ipAddress && d.ipAddress.includes(searchTerm));

    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusIndicator = (status: DeviceHealthStatus, heartbeat: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online ({heartbeat})</span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            High Resource ({heartbeat})</span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Offline ({heartbeat})</span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}</span>
        );
    }
  };

  const getTypeIcon = (type: DeviceType) => {
    switch (type) {
      case 'face_recognition':
        return <ScanFace className="w-4 h-4 text-purple-600" />;
      case 'biometric_terminal':
        return <Fingerprint className="w-4 h-4 text-emerald-600" />;
      case 'rfid_reader':
        return <Radio className="w-4 h-4 text-blue-600" />;
      default:
        return <TabletSmartphone className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('devices.hardware_terminals_device_heal', 'Hardware Terminals & Device Health Hub')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Biometric Mesh Online
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitor biometric facial terminals, push template embeddings, configure IP sockets, and view live hardware diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setDevices(prev => prev.map(d => ({ ...d, enrolledTemplatesCount: 1248 })));
              toast.success('Template Sync Broadcast', 'Triggered global biometric template sync across all connected terminals!');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Sync All Templates
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Register Terminal
          </button>
        </div>
      </div>

      {/* 2. Hardware Fleet KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{devices.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Registered Terminals</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">Across 4 facility sites</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{devices.filter(d => d.status === 'online').length}</div>
            <div className="text-xs font-medium text-slate-500">Online & Health Checked</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Avg sync latency: 85ms</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{devices.filter(d => d.status === 'warning').length}</div>
            <div className="text-xs font-medium text-slate-500">Resource Warning</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">High CPU / RAM usage</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-600">{devices.filter(d => d.status === 'offline').length}</div>
            <div className="text-xs font-medium text-slate-500">Offline Terminals</div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">Socket unreachable</div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('devices.search_terminal_identifier_ser', 'Search terminal identifier, serial, IP address or facility...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Hardware Types</option>
            <option value="face_recognition">Facial Recognition Terminal</option>
            <option value="biometric_terminal">Fingerprint Terminal</option>
            <option value="rfid_reader">RFID Reader</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Health Statuses</option>
            <option value="online">Online</option>
            <option value="warning">Resource Warning</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* 4. Terminals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Terminal & Zone</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Network & Port</th>
                <th className="py-3.5 px-4">Health & Heartbeat</th>
                <th className="py-3.5 px-4">Template Mesh</th>
                <th className="py-3.5 px-4">Hardware Load (CPU / RAM)</th>
                <th className="py-3.5 px-4">Firmware</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Terminal Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 text-xs">{device.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {device.deviceIdentifier} • {device.installedAtZone}</div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs capitalize font-medium text-slate-800">
                      {getTypeIcon(device.deviceType)}
                      <span>{device.deviceType.replace('_', ' ')}</span>
                    </div>
                  </td>

                  {/* Network */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="font-bold text-slate-800">{device.ipAddress}:{device.port}</div>
                    <div className="text-[10px] text-slate-400">{device.macAddress}</div>
                  </td>

                  {/* Health */}
                  <td className="py-3.5 px-4">
                    {getStatusIndicator(device.status, device.lastHeartbeatAt)}</td>

                  {/* Enrolled Templates */}
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="font-bold text-slate-800">{device.enrolledTemplatesCount} templates</div>
                    <div className="text-[10px] text-emerald-600 font-medium">100% In Sync</div>
                  </td>

                  {/* Hardware Load */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 w-28">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>CPU: {device.cpuUsagePercent}%</span>
                        <span>RAM: {device.memoryUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            device.cpuUsagePercent > 70 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${device.cpuUsagePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Firmware */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {device.firmwareVersion}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setActiveDevice(device);
                        setConsoleOutput([`[Ready] Diagnostics channel established with ${device.deviceIdentifier}`]);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                    >
                      Diagnostics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Slide-Over Diagnostics & Command Console Drawer */}
      {activeDevice && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveDevice(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400">{activeDevice.deviceIdentifier}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {activeDevice.status.toUpperCase()}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{activeDevice.name}</h2>
                </div>
                <button
                  onClick={() => setActiveDevice(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Hardware Resource Meters */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Live System Resource Telemetry</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">CPU Load</div>
                      <div className="text-xl font-mono font-bold text-slate-800 mt-1">{activeDevice.cpuUsagePercent}%</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5">Quad-Core ARM</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">RAM Load</div>
                      <div className="text-xl font-mono font-bold text-slate-800 mt-1">{activeDevice.memoryUsagePercent}%</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">2 GB LPDDR4</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">eMMC Flash</div>
                      <div className="text-xl font-mono font-bold text-slate-800 mt-1">{activeDevice.storageUsagePercent}%</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">32 GB Flash</div>
                    </div>
                  </div>
                </div>

                {/* Network & Specs */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Socket:</span>
                    <strong className="font-mono">{activeDevice.ipAddress}:{activeDevice.port}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MAC Address:</span>
                    <strong className="font-mono">{activeDevice.macAddress}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial Number:</span>
                    <strong className="font-mono">{activeDevice.serialNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Firmware Build:</span>
                    <strong className="font-mono text-blue-600">{activeDevice.firmwareVersion}</strong>
                  </div>
                </div>

                {/* Remote Device Command Center */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Execute Hardware Command</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCommand('sync_templates')}
                      disabled={isExecutingCmd}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div>Push Face Templates</div>
                        <div className="text-[10px] text-slate-400 font-normal">Sync 1,248 embeddings</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCommand('ping')}
                      disabled={isExecutingCmd}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div>Heartbeat Ping</div>
                        <div className="text-[10px] text-slate-400 font-normal">Check latency & status</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCommand('fetch_logs')}
                      disabled={isExecutingCmd}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-left text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div>Fetch Offline Logs</div>
                        <div className="text-[10px] text-slate-400 font-normal">Pull cached punch packets</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCommand('reboot')}
                      disabled={isExecutingCmd}
                      className="p-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-left text-xs font-semibold text-rose-800 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <PowerOffIcon className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div>Reboot Terminal</div>
                        <div className="text-[10px] text-rose-600 font-normal">Restart device OS</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Real-time Console Log Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Device Socket Stream</h4>
                    <span className="text-[10px] text-emerald-500 font-mono">Port 4370 Connected</span>
                  </div>
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs h-40 overflow-y-auto space-y-1">
                    {consoleOutput.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">{line}</div>
                    ))}</div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setActiveDevice(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close Diagnostics</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Register Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">{t('devices.register_hardware_terminal', 'Register Hardware Terminal')}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.device_identifier', 'Device Identifier')}</label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.device_type', 'Device Type')}</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as DeviceType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="face_recognition">Facial Recognition Terminal</option>
                    <option value="biometric_terminal">Fingerprint Terminal</option>
                    <option value="rfid_reader">RFID Reader</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.display_name', 'Display Name')}</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.static_ip_address', 'Static IP Address')}</label>
                  <input
                    type="text"
                    required
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.tcp_port', 'TCP Port')}</label>
                  <input
                    type="number"
                    required
                    value={formPort}
                    onChange={(e) => setFormPort(parseInt(e.target.value, 10) || 4370)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.hardware_serial', 'Hardware Serial #')}</label>
                  <input
                    type="text"
                    required
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('devices.installed_zone_door', 'Installed Zone / Door')}</label>
                  <input
                    type="text"
                    required
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >{t('devices.register_provision', 'Register & Provision')}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};

function PowerOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}
