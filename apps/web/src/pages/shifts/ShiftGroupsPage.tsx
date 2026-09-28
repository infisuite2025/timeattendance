import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  RotateCw,
  Layers,
  CheckCircle,
  Building,
  Edit2,
  X,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const ShiftGroupsPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotification();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupPattern, setNewGroupPattern] = useState('Rotational');
  const [newGroupDepts, setNewGroupDepts] = useState('Operations & Production');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any[]>('/shifts/groups');
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      const mapped = list.map((g: any) => ({
        code: g.code,
        name: g.name,
        description: g.description,
        included: Array.isArray(g.includedShifts) ? g.includedShifts.join(', ') : (g.includedShifts || 'General'),
        includedShifts: Array.isArray(g.includedShifts) ? g.includedShifts : [g.includedShifts || 'General'],
        locations: g.locations || 'All Departments',
        employees: g.employeeCount || 0,
        pattern: g.patternType || 'Fixed',
        patternType: g.patternType || 'Fixed',
        status: g.status || 'active',
      }));
      setGroups(mapped);
      if (mapped.length > 0) setSelectedGroup(mapped[0]);
    } catch {
      toast.error('Failed to load shift groups from database');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) {
      toast.error('Group name required');
      return;
    }
    const res = await apiClient.post('/shifts/groups', {
      name: newGroupName,
      code: newGroupCode || `GRP-${Math.floor(100 + Math.random() * 900)}`,
      patternType: newGroupPattern,
      locations: newGroupDepts,
    });
    if (!res.error) {
      toast.success('Shift Group Created', `Shift group "${newGroupName}" added to database!`);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupCode('');
      loadGroups();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Shift Groups</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('shifts.shift_groups', 'Shift Groups')}</h1>
          <p className="text-xs text-slate-500">
            Organize multiple shifts into groups and assign them to employees.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] font-bold text-slate-400">Total</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">12</p>
          <p className="text-xs font-semibold text-slate-600">Total Groups</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold text-emerald-600">Active</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">9</p>
          <p className="text-xs font-semibold text-slate-600">Active Groups</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-500">
            <RotateCw className="h-5 w-5" />
            <span className="text-[10px] font-bold text-blue-600">Rotational</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">3</p>
          <p className="text-xs font-semibold text-slate-600">Rotational Groups</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-bold text-purple-600">Assigned</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600">248</p>
          <p className="text-xs font-semibold text-slate-600">Assigned Employees</p>
        </div>
      </div>

      {/* Main Content & Detail Drawer Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Table Area (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none">
                <option>All Departments</option>
                <option>Head Office</option>
                <option>Manufacturing</option>
              </select>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('shifts.search_shift_groups', 'Search shift groups...')}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Shift Groups Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="w-8 px-4 py-3">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
                  </th>
                  <th className="px-4 py-3">Group Name</th>
                  <th className="px-4 py-3">Included Shifts</th>
                  <th className="px-4 py-3">Locations / Depts</th>
                  <th className="px-4 py-3">Employees</th>
                  <th className="px-4 py-3">Pattern Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="w-10 px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groups.map((g: any) => (
                  <tr
                    key={g.code}
                    onClick={() => setSelectedGroup(g)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{g.name}</p>
                      <p className="text-[10px] text-slate-400">{g.code}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{g.included}</td>
                    <td className="px-4 py-3 text-slate-600">{g.locations}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{g.employees}</td>
                    <td className="px-4 py-3 text-slate-600">{g.pattern}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          g.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {g.status.charAt(0).toUpperCase() + g.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-over Detail Drawer */}
        {selectedGroup && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selectedGroup.groupName}</h3>
                <span className="text-xs text-slate-400 font-mono">{selectedGroup.groupCode}</span>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2 text-xs font-semibold text-slate-600">
              <button className="text-blue-600 border-b-2 border-blue-600 pb-1">{t('shifts.overview', 'Overview')}</button>
              <button className="hover:text-slate-900">{t('shifts.weekly_pattern', 'Weekly Pattern')}</button>
              <button className="hover:text-slate-900">{t('shifts.assigned_employees', 'Assigned Employees')}</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-500 text-[11px]">Included Shifts</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedGroup.includedShifts.map((s: string) => (
                    <span key={s} className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {s}</span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Locations / Departments</span>
                  <span className="font-semibold text-slate-900">{selectedGroup.locations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pattern Type</span>
                  <span className="font-semibold text-slate-900">{selectedGroup.patternType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Employees</span>
                  <span className="font-bold text-blue-600">{selectedGroup.employees}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
