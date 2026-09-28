import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  ChevronRight,
  Upload,
  UserPlus,
  Trash2,
  MoreVertical,
  X,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';

export const ShiftAssignmentsPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotification();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [selectedShift, setSelectedShift] = useState('General Shift (09:00 AM - 06:00 PM)');
  const [effectiveFrom, setEffectiveFrom] = useState('01 Sep 2026');
  const [effectiveTo, setEffectiveTo] = useState('30 Sep 2026');
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any[]>('/shifts/assignments');
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
      const mapped = list.map((sa: any) => ({
        id: sa.id,
        code: sa.employeeCode,
        name: sa.employeeName,
        dept: sa.department,
        shift: sa.currentShift,
        timing: sa.shiftTiming,
        from: sa.effectiveFrom,
        to: sa.effectiveTo,
        assignedBy: sa.assignedBy,
        status: sa.status || 'active',
        selected: false,
        avatar: sa.avatarUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
      }));
      setAssignments(mapped);
    } catch {
      toast.error('Failed to load shift assignments from database');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAssignment = async () => {
    const selectedCount = assignments.filter(a => a.selected).length;
    if (selectedCount === 0) {
      toast.error('Selection Error', 'Please select at least one employee to assign shift.');
      return;
    }

    try {
      const res = await apiClient.post('/shifts/assignments', {
        currentShift: selectedShift,
        effectiveFrom,
        effectiveTo,
        employeeCount: selectedCount,
      });
      if (!res.error) {
        toast.success('Shift Assigned', `Assigned "${selectedShift}" to ${selectedCount} selected employees!`);
        setIsDrawerOpen(false);
        loadAssignments();
      }
    } catch {
      toast.error('Failed to save shift assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Shift Management</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Employee Shift Assignment</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('shifts.employee_shift_assignment', 'Employee Shift Assignment')}</h1>
          <p className="text-xs text-slate-500">
            Assign and manage shifts for employees across locations and departments.
          </p>
        </div>
      </div>

      {/* Filter Row Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('shifts.search_by_name_employee_id', 'Search by name, employee ID...')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none">
            <option>All Locations</option>
            <option>Hyderabad Main Office</option>
            <option>Bengaluru HQ</option>
          </select>

          <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none">
            <option>All Departments</option>
            <option>Technology</option>
            <option>HR</option>
            <option>Sales</option>
          </select>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>01 Sep 2024 – 30 Sep 2024</span>
          </div>

          <button className="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">{t('shifts.search', 'Search')}</button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            3 selected
          </span>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Assign Shift</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Shift</span>
          </button>
        </div>

        <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Upload className="h-3.5 w-3.5 text-slate-400" />
          <span>Bulk Upload</span>
        </button>
      </div>

      {/* Table & Slide-Over Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Assignment Table (8 Cols) */}
        <div className={`${isDrawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all`}>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="w-8 px-4 py-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                </th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Current Shift</th>
                <th className="px-4 py-3">Effective From</th>
                <th className="px-4 py-3">Effective To</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-10 px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={emp.selected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAssignments(prev => prev.map(a => a.id === emp.id ? { ...a, selected: checked } : a));
                      }}
                      className="rounded border-slate-300 text-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 font-semibold text-slate-900">
                      <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-full object-cover" />
                      <span>{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{emp.code}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.dept}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{emp.shift}</p>
                    <p className="text-[10px] text-slate-400">{emp.timing}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{emp.from}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.to}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded p-1 text-slate-400 hover:bg-slate-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slide-Over Assign Shift Drawer (4 Cols) */}
        {isDrawerOpen && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:col-span-4 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('shifts.assign_shift', 'Assign Shift')}</h3>
                <p className="text-[11px] text-slate-400">Assign a shift to the selected employees.</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selected Employees Chips */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Selected Employees (3)</span>
                <button className="text-[11px] text-blue-600 hover:underline">{t('shifts.clear_all', 'Clear All')}</button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Aarav Sharma', id: 'EMP-001', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop' },
                  { name: 'Priya Nair', id: 'EMP-002', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop' },
                  { name: 'Rohan Mehta', id: 'EMP-003', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop' },
                ].map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={s.avatar} alt={s.name} className="h-6 w-6 rounded-full object-cover" />
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.id}</span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}</div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-700">{t('shifts.shift', 'Shift *')}</label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option>General Shift (09:00 AM - 06:00 PM)</option>
                  <option>Morning Shift (07:00 AM - 04:00 PM)</option>
                  <option>Night Shift (10:00 PM - 07:00 AM)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">{t('shifts.effective_from', 'Effective From *')}</label>
                  <input
                    type="text"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">{t('shifts.effective_to', 'Effective To *')}</label>
                  <input
                    type="text"
                    value={effectiveTo}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>Replace existing shifts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                  />
                  <span>Send notification to employees</span>
                </label>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">{t('shifts.remarks_optional', 'Remarks (Optional)')}</label>
                <textarea
                  rows={2}
                  placeholder={t('shifts.add_remarks', 'Add remarks...')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t('action.cancel', 'Cancel')}</button>
                <button
                  type="button"
                  onClick={handleApplyAssignment}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700"
                >{t('shifts.assign_shift', 'Assign Shift')}</button>
              </div>
            </div>
          </div>
        )}</div>
    </div>
  );
};
