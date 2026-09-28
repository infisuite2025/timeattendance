import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  Download,
  Save,
  Navigation,
  Globe,
  Smartphone,
  Layers,
  Sparkles,
  Zap,
  Map as MapIcon,
  Crosshair,
  RefreshCw,
} from 'lucide-react';
import { GeofenceConfigDTO } from '@infi-timepro/shared-types';
import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient';
import { useI18n } from '../../context/I18nContext.tsx';

export const GeofenceOperationsPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotification();
  const [geofences, setGeofences] = useState<GeofenceConfigDTO[]>([]);
  const [selectedGeo, setSelectedGeo] = useState<GeofenceConfigDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State for Active Selected Geofence
  const [radius, setRadius] = useState<number>(100);
  const [antiMock, setAntiMock] = useState<boolean>(true);
  const [minAccuracy, setMinAccuracy] = useState<number>(15);
  const [autoPunch, setAutoPunch] = useState<boolean>(false);

  // Live Location Test Playground
  const [testLat, setTestLat] = useState<number>(12.97162);
  const [testLon, setTestLon] = useState<number>(77.59461);
  const [testResult, setTestResult] = useState<{ isInside: boolean; distance: number } | null>({
    isInside: true,
    distance: 8
  });

  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<GeofenceConfigDTO[]>('/devices/geofences');
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      setGeofences(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedGeo(first);
        setRadius(first.radiusMeters);
        setAntiMock(first.enableAntiMockGps);
        setMinAccuracy(first.minGpsAccuracyMeters);
        setAutoPunch(first.autoPunchOnEntry);
        setTestLat(first.latitude + 0.0001);
        setTestLon(first.longitude + 0.0001);
      }
    } catch {
      toast.error('Failed to load geofencing configurations from database');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGeofence = (geo: GeofenceConfigDTO) => {
    setSelectedGeo(geo);
    setRadius(geo.radiusMeters);
    setAntiMock(geo.enableAntiMockGps);
    setMinAccuracy(geo.minGpsAccuracyMeters);
    setAutoPunch(geo.autoPunchOnEntry);
    setTestLat(geo.latitude + 0.0001);
    setTestLon(geo.longitude + 0.0001);
    setTestResult(null);
  };

  const handleTestCoordinates = () => {
    if (!selectedGeo) return;
    const R = 6371e3;
    const φ1 = (selectedGeo.latitude * Math.PI) / 180;
    const φ2 = (testLat * Math.PI) / 180;
    const Δφ = ((testLat - selectedGeo.latitude) * Math.PI) / 180;
    const Δλ = ((testLon - selectedGeo.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = Math.round(R * c);

    setTestResult({
      isInside: dist <= radius,
      distance: dist
    });
  };

  const handleSaveConfig = async () => {
    if (!selectedGeo) return;
    try {
      const res = await apiClient.put<GeofenceConfigDTO>(`/devices/geofences/${selectedGeo.id}`, {
        radiusMeters: radius,
        enableAntiMockGps: antiMock,
        minGpsAccuracyMeters: minAccuracy,
        autoPunchOnEntry: autoPunch
      });
      if (!res.error) {
        setGeofences(prev =>
          prev.map(g =>
            g.id === selectedGeo.id
              ? {
                  ...g,
                  radiusMeters: radius,
                  enableAntiMockGps: antiMock,
                  minGpsAccuracyMeters: minAccuracy,
                  autoPunchOnEntry: autoPunch
                }
              : g
          )
        );
        toast.success('Geofence Saved', `Perimeter configuration for ${selectedGeo.locationName} saved to database!`);
      }
    } catch {
      toast.error('Failed to update geofence configuration');
    }
  };

  if (loading || !selectedGeo) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600 font-medium text-sm">Loading Geofencing Operations…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('organization.geofencing_operations_perimete', 'Geofencing Operations & Perimeter Builder')}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Anti-Spoofing Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure mobile GPS boundaries, enforce hardware sensor anti-spoofing, and test boundary coordinate compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveConfig}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Perimeter Changes
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{geofences.length}</div>
            <div className="text-xs font-medium text-slate-500">Active Facilities</div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">Across 3 countries</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">842</div>
            <div className="text-xs font-medium text-slate-500">Daily Mobile Check-ins</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">935 assigned mobile workers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">98.4%</div>
            <div className="text-xs font-medium text-slate-500">Geofence Compliance</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Inside authorized radius</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">±8.2m</div>
            <div className="text-xs font-medium text-slate-500">Avg Mobile GPS Accuracy</div>
            <div className="text-[11px] text-purple-700 font-medium mt-0.5">High precision telemetry</div>
          </div>
        </div>
      </div>

      {/* 3. Facility Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {geofences.map((geo) => (
          <div
            key={geo.id}
            onClick={() => handleSelectGeofence(geo)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedGeo.id === geo.id
                ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{geo.city}</span>
              <span className="font-mono text-xs font-semibold text-blue-600">{geo.radiusMeters}m</span>
            </div>
            <div className="text-xs text-slate-700 font-medium mt-1 truncate">{geo.locationName}</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)}</div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>{geo.activeWorkersCount} Workers</span>
              <span className="text-emerald-600 font-semibold">{geo.complianceRatePercentage}%</span>
            </div>
          </div>
        ))}</div>

      {/* 4. Interactive Perimeter Editor & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Map & Perimeter Playground */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Perimeter Visualizer: {selectedGeo.locationName}</h3>
              <p className="text-xs text-slate-500">
                GPS Center: {selectedGeo.latitude}, {selectedGeo.longitude} • Radius: {radius} meters
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Radius: {radius}m
            </span>
          </div>

          {/* Visual Geofence Map Graphic */}
          <div className="relative h-72 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

            {/* Geofence Boundary Circle */}
            <div
              className="absolute rounded-full border-2 border-blue-500 bg-blue-500/15 flex items-center justify-center transition-all duration-300 animate-pulse"
              style={{
                width: `${Math.min(260, Math.max(90, radius * 1.4))}px`,
                height: `${Math.min(260, Math.max(90, radius * 1.4))}px`
              }}
            >
              <div className="w-full h-full rounded-full border border-dashed border-blue-400/60" />
            </div>

            {/* Center Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-slate-800/90 text-white font-mono text-[10px] border border-slate-700 shadow-xs">
                Center HQ
              </span>
            </div>

            {/* Simulated Test Point (If tested) */}
            {testResult && (
              <div
                className={`absolute z-20 flex flex-col items-center transition-all ${
                  testResult.isInside ? 'text-emerald-400' : 'text-rose-400'
                }`}
                style={{
                  top: testResult.isInside ? '42%' : '18%',
                  left: testResult.isInside ? '55%' : '75%'
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg ${
                    testResult.isInside ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] border border-slate-700">
                  {testResult.distance}m ({testResult.isInside ? 'Inside' : 'Breach'})</span>
              </div>
            )}

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Authorized Boundary ({radius}m)</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Inside Verified
              </span>
            </div>
          </div>

          {/* Perimeter Slider */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase">{t('organization.geofence_radius_calibration_me', 'Geofence Radius Calibration (Meters)')}</label>
              <span className="font-mono text-sm font-bold text-blue-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {radius} meters
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="500"
              step="5"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>25m (Tight Single Door)</span>
              <span>100m (Standard Campus)</span>
              <span>500m (Large Industrial Park)</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Anti-Spoofing & Live Test Simulator */}
        <div className="space-y-6">
          {/* Policy & Security Rules */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('organization.anti_spoofing_sensor_rules', 'Anti-Spoofing & Sensor Rules')}</h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiMock}
                  onChange={(e) => setAntiMock(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300"
                />
                <div>
                  <div className="font-bold text-slate-800">Reject Mock GPS Location Spoofing</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Analyzes mobile sensor flags to detect developer mock location apps.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPunch}
                  onChange={(e) => setAutoPunch(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300"
                />
                <div>
                  <div className="font-bold text-slate-800">Auto-Punch on Perimeter Entry</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Automatically clocks in employee when background geofence transition occurs.
                  </div>
                </div>
              </label>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">{t('organization.min_gps_accuracy_filter_meters', 'Min GPS Accuracy Filter (Meters)')}</label>
                <input
                  type="number"
                  value={minAccuracy}
                  onChange={(e) => setMinAccuracy(parseInt(e.target.value, 10) || 15)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Punches with accuracy &gt; ±{minAccuracy}m will be rejected.
                </p>
              </div>
            </div>
          </div>

          {/* Coordinate Test Playground */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('organization.test_location_simulator', 'Test Location Simulator')}</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">{t('organization.simulated_lat', 'Simulated Lat')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={testLat}
                    onChange={(e) => setTestLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600">{t('organization.simulated_lon', 'Simulated Lon')}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={testLon}
                    onChange={(e) => setTestLon(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleTestCoordinates}
                className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Simulate Geofence Verification
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    testResult.isInside
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {testResult.isInside ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    {testResult.isInside
                      ? 'PASSED: Inside Authorized Perimeter'
                      : 'FLAGGED: Out of Geofence Boundary'}</div>
                  <div className="text-[11px] font-mono">
                    Calculated Distance: <strong>{testResult.distance} meters</strong> from center
                    (Allowable: {radius}m)</div>
                </div>
              )}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
