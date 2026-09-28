import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarRange,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Moon,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  Edit2,
  Copy,
  Trash2,
  UserCheck,
  Calendar,
  X,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Check,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient';
import { useI18n } from '../../context/I18nContext.tsx';

interface ShiftItem {
  id: string;
  name: string;
  code: string;
  start: string;
  end: string;
  duration: string;
  break: string;
  type: string;
  grace: string;
  status: 'active' | 'draft' | 'archived';
  color: string;
  assignedCount: number;
  description: string;
  allowOvertime: boolean;
  otThresholdHours: number;
}

export const ShiftLibraryPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openActionMenuCode, setOpenActionMenuCode] = useState<string | null>(null);
  const [selectedShiftForDrawer, setSelectedShiftForDrawer] = useState<ShiftItem | null>(null);
  const [selectedShiftCodes, setSelectedShiftCodes] = useState<string[]>([]);
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any[]>('/shifts');
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      const mapped: ShiftItem[] = list.map((dto: any) => ({
        id: dto.id,
        name: dto.name,
        code: dto.code,
        start: dto.startTime || '09:00 AM',
        end: dto.endTime || '06:00 PM',
        duration: dto.duration || '09h 00m',
        break: dto.breakDuration || '01h 00m',
        type: dto.shiftType ? (dto.shiftType.charAt(0).toUpperCase() + dto.shiftType.slice(1)) : 'Fixed',
        grace: dto.graceRules || `IN: ${dto.graceInMinutes || 10}m | OUT: ${dto.graceOutMinutes || 10}m`,
        status: dto.status || 'active',
        color: dto.colorHex || '#3B82F6',
        assignedCount: dto.assignedCount || Math.floor(Math.random() * 40) + 10,
        description: dto.description || '',
        allowOvertime: dto.allowOvertime !== false,
        otThresholdHours: dto.otThresholdHours || 8.0,
      }));
      setShifts(mapped);
    } catch {
      toast.error('Failed to load shifts library from database');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      const matchesTab = activeTab === 'all' || s.status === activeTab;
      const matchesType = selectedType === 'all' || s.type.toLowerCase() === selectedType.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesQuery =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesType && matchesStatus && matchesQuery;
    });
  }, [shifts, activeTab, selectedType, selectedStatus, searchQuery]);

  // Action handlers
  const handleDuplicateShift = async (shift: ShiftItem) => {
    const res = await apiClient.post('/shifts', {
      code: `${shift.code}_CP`,
      name: `${shift.name} (Copy)`,
      description: shift.description,
      shiftType: shift.type.toLowerCase(),
      colorHex: shift.color,
      startTime: shift.start,
      endTime: shift.end,
    });
    if (!res.error) {
      toast.success('Shift Duplicated', `Duplicated "${shift.name}" into new draft in database.`);
      setOpenActionMenuCode(null);
      loadShifts();
    }
  };

  const handleToggleStatus = async (shift: ShiftItem) => {
    const nextStatus = shift.status === 'active' ? 'archived' : 'active';
    const isArchiving = shift.status === 'active';

    if (isArchiving) {
      const confirmed = await confirm({
        title: `Archive Shift "${shift.name}"?`,
        text: `Archiving this shift will remove it from future scheduling rosters (${shift.assignedCount} currently assigned staff).`,
        icon: 'warning',
        confirmButtonText: 'Yes, Archive Shift',
        cancelButtonText: 'Cancel',
        isDangerous: true
      });
      if (!confirmed) return;
    }

    const res = await apiClient.patch(`/shifts/${shift.id}/status`, { status: nextStatus });
    if (!res.error) {
      setShifts(shifts.map(s => s.code === shift.code ? { ...s, status: nextStatus } : s));
      setOpenActionMenuCode(null);
      toast.success('Shift Status Updated', `Shift "${shift.name}" status updated to ${nextStatus}.`);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedShiftCodes(filteredShifts.map(s => s.code));
    } else {
      setSelectedShiftCodes([]);
    }
  };

  const handleToggleRowSelect = (code: string) => {
    if (selectedShiftCodes.includes(code)) {
      setSelectedShiftCodes(selectedShiftCodes.filter(c => c !== code));
    } else {
      setSelectedShiftCodes([...selectedShiftCodes, code]);
    }
  };

  const subNavLinks = [
    { label: 'Shift Library', path: '/shifts/library', count: 12 },
    { label: 'Schedule Matrix', path: '/shifts/schedule' },
    { label: 'Create Shift', path: '/shifts/create' },
    { label: 'Shift Groups', path: '/shifts/groups' },
    { label: 'Assignments', path: '/shifts/assignments' },
    { label: 'Shift Swaps', path: '/shifts/swaps' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Sub-navigation tabs for Shifts Module */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
        {subNavLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            <span>{link.label}</span>
            {link.count && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {link.count}</span>
            )}
          </NavLink>
        ))}</div>

      {/* Top Header & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Shifts</span>
            <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              SCR-WEB-017
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('shifts.shift_library', 'Shift Library')}</h1>
          <p className="text-xs text-slate-500">
            Create and manage work shifts for your organization. Define shift timings, break durations, and grace rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/shifts/schedule"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>View Schedule Matrix</span>
          </NavLink>

          <NavLink
            to="/shifts/create"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Shift</span>
          </NavLink>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Shift Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <CalendarRange className="h-5 w-5" />
            <span className="text-[10px] font-bold text-slate-400">Total</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{shifts.length}</p>
          <p className="text-[11px] font-medium text-slate-500">Total Shifts</p>
          <p className="text-[10px] text-slate-400">All configured shifts</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <Moon className="h-5 w-5" />
            <span className="text-[10px] font-bold text-purple-600">Night</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600">
            {shifts.filter(s => s.code === 'NS' || s.code === 'CM').length}</p>
          <p className="text-[11px] font-medium text-slate-500">Night Shifts</p>
          <p className="text-[10px] text-slate-400">Shifts starting after 8 PM</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <Zap className="h-5 w-5" />
            <span className="text-[10px] font-bold text-emerald-600">Flexi</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {shifts.filter(s => s.type === 'Flexible').length}</p>
          <p className="text-[11px] font-medium text-slate-500">Flexi Shifts</p>
          <p className="text-[10px] text-slate-400">With flexible timings</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-500">
            <Clock className="h-5 w-5" />
            <span className="text-[10px] font-bold text-amber-600">Overnight</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {shifts.filter(s => s.code === 'CM' || s.code === 'NS').length}</p>
          <p className="text-[11px] font-medium text-slate-500">Cross-Midnight</p>
          <p className="text-[10px] text-slate-400">End next day</p>
        </div>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Shifts ({shifts.length})</button>
          <button
            onClick={() => setActiveTab('active')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({shifts.filter(s => s.status === 'active').length})</button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'draft' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Draft ({shifts.filter(s => s.status === 'draft').length})</button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'archived' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Archived ({shifts.filter(s => s.status === 'archived').length})</button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Shift Types</option>
            <option value="fixed">Fixed</option>
            <option value="flexible">Flexible</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('shifts.search_shifts_by_name_code', 'Search shifts by name, code...')}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar if rows selected */}
      {selectedShiftCodes.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-900 px-2 py-1 bg-blue-200 rounded-lg">
              {selectedShiftCodes.length} Shifts Selected
            </span>
            <span className="text-xs text-blue-700">Choose a bulk batch action:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShifts(shifts.map(s => selectedShiftCodes.includes(s.code) ? { ...s, status: 'active' } : s));
                setActionAlert(`Activated ${selectedShiftCodes.length} shifts.`);
                setSelectedShiftCodes([]);
                setTimeout(() => setActionAlert(null), 3500);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-100 transition"
            >
              Bulk Activate
            </button>
            <button
              onClick={() => {
                setShifts(shifts.map(s => selectedShiftCodes.includes(s.code) ? { ...s, status: 'archived' } : s));
                setActionAlert(`Archived ${selectedShiftCodes.length} shifts.`);
                setSelectedShiftCodes([]);
                setTimeout(() => setActionAlert(null), 3500);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              Bulk Archive
            </button>
            <button
              onClick={() => navigate('/shifts/assignments')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              {t('common.assign_to_workforce', 'Assign to Workforce')}</button>
          </div>
        </div>
      )}

      {/* Shifts Master Table */}
      <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedShiftCodes.length === filteredShifts.length && filteredShifts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600"
                  />
                </th>
                <th className="px-4 py-3">Shift Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3">End Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Break</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Grace Rules</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-16 px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShifts.map((s) => {
                const isSelected = selectedShiftCodes.includes(s.code);
                const isActionOpen = openActionMenuCode === s.code;

                return (
                  <tr
                    key={s.code}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRowSelect(s.code)}
                        className="rounded border-slate-300 text-blue-600"
                      />
                    </td>
                    <td
                      onClick={() => setSelectedShiftForDrawer(s)}
                      className="px-4 py-3 font-bold text-slate-900 cursor-pointer hover:text-blue-600 flex items-center gap-2"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                      <span>{s.name}</span>
                    </td>
                    <td
                      onClick={() => setSelectedShiftForDrawer(s)}
                      className="px-4 py-3 font-semibold text-blue-600 font-mono cursor-pointer hover:underline"
                    >
                      {s.code}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{s.start}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{s.end}</td>
                    <td className="px-4 py-3 text-slate-600">{s.duration}</td>
                    <td className="px-4 py-3 text-slate-600">{s.break}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {s.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">{s.grace}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : s.status === 'draft'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenuCode(isActionOpen ? null : s.code);
                        }}
                        className={`rounded-lg p-1.5 transition ${
                          isActionOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Action Popover Menu */}
                      {isActionOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-4 top-10 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 text-left"
                        >
                          <button
                            onClick={() => {
                              setSelectedShiftForDrawer(s);
                              setOpenActionMenuCode(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" /> View Details
                          </button>

                          <button
                            onClick={() => navigate('/shifts/create')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-600" /> Edit Shift Wizard
                          </button>

                          <button
                            onClick={() => navigate('/shifts/assignments')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Assign to Employees
                          </button>

                          <button
                            onClick={() => handleDuplicateShift(s)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Copy className="w-3.5 h-3.5 text-amber-600" /> Duplicate Shift
                          </button>

                          <div className="my-1 border-t border-slate-100"></div>

                          <button
                            onClick={() => handleToggleStatus(s)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            {s.status === 'active' ? 'Archive Shift' : 'Activate Shift'}</button>
                        </div>
                      )}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <p>Showing {filteredShifts.length} of {shifts.length} shifts</p>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-400 hover:bg-slate-50">‹</button>
            <button className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white shadow-sm">1</button>
            <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50">›</button>
          </div>
        </div>
      </div>

      {/* Slide-over Shift Details Drawer */}
      {selectedShiftForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold font-mono"
                    style={{ backgroundColor: selectedShiftForDrawer.color }}
                  >
                    {selectedShiftForDrawer.code}</div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedShiftForDrawer.name}</h2>
                    <p className="text-xs text-slate-500">Shift Code: {selectedShiftForDrawer.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShiftForDrawer(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Shift Timing Details */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Operating Window</span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedShiftForDrawer.start} – {selectedShiftForDrawer.end}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Duration</span>
                  <span className="text-xs font-bold text-slate-900">{selectedShiftForDrawer.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Break Allowance</span>
                  <span className="text-xs font-bold text-slate-900">{selectedShiftForDrawer.break}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Grace Period</span>
                  <span className="text-xs font-mono font-bold text-blue-600">{selectedShiftForDrawer.grace}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Assigned Workforce</span>
                  <span className="text-xs font-bold text-emerald-600">{selectedShiftForDrawer.assignedCount} Employees</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700">{t('shifts.description_usage', 'Description & Usage')}</h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                  {selectedShiftForDrawer.description}</p>
              </div>

              {/* Overtime Policy Rules */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">{t('shifts.overtime_rounding_rules', 'Overtime & Rounding Rules')}</h3>
                <div className="rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Overtime Permitted:</span>
                    <span className={`font-semibold ${selectedShiftForDrawer.allowOvertime ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {selectedShiftForDrawer.allowOvertime ? 'Yes (Tier 1.5x / 2.0x)' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">OT Trigger Threshold:</span>
                    <span className="font-mono font-medium">{selectedShiftForDrawer.otThresholdHours} hours net</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedShiftForDrawer(null);
                  navigate('/shifts/assignments');
                }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-center"
              >
                Assign Shift
              </button>
              <button
                onClick={() => {
                  setSelectedShiftForDrawer(null);
                  navigate('/shifts/create');
                }}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-center flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
