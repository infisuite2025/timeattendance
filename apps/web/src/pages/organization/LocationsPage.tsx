import React from 'react';
import { MapPin, Building, ShieldCheck, ChevronRight, TabletSmartphone, Users, Plus } from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';

export const LocationsPage: React.FC = () => {
  const { t } = useI18n();
  const locations = [
    {
      id: 'loc_hyd_001',
      code: 'LOC-HYD',
      name: 'Hyderabad Main Office',
      address: 'Plot No. 5, HITEC City, Madhapur, Hyderabad, Telangana 500081',
      tz: 'Asia/Kolkata (IST)',
      coords: '17.4435° N, 78.3772° E',
      radius: '150 meters',
      employees: 650,
      devices: 4,
      status: 'operational',
    },
    {
      id: 'loc_blr_002',
      code: 'LOC-BLR',
      name: 'Bengaluru HQ',
      address: 'Koramangala 4th Block, Bengaluru, Karnataka 560034',
      tz: 'Asia/Kolkata (IST)',
      coords: '12.9352° N, 77.6245° E',
      radius: '200 meters',
      employees: 302,
      devices: 3,
      status: 'operational',
    },
    {
      id: 'loc_mum_003',
      code: 'LOC-MUM',
      name: 'Mumbai Office',
      address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
      tz: 'Asia/Kolkata (IST)',
      coords: '19.0664° N, 72.8677° E',
      radius: '150 meters',
      employees: 146,
      devices: 2,
      status: 'operational',
    },
    {
      id: 'loc_del_004',
      code: 'LOC-DEL',
      name: 'Delhi Office',
      address: 'Connaught Place, New Delhi, Delhi 110001',
      tz: 'Asia/Kolkata (IST)',
      coords: '28.6304° N, 77.2177° E',
      radius: '150 meters',
      employees: 100,
      devices: 2,
      status: 'operational',
    },
    {
      id: 'loc_chn_005',
      code: 'LOC-CHN',
      name: 'Chennai Plant',
      address: 'Sriperumbudur Industrial Corridor, Chennai, Tamil Nadu 602105',
      tz: 'Asia/Kolkata (IST)',
      coords: '12.9716° N, 79.9416° E',
      radius: '500 meters',
      employees: 50,
      devices: 1,
      status: 'alert',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Locations & Geofences</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('organization.locations_plants_geofencing_hu', 'Locations, Plants & Geofencing Hub')}</h1>
          <p className="text-xs text-slate-500">
            Configure physical enterprise facilities, circular geofence perimeters, and biometric terminal mapping.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Location Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div key={loc.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{loc.name}</h3>
                  <span className="text-[10px] font-semibold text-slate-400">{loc.code}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  loc.status === 'operational'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {loc.status === 'operational' ? 'Active' : 'Alert'}</span>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">{loc.address}</p>

            <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" /> Geofence Radius
                </span>
                <span className="font-semibold text-slate-800">{loc.radius}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Users className="h-3.5 w-3.5 text-emerald-500" /> Assigned Staff
                </span>
                <span className="font-semibold text-slate-800">{loc.employees}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <TabletSmartphone className="h-3.5 w-3.5 text-purple-500" /> Connected Devices
                </span>
                <span className="font-semibold text-slate-800">{loc.devices} Terminals</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400">{loc.tz}</span>
              <button className="font-semibold text-blue-600 hover:underline">{t('organization.configure_geofence_rarr', 'Configure Geofence &rarr;')}</button>
            </div>
          </div>
        ))}</div>
    </div>
  );
};
