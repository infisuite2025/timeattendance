import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Save,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Building2,
  Factory,
  Moon,
  Pickaxe,
  Anchor,
  Globe2,
  Layers,
  Check,
  ChevronDown,
  Info,
  ShieldCheck,
  Zap,
  Coffee,
  Calendar,
  Sun,
  Loader2,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import { decodeSecureToken } from '../../utils/routeSecurity.ts';

interface IndustryPreset {
  id: string;
  name: string;
  industry: string;
  icon: any;
  badge: string;
  description: string;
  settings: {
    policyName: string;
    swipingModel: 'POSITIVE' | 'NEGATIVE_EXCEPTION' | 'HITCH_MUSTER';
    dailyRequiredHours: number;
    graceIn: number;
    graceOut: number;
    monthlyLateGrace: number;
    fullDayThreshold: number; // minutes
    halfDayThreshold: number; // minutes
    autoLunchDeduction: number;
    otMinQualify: number;
    otMultiplier: number;
    enableRamadan: boolean;
    enableDst: boolean;
    enableFridayPrayer: boolean;
    enableSandwichRule: boolean;
    enableCompOff: boolean;
    weekendType: 'SAT_SUN' | 'FRI_SAT' | 'HITCH_CYCLE';
  };
}

export const PolicyEditorPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { toast } = useNotification();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-it');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  // Industry Presets Repository
  const presets: IndustryPreset[] = [
    {
      id: 'preset-it',
      name: 'IT & Knowledge Services',
      industry: 'Technology / White-Collar',
      icon: Building2,
      badge: 'Flexi + WFH + Comp-Off',
      description: 'Flexible core-hours policy with 30m grace, negative swiping option, and compensatory off for weekend deployments.',
      settings: {
        policyName: 'IT Tech & Engineering Policy (Flexi)',
        swipingModel: 'NEGATIVE_EXCEPTION',
        dailyRequiredHours: 8.0,
        graceIn: 30,
        graceOut: 30,
        monthlyLateGrace: 5,
        fullDayThreshold: 480,
        halfDayThreshold: 240,
        autoLunchDeduction: 0,
        otMinQualify: 60,
        otMultiplier: 1.0,
        enableRamadan: false,
        enableDst: true,
        enableFridayPrayer: false,
        enableSandwichRule: false,
        enableCompOff: true,
        weekendType: 'SAT_SUN'
      }
    },
    {
      id: 'preset-mfg',
      name: 'Manufacturing & Plants',
      industry: 'Factories Act 1948',
      icon: Factory,
      badge: 'Strict FILO + 2.0x Double OT',
      description: 'Turnstile gate-pass enforcement, statutory 2.0x overtime multiplier over 48h/week, 10m grace, and sandwich deductions.',
      settings: {
        policyName: 'Manufacturing Plant Shift Policy',
        swipingModel: 'POSITIVE',
        dailyRequiredHours: 8.0,
        graceIn: 10,
        graceOut: 10,
        monthlyLateGrace: 2,
        fullDayThreshold: 480,
        halfDayThreshold: 240,
        autoLunchDeduction: 45,
        otMinQualify: 15,
        otMultiplier: 2.0,
        enableRamadan: false,
        enableDst: false,
        enableFridayPrayer: false,
        enableSandwichRule: true,
        enableCompOff: false,
        weekendType: 'SAT_SUN'
      }
    },
    {
      id: 'preset-gcc',
      name: 'Middle East & GCC (UAE/KSA)',
      industry: 'GCC Labor Law & WPS',
      icon: Moon,
      badge: 'Ramadan 6h Auto-Reduce + Friday Prayer',
      description: 'Auto-reduces workhours to 6h during Ramadan, Friday prayer window (11:30–14:00), Fri–Sat weekend, and WPS export.',
      settings: {
        policyName: 'GCC Middle East Corporate & Industrial Policy',
        swipingModel: 'POSITIVE',
        dailyRequiredHours: 8.0,
        graceIn: 15,
        graceOut: 15,
        monthlyLateGrace: 3,
        fullDayThreshold: 480,
        halfDayThreshold: 240,
        autoLunchDeduction: 60,
        otMinQualify: 30,
        otMultiplier: 1.5,
        enableRamadan: true,
        enableDst: false,
        enableFridayPrayer: true,
        enableSandwichRule: true,
        enableCompOff: false,
        weekendType: 'FRI_SAT'
      }
    },
    {
      id: 'preset-mines',
      name: 'Mining & Underground',
      industry: 'Mines Act 1952 / DGMS',
      icon: Pickaxe,
      badge: 'Lamp Cabin Descent + 16h Rest Guard',
      description: 'Surface lamp-cabin punch pairing, underground shaft descent travel pay, mandatory 16-hour inter-shift rest rule.',
      settings: {
        policyName: 'Mining Operations & DGMS Safety Policy',
        swipingModel: 'POSITIVE',
        dailyRequiredHours: 8.0,
        graceIn: 10,
        graceOut: 10,
        monthlyLateGrace: 2,
        fullDayThreshold: 480,
        halfDayThreshold: 240,
        autoLunchDeduction: 30,
        otMinQualify: 15,
        otMultiplier: 2.0,
        enableRamadan: false,
        enableDst: false,
        enableFridayPrayer: false,
        enableSandwichRule: true,
        enableCompOff: false,
        weekendType: 'SAT_SUN'
      }
    },
    {
      id: 'preset-offshore',
      name: 'Offshore Oil & Gas Rigs',
      industry: 'FPSO / Maritime Hitches',
      icon: Anchor,
      badge: '28/28 Hitch Roster + 12h Tours',
      description: 'Continuous 12-hour shifts for 28 consecutive days offshore followed by 28 days fully paid shore leave, standby weather pay.',
      settings: {
        policyName: 'Offshore Rig 28/28 Rotational Policy',
        swipingModel: 'HITCH_MUSTER',
        dailyRequiredHours: 12.0,
        graceIn: 15,
        graceOut: 15,
        monthlyLateGrace: 0,
        fullDayThreshold: 720,
        halfDayThreshold: 360,
        autoLunchDeduction: 60,
        otMinQualify: 60,
        otMultiplier: 1.5,
        enableRamadan: false,
        enableDst: false,
        enableFridayPrayer: false,
        enableSandwichRule: false,
        enableCompOff: false,
        weekendType: 'HITCH_CYCLE'
      }
    },
    {
      id: 'preset-dst',
      name: 'US / UK Multi-Timezone & DST',
      industry: 'North America / Europe Enterprise',
      icon: Globe2,
      badge: 'Astronomical DST Auto-Compensation',
      description: 'Auto-credits +1h Overtime on 25h Fall Back days and waives shortfall on 23h Spring Forward transitions.',
      settings: {
        policyName: 'Global Enterprise Multi-Timezone DST Policy',
        swipingModel: 'POSITIVE',
        dailyRequiredHours: 8.0,
        graceIn: 20,
        graceOut: 20,
        monthlyLateGrace: 4,
        fullDayThreshold: 480,
        halfDayThreshold: 240,
        autoLunchDeduction: 45,
        otMinQualify: 30,
        otMultiplier: 1.5,
        enableRamadan: false,
        enableDst: true,
        enableFridayPrayer: false,
        enableSandwichRule: false,
        enableCompOff: true,
        weekendType: 'SAT_SUN'
      }
    }
  ];

  // Active Policy Form State (initialized from default preset)
  const [formState, setFormState] = useState(presets[0].settings);

  useEffect(() => {
    if (!id) return;
    const rawPolicyId = decodeSecureToken(id);
    setIsLoading(true);
    apiClient.get(`/policies/${rawPolicyId}`).then((res) => {
      if (res.success && res.data) {
        const pol = res.data;
        setFormState({
          policyName: pol.name || 'Custom Policy',
          swipingModel: 'POSITIVE',
          dailyRequiredHours: (pol.rules?.fullDayThresholdMinutes || 480) / 60,
          graceIn: pol.rules?.graceInMinutes || 15,
          graceOut: pol.rules?.graceOutMinutes || 15,
          monthlyLateGrace: pol.rules?.monthlyLateGraceCount || 3,
          fullDayThreshold: pol.rules?.fullDayThresholdMinutes || 480,
          halfDayThreshold: pol.rules?.halfDayThresholdMinutes || 240,
          autoLunchDeduction: pol.rules?.autoLunchDeductionMinutes || 60,
          otMinQualify: pol.rules?.otMinQualificationMinutes || 30,
          otMultiplier: 1.5,
          enableRamadan: false,
          enableDst: false,
          enableFridayPrayer: false,
          enableSandwichRule: false,
          enableCompOff: true,
          weekendType: 'SAT_SUN',
        });
      } else {
        toast.error('Policy Not Found', 'Could not load policy details for editing.');
      }
      setIsLoading(false);
    });
  }, [id]);

  // Quick Preset Selection Handler
  const handleApplyPreset = (preset: IndustryPreset) => {
    setSelectedPresetId(preset.id);
    setFormState({ ...preset.settings });
  };

  // Interactive Live Simulator Test Inputs
  const [simInTime, setSimInTime] = useState('09:12');
  const [simOutTime, setSimOutTime] = useState('18:15');
  const [simBreakMins, setSimBreakMins] = useState(60);
  const [simRamadanActive, setSimRamadanActive] = useState(false);
  const [simDstFallBackActive, setSimDstFallBackActive] = useState(false);

  // Live Simulator Math
  const parseMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const firstInMins = parseMins(simInTime);
  const lastOutMins = parseMins(simOutTime);
  const shiftStartMins = 9 * 60; // 09:00 AM
  const shiftEndMins = 18 * 60;  // 06:00 PM

  let grossMins = Math.max(0, lastOutMins - firstInMins);
  if (simDstFallBackActive && formState.enableDst) {
    grossMins += 60; // Extra 1 hour physically worked on Fall Back day
  }

  const appliedBreak = Math.max(simBreakMins, formState.autoLunchDeduction);
  const netMins = Math.max(0, grossMins - appliedBreak);
  const lateMins = Math.max(0, firstInMins - shiftStartMins);
  const isLate = lateMins > formState.graceIn;

  // Ramadan adjusted thresholds (6h full-day / 3h half-day)
  const activeFullDayThreshold = (simRamadanActive && formState.enableRamadan) ? 360 : formState.fullDayThreshold;
  const activeHalfDayThreshold = (simRamadanActive && formState.enableRamadan) ? 180 : formState.halfDayThreshold;
  const activeExpectedWorkMins = (simRamadanActive && formState.enableRamadan) ? 360 : (formState.dailyRequiredHours * 60);

  let simStatus = 'Present';
  let statusColor = 'emerald';
  let explanation = '';

  if (netMins < activeHalfDayThreshold) {
    simStatus = 'Absent (Shortfall)';
    statusColor = 'rose';
    explanation = `Net work time of ${Math.round(netMins / 60 * 10) / 10}h is below minimum half-day threshold (${activeHalfDayThreshold / 60}h).`;
  } else if (netMins < activeFullDayThreshold) {
    simStatus = 'Half Day';
    statusColor = 'amber';
    explanation = `Net work time of ${Math.round(netMins / 60 * 10) / 10}h meets half-day but falls below full-day threshold (${activeFullDayThreshold / 60}h).`;
  } else if (isLate && formState.swipingModel === 'POSITIVE') {
    simStatus = 'Late Arrival';
    statusColor = 'amber';
    explanation = `Clocked in at ${simInTime} (${lateMins}m late, allowable grace: ${formState.graceIn}m).`;
  } else {
    simStatus = 'Present (Full Day)';
    statusColor = 'emerald';
    explanation = `Full-day fulfilled. Net work time: ${Math.round(netMins / 60 * 10) / 10}h (Required: ${activeExpectedWorkMins / 60}h).`;
  }

  const rawOtMins = Math.max(0, netMins - activeExpectedWorkMins);
  const qualifiedOtMins = rawOtMins >= formState.otMinQualify ? rawOtMins : 0;

  const handleSavePolicy = async () => {
    if (!formState.policyName.trim()) {
      toast.error('Validation Error', 'Please enter a valid policy name.');
      return;
    }
    if (formState.graceIn < 0 || formState.graceOut < 0) {
      toast.error('Validation Error', 'Grace periods cannot be negative.');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: formState.policyName,
      description: `Attendance policy configured via Policy Builder. Grace: ${formState.graceIn}m, OT Multiplier: ${formState.otMultiplier}x.`,
      rules: {
        graceInMinutes: formState.graceIn,
        graceOutMinutes: formState.graceOut,
        monthlyLateGraceCount: formState.monthlyLateGrace,
        fullDayThresholdMinutes: formState.fullDayThreshold,
        halfDayThresholdMinutes: formState.halfDayThreshold,
        autoLunchDeductionMinutes: formState.autoLunchDeduction,
        otMinQualificationMinutes: formState.otMinQualify,
      },
    };

    try {
      const res = id
        ? await apiClient.put(`/policies/${id}`, payload)
        : await apiClient.post('/policies', payload);

      if (res.success) {
        setSaveSuccess(true);
        toast.success(
          id ? 'Policy Updated' : 'Policy Published',
          `Policy "${formState.policyName}" saved successfully to backend database.`
        );
        setTimeout(() => {
          setSaveSuccess(false);
          navigate('/policies');
        }, 1200);
      } else {
        toast.error('Save Failed', res.error?.message || 'Could not save policy to backend.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <NavLink
            to="/policies"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </NavLink>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Policies</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-slate-700">Policy Studio</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('policies.attendance_overtime_policy_bui', 'Attendance & Overtime Policy Builder')}</h1>
            <p className="text-xs text-slate-500">
              Configure attendance rules, grace windows, Ramadan hours, DST handling, and overtime compensation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePolicy}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving Policy...' : id ? 'Update Policy' : 'Save & Publish Policy'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">Policy Published Successfully!</p>
            <p className="text-xs text-emerald-700">Attendance calculation engine updated with active parameters.</p>
          </div>
        </div>
      )}

      {/* STEP 1: 1-Click Industry & Domain Presets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">{t('policies.step_1_choose_an_industry_regi', 'Step 1: Choose an Industry & Regional Preset')}</h2>
          </div>
          <span className="text-xs text-slate-400">Click any preset to pre-fill all statutory rules automatically</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPresetId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {p.badge}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <p className="text-[11px] font-medium text-slate-400 mb-2">{p.industry}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Active Selection' : 'Click to Load'}</span>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })}</div>
      </div>

      {/* Main Grid: Policy Controls & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Easy Policy Configuration Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plain English Policy Summary Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>Natural-Language Policy Summary</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-100">
              Employees work <strong>{formState.dailyRequiredHours} hours/day</strong> with a{' '}
              <strong>{formState.graceIn}-minute arrival grace period</strong>. Overtime calculates at{' '}
              <strong>{formState.otMultiplier}x rate</strong> after{' '}
              {formState.dailyRequiredHours} hours.
              {formState.enableRamadan && (
                <span className="text-amber-300">
                  {' '}During Ramadan, daily work requirement automatically drops to <strong>6.0 hours</strong>.
                </span>
              )}
              {formState.enableFridayPrayer && (
                <span className="text-emerald-300">
                  {' '}Friday prayer window (11:30–14:00) is exempt from mid-day exit penalties.
                </span>
              )}
              {formState.enableDst && (
                <span className="text-blue-300">
                  {' '}Astronomical DST clock transitions automatically credit night shift overtime.
                </span>
              )}
              {formState.enableSandwichRule && (
                <span className="text-rose-300">
                  {' '}Sandwich rule applies to weekend leaves.
                </span>
              )}</p>
          </div>

          {/* STEP 2: Modular Quick-Toggles ("Rule Packs") */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">{t('policies.step_2_modular_rule_packs_togg', 'Step 2: Modular Rule Packs & Toggles')}</h2>
            </div>

            <div className="space-y-3">
              {/* Ramadan Pack Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Ramadan Workhour Reducer (-2 Hours)</h4>
                    <p className="text-[11px] text-slate-500">Auto-reduces required workhours from 8h to 6h per day during Holy Month.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.enableRamadan}
                  onChange={(e) => setFormState({ ...formState, enableRamadan: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Daylight Savings (DST) Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Daylight Saving Time (DST) Protection</h4>
                    <p className="text-[11px] text-slate-500">Auto-compensates 23h spring forward / 25h fall back night shift transitions.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.enableDst}
                  onChange={(e) => setFormState({ ...formState, enableDst: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Friday Prayer Window */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Friday Prayer Extended Break (11:30 – 14:00)</h4>
                    <p className="text-[11px] text-slate-500">Exempts mid-day prayer exits from lateness or early shortfall penalties.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.enableFridayPrayer}
                  onChange={(e) => setFormState({ ...formState, enableFridayPrayer: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Sandwich Leave Rule */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sandwich Leave Deduction Rule</h4>
                    <p className="text-[11px] text-slate-500">Treats intervening weekend as LOP if employee takes leave before and after.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.enableSandwichRule}
                  onChange={(e) => setFormState({ ...formState, enableSandwichRule: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Compensatory Off Accrual */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Comp-Off Accrual for Weekend Deployments</h4>
                    <p className="text-[11px] text-slate-500">Automatically grants compensatory leave credits when working on holidays.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formState.enableCompOff}
                  onChange={(e) => setFormState({ ...formState, enableCompOff: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Advanced Accordion (Progressive Disclosure) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-900">Advanced Parameter Tuning (Optional)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('policies.arrival_grace_minutes', 'Arrival Grace (Minutes)')}</label>
                    <input
                      type="number"
                      value={formState.graceIn}
                      onChange={(e) => setFormState({ ...formState, graceIn: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('policies.overtime_multiplier', 'Overtime Multiplier')}</label>
                    <select
                      value={formState.otMultiplier}
                      onChange={(e) => setFormState({ ...formState, otMultiplier: parseFloat(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono"
                    >
                      <option value="1.0">1.0x (Standard Single Rate)</option>
                      <option value="1.25">1.25x (125% Rate)</option>
                      <option value="1.5">1.5x (Time-and-a-half)</option>
                      <option value="2.0">2.0x (Factories Act Double Rate)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('policies.full_day_threshold_minutes', 'Full Day Threshold (Minutes)')}</label>
                    <input
                      type="number"
                      value={formState.fullDayThreshold}
                      onChange={(e) => setFormState({ ...formState, fullDayThreshold: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">{t('policies.auto_lunch_deduction_minutes', 'Auto Lunch Deduction (Minutes)')}</label>
                    <input
                      type="number"
                      value={formState.autoLunchDeduction}
                      onChange={(e) => setFormState({ ...formState, autoLunchDeduction: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}</div>
        </div>

        {/* Right 5 Columns: Interactive Visual Sandbox & Proof Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">{t('policies.live_policy_sandbox', 'Live Policy Sandbox')}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                Deterministic Engine
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Simulate punch arrivals to see how your active policy evaluates status, grace periods, and overtime.
            </p>

            {/* Test Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('policies.simulated_first_in', 'Simulated First In')}</label>
                  <input
                    type="time"
                    value={simInTime}
                    onChange={(e) => setSimInTime(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('policies.simulated_last_out', 'Simulated Last Out')}</label>
                  <input
                    type="time"
                    value={simOutTime}
                    onChange={(e) => setSimOutTime(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Simulation Environment Modifiers */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block">Test Environment Modifiers:</span>
                
                {formState.enableRamadan && (
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simRamadanActive}
                      onChange={(e) => setSimRamadanActive(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Simulate Date during Ramadan (6h Target)</span>
                  </label>
                )}

                {formState.enableDst && (
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simDstFallBackActive}
                      onChange={(e) => setSimDstFallBackActive(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Simulate 25h Fall Back Day (+1h Astronomical OT)</span>
                  </label>
                )}</div>
            </div>

            {/* Live Calculation Proof Outcome */}
            <div className={`p-4 rounded-2xl border ${
              statusColor === 'emerald' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' :
              statusColor === 'amber' ? 'bg-amber-50/70 border-amber-200 text-amber-950' :
              'bg-rose-50/70 border-rose-200 text-rose-950'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Evaluated Day Status</span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  statusColor === 'emerald' ? 'bg-emerald-200 text-emerald-800' :
                  statusColor === 'amber' ? 'bg-amber-200 text-amber-800' :
                  'bg-rose-200 text-rose-800'
                }`}>
                  {simStatus}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Net Work Duration:</span>
                  <span className="font-mono font-bold text-sm">{Math.round(netMins / 60 * 10) / 10} hours</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Qualified Overtime:</span>
                  <span className="font-mono font-bold text-sm text-blue-600">
                    {qualifiedOtMins > 0 ? `${Math.round(qualifiedOtMins / 60 * 10) / 10}h (${formState.otMultiplier}x)` : '0h'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-[11px] leading-relaxed">
                <strong>Calculation Proof:</strong> {explanation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
