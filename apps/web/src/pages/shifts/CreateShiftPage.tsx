import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  Calendar,
  Save,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient';
import { useI18n } from '../../context/I18nContext.tsx';

export const CreateShiftPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState<'general' | 'timings' | 'breaks' | 'rules' | 'overtime' | 'applicability'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [shiftName, setShiftName] = useState('General Shift');
  const [shiftCode, setShiftCode] = useState('GS');
  const [description, setDescription] = useState('Standard day shift for general office employees.');
  const [shiftType, setShiftType] = useState('Fixed');
  const [shiftCategory, setShiftCategory] = useState('General');
  const [colorHex, setColorHex] = useState('#3B82F6');
  const [autoDetect, setAutoDetect] = useState(false);
  const [weeklyOffBehavior, setWeeklyOffBehavior] = useState('As per weekly off');
  const [notes, setNotes] = useState('Applicable for regular office working days.');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftName || !shiftCode) {
      toast.error('Validation Error', 'Shift name and shift code are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await apiClient.post('/shifts', {
        name: shiftName,
        code: shiftCode,
        description,
        shiftType: shiftType.toLowerCase(),
        shiftCategory,
        colorHex,
        autoDetectEnabled: autoDetect,
        startTime: '09:00 AM',
        endTime: '06:00 PM',
      });
      if (!res.error) {
        toast.success('Shift Saved', `Shift "${shiftName}" (${shiftCode}) successfully created!`);
        navigate('/shifts/library');
      }
    } catch {
      toast.error('Failed to create shift in database');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <NavLink to="/shifts/library" className="hover:text-blue-600">Configuration</NavLink>
            <ChevronRight className="h-3 w-3" />
            <NavLink to="/shifts/library" className="hover:text-blue-600">Shifts</NavLink>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Create Shift</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('shifts.create_edit_shift', 'Create / Edit Shift')}</h1>
          <p className="text-xs text-slate-500">
            Configure shift details, timings, attendance rules and applicability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/shifts/library')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Main Wizard Form & Live Preview Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Form Area (7 Cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Navigation Wizard Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`rounded-lg px-3.5 py-2 transition-all ${
                activeTab === 'general' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timings')}
              className={`rounded-lg px-3.5 py-2 transition-all ${
                activeTab === 'timings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('breaks')}
              className={`rounded-lg px-3.5 py-2 transition-all ${
                activeTab === 'breaks' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Breaks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`rounded-lg px-3.5 py-2 transition-all ${
                activeTab === 'rules' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance Rules
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overtime')}
              className={`rounded-lg px-3.5 py-2 transition-all ${
                activeTab === 'overtime' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overtime Rules
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('applicability')}
              className={`rounded-lg px-3.5 py-2 transition-all ${
                activeTab === 'applicability' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Applicability
            </button>
          </div>

          {/* Form Content Cards */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('shifts.basic_information', 'Basic Information')}</h3>
                <p className="text-xs text-slate-500">Set the basic details for the shift.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.shift_name', 'Shift Name *')}</label>
                  <input
                    type="text"
                    required
                    value={shiftName}
                    onChange={(e) => setShiftName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.shift_code', 'Shift Code *')}</label>
                  <input
                    type="text"
                    required
                    value={shiftCode}
                    onChange={(e) => setShiftCode(e.target.value)}
                    placeholder={t('shifts.e_g_gs_mng_nt', 'e.g., GS, MNG, NT')}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Short code (e.g., GS, MNG, NT)</p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.description', 'Description')}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-right text-[10px] text-slate-400">45/500</p>
              </div>
            </div>

            {/* Section 2: Shift Type */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('shifts.shift_type', 'Shift Type')}</h3>
                <p className="text-xs text-slate-500">Define the type and working pattern.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.shift_type', 'Shift Type *')}</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Flexible">Flexible</option>
                    <option value="Rotational">Rotational</option>
                    <option value="Night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.shift_category', 'Shift Category')}</label>
                  <select
                    value={shiftCategory}
                    onChange={(e) => setShiftCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Production">Production</option>
                    <option value="Support">Support</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.color', 'Color')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 p-0.5"
                    />
                    <span className="font-mono text-xs text-slate-600 uppercase">{colorHex}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Additional Settings */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('shifts.additional_settings', 'Additional Settings')}</h3>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Auto Shift Detection</p>
                  <p className="text-[11px] text-slate-500">Enable automatic shift detection based on punch time</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.weekly_off_behavior', 'Weekly Off Behavior')}</label>
                  <select
                    value={weeklyOffBehavior}
                    onChange={(e) => setWeeklyOffBehavior(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  >
                    <option>As per weekly off</option>
                    <option>Ignore weekly off</option>
                    <option>Overtime on weekly off</option>
                  </select>
                  <p className="mt-1 text-[10px] text-slate-400">How this shift behaves on weekly offs</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">{t('shifts.notes', 'Notes')}</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-right text-[10px] text-slate-400">44/500</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Shift Preview Panel (5 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('shifts.shift_preview', 'Shift Preview')}</h3>
              <p className="text-xs text-slate-500">Example schedule and key details.</p>
            </div>

            {/* Shift Card Mockup */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
                    {shiftCode || 'GS'}</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{shiftName || 'General Shift'}</h4>
                    <p className="text-[11px] text-slate-500">Code: {shiftCode || 'GS'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Day Shift
                </span>
              </div>

              <div className="border-t border-blue-100 pt-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" /> Mon, 15 Sep 2025
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Example Day</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span> 09:00 AM
                  </span>
                  <span className="text-[11px] text-slate-400">Shift Start</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span> 01:00 PM – 02:00 PM
                  </span>
                  <span className="text-[11px] text-slate-400">Break</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span> 06:00 PM
                  </span>
                  <span className="text-[11px] text-slate-400">Shift End</span>
                </div>
              </div>
            </div>

            {/* Key Settings List */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900">Key Settings</h4>
              <div className="flex items-center justify-between text-slate-600">
                <span>Work Hours</span>
                <span className="font-semibold text-slate-900">9h 0m (excl. break)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Break Duration</span>
                <span className="font-semibold text-slate-900">1h 0m</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Grace In</span>
                <span className="font-semibold text-slate-900">15 minutes</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Grace Out</span>
                <span className="font-semibold text-slate-900">15 minutes</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>OT Threshold</span>
                <span className="font-semibold text-slate-900">9h 0m</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Weekly Off Behavior</span>
                <span className="font-semibold text-slate-900">{weeklyOffBehavior}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
