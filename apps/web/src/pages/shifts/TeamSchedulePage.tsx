import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarRange,
  Users,
  Clock,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Coffee,
  Briefcase,
  AlertCircle,
  X,
  Check,
  UserCheck,
  Edit3,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { apiClient } from '../../services/apiClient';
import { useI18n } from '../../context/I18nContext.tsx';

export interface ScheduledDay {
  type: 'gs' | 'ms' | 'es' | 'ns' | 'off' | 'leave';
  text: string;
  name: string;
  inTime?: string;
  outTime?: string;
  breakTime?: string;
  grace?: string;
}

export interface EmployeeRosterRecord {
  employeeCode: string;
  name: string;
  designation: string;
  dept: string;
  avatar: string;
  assignedShift: string;
  shiftTiming: string;
  weeklyOffsCount: number;
  workingDaysCount: number;
  days: ScheduledDay[];
}

const SHIFT_TEMPLATES = {
  gs: { type: 'gs' as const, name: 'General Shift', text: '9:00 AM – 5:00 PM', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins', color: 'blue' },
  ms: { type: 'ms' as const, name: 'Morning Shift', text: '8:00 AM – 4:00 PM', inTime: '08:00 AM', outTime: '04:00 PM', breakTime: '12:00 PM - 01:00 PM', grace: '15 mins', color: 'amber' },
  es: { type: 'es' as const, name: 'Evening Shift', text: '2:00 PM – 10:00 PM', inTime: '02:00 PM', outTime: '10:00 PM', breakTime: '06:00 PM - 07:00 PM', grace: '15 mins', color: 'rose' },
  ns: { type: 'ns' as const, name: 'Night Shift', text: '10:00 PM – 6:00 AM', inTime: '10:00 PM', outTime: '06:00 AM', breakTime: '02:00 AM - 03:00 AM', grace: '15 mins', color: 'purple' },
  off: { type: 'off' as const, name: 'Weekly Off', text: 'Off', color: 'slate' },
  leave: { type: 'leave' as const, name: 'Approved Leave', text: 'On Leave', color: 'red' },
};

const WEEKS_LIST = [
  { label: 'Sep 02 – Sep 08, 2026', days: [2, 3, 4, 5, 6, 7, 8] },
  { label: 'Sep 09 – Sep 15, 2026', days: [9, 10, 11, 12, 13, 14, 15] },
  { label: 'Sep 16 – Sep 22, 2026', days: [16, 17, 18, 19, 20, 21, 22] },
  { label: 'Sep 23 – Sep 29, 2026', days: [23, 24, 25, 26, 27, 28, 29] },
  { label: 'Sep 30 – Oct 06, 2026', days: [30, 1, 2, 3, 4, 5, 6] },
];

const MONTHS_LIST = [
  { name: 'August 2026', totalDays: 31, startDayOffset: 6 },
  { name: 'September 2026', totalDays: 30, startDayOffset: 2 },
  { name: 'October 2026', totalDays: 31, startDayOffset: 4 },
  { name: 'November 2026', totalDays: 30, startDayOffset: 0 },
];

export const TeamSchedulePage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast, confirm } = useNotification();
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  
  // Week & Month Navigation
  const [weekIndex, setWeekIndex] = useState(2); // default: Sep 16 - Sep 22, 2026
  const [monthIndex, setMonthIndex] = useState(1); // default: September 2026
  const [monthEmpFilter, setMonthEmpFilter] = useState<string>('ALL');

  // Swap Request Form State (Employee)
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapDate, setSwapDate] = useState('2026-09-18');
  const [swapWithEmp, setSwapWithEmp] = useState('EMP-1003');
  const [swapDesiredShift, setSwapDesiredShift] = useState('Morning Shift (08:00 AM - 04:00 PM)');
  const [swapReason, setSwapReason] = useState('');
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);

  // Edit / Change Shift Modal (Manager & Admin)
  const [editShiftModal, setEditShiftModal] = useState<{
    isOpen: boolean;
    empCode: string;
    empName: string;
    empAvatar: string;
    dateFormatted: string;
    dayIndex: number;
    currentShiftType: 'gs' | 'ms' | 'es' | 'ns' | 'off' | 'leave';
    selectedShiftType: 'gs' | 'ms' | 'es' | 'ns' | 'off' | 'leave';
    applyToWeek: boolean;
    reason: string;
  }>({
    isOpen: false,
    empCode: '',
    empName: '',
    empAvatar: '',
    dateFormatted: '',
    dayIndex: 0,
    currentShiftType: 'gs',
    selectedShiftType: 'gs',
    applyToWeek: false,
    reason: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScheduleMatrix();
  }, []);

  const loadScheduleMatrix = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/shifts/schedule-matrix');
      if (res.data?.schedule && Array.isArray(res.data.schedule)) {
        const matrixList = res.data.schedule;
        setSchedules(prev => {
          return prev.map((s, idx) => {
            const match = matrixList[idx % matrixList.length];
            if (match && match.shifts) {
              const mappedDays: ScheduledDay[] = match.shifts.map((ds: any) => {
                const code = (ds.shiftCode || 'GS').toLowerCase();
                const typeKey = (code in SHIFT_TEMPLATES ? code : 'gs') as keyof typeof SHIFT_TEMPLATES;
                const tmpl = SHIFT_TEMPLATES[typeKey];
                return {
                  type: typeKey,
                  name: ds.shiftName || tmpl.name,
                  text: ds.timing || tmpl.text,
                  inTime: 'inTime' in tmpl ? tmpl.inTime : undefined,
                  outTime: 'outTime' in tmpl ? tmpl.outTime : undefined,
                  breakTime: 'breakTime' in tmpl ? tmpl.breakTime : undefined,
                  grace: 'grace' in tmpl ? tmpl.grace : undefined,
                };
              });
              return { ...s, days: mappedDays };
            }
            return s;
          });
        });
      }
    } catch {
      // Keep default roster state if offline
    } finally {
      setLoading(false);
    }
  };

  // Manager Scope Perspective Toggle (Team vs Self)
  const [managerScopeMode, setManagerScopeMode] = useState<'team' | 'all' | 'self'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('ALL');

  // Mock Rosters stored in state so updates immediately reflect
  const [schedules, setSchedules] = useState<EmployeeRosterRecord[]>([
    {
      employeeCode: 'MGR-104',
      name: 'Vikram Singh',
      designation: 'Operations Lead & Supervisor',
      dept: 'Operations & Assembly',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      assignedShift: 'General Shift',
      shiftTiming: '09:00 AM – 05:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    },
    {
      employeeCode: 'EMP-1001',
      name: 'Sarah Jenkins',
      designation: 'Senior Process Specialist',
      dept: 'Operations & Assembly',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      assignedShift: 'General Shift',
      shiftTiming: '09:00 AM – 05:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift', inTime: '09:00 AM', outTime: '05:00 PM', breakTime: '01:00 PM - 02:00 PM', grace: '15 mins' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    },
    {
      employeeCode: 'EMP-1003',
      name: 'Marcus Brody',
      designation: 'Senior Machine Operator',
      dept: 'Operations & Assembly',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      assignedShift: 'Morning Shift',
      shiftTiming: '08:00 AM – 04:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    },
    {
      employeeCode: 'EMP-1005',
      name: 'Elena Rostova',
      designation: 'Quality Assurance Specialist',
      dept: 'Operations & Assembly',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      assignedShift: 'Evening Shift',
      shiftTiming: '02:00 PM – 10:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'es', text: '2:00 PM – 10:00 PM', name: 'Evening Shift' },
        { type: 'es', text: '2:00 PM – 10:00 PM', name: 'Evening Shift' },
        { type: 'es', text: '2:00 PM – 10:00 PM', name: 'Evening Shift' },
        { type: 'es', text: '2:00 PM – 10:00 PM', name: 'Evening Shift' },
        { type: 'es', text: '2:00 PM – 10:00 PM', name: 'Evening Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    },
    {
      employeeCode: 'EMP-1006',
      name: 'Tariq Mansoor',
      designation: 'Assembly Technician',
      dept: 'Operations & Assembly',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      assignedShift: 'Night Shift',
      shiftTiming: '10:00 PM – 06:00 AM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'ns', text: '10:00 PM – 6:00 AM', name: 'Night Shift' },
        { type: 'ns', text: '10:00 PM – 6:00 AM', name: 'Night Shift' },
        { type: 'ns', text: '10:00 PM – 6:00 AM', name: 'Night Shift' },
        { type: 'ns', text: '10:00 PM – 6:00 AM', name: 'Night Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'ns', text: '10:00 PM – 6:00 AM', name: 'Night Shift' },
      ],
    },
    {
      employeeCode: 'EMP-1002',
      name: 'Aarav Sharma',
      designation: 'Senior Software Engineer',
      dept: 'Technology',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
      assignedShift: 'General Shift',
      shiftTiming: '09:00 AM – 05:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    },
    {
      employeeCode: 'EMP-1004',
      name: 'Priya Nair',
      designation: 'Talent Operations Lead',
      dept: 'HR',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
      assignedShift: 'General Shift',
      shiftTiming: '09:00 AM – 05:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'gs', text: '9:00 AM – 5:00 PM', name: 'General Shift' },
        { type: 'es', text: '10:00 AM – 6:00 PM', name: 'Evening Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    },
    {
      employeeCode: 'EMP-1007',
      name: 'Rohan Mehta',
      designation: 'Account Executive',
      dept: 'Sales',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
      assignedShift: 'Morning Shift',
      shiftTiming: '08:00 AM – 04:00 PM',
      weeklyOffsCount: 8,
      workingDaysCount: 22,
      days: [
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'ms', text: '8:00 AM – 4:00 PM', name: 'Morning Shift' },
        { type: 'off', text: 'Off', name: 'Weekly Off' },
      ],
    }
  ]);

  // Scoped Schedule based on Persona Role and View Scope
  const scopedSchedule = schedules.filter(emp => {
    if (role === 'EMPLOYEE') {
      return emp.employeeCode === user.employeeCode || emp.employeeCode === 'EMP-1001';
    }
    if (role === 'MANAGER') {
      let isScopeMatch = true;
      if (managerScopeMode === 'team') {
        isScopeMatch = emp.employeeCode !== 'MGR-104' && emp.dept === 'Operations & Assembly';
      } else if (managerScopeMode === 'self') {
        isScopeMatch = emp.employeeCode === 'MGR-104' || emp.employeeCode === user.employeeCode;
      } else {
        isScopeMatch = emp.dept === 'Operations & Assembly';
      }

      if (!isScopeMatch) return false;

      // Filter by Search Query if present
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesCode = emp.employeeCode.toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }

      // Filter by Shift Type if selected
      if (selectedShiftFilter !== 'ALL') {
        const hasShift = emp.days.some(d => d.type.toUpperCase() === selectedShiftFilter);
        if (!hasShift) return false;
      }

      return true;
    }
    return true; // Admin sees all
  });

  const isEmployee = role === 'EMPLOYEE';
  const isManager = role === 'MANAGER';
  const isAdmin = role === 'ADMIN';

  const getChipStyle = (type: string) => {
    switch (type) {
      case 'gs':
        return 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-300';
      case 'ms':
        return 'bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300';
      case 'es':
        return 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300';
      case 'ns':
        return 'bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-300';
      case 'leave':
        return 'bg-red-50 border-red-200 text-red-700 font-bold hover:border-red-300';
      case 'off':
      default:
        return 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300';
    }
  };

  // Open Edit Shift Modal for Manager / Admin
  const handleOpenEditShift = (emp: EmployeeRosterRecord, dayIdx: number, dayName: string, dateNum: number) => {
    if (isEmployee) return; // Employee uses swap request
    const currentDay = emp.days[dayIdx] || { type: 'gs' };
    setEditShiftModal({
      isOpen: true,
      empCode: emp.employeeCode,
      empName: emp.name,
      empAvatar: emp.avatar,
      dateFormatted: `${dayName}, Sep ${dateNum}, 2026`,
      dayIndex: dayIdx,
      currentShiftType: currentDay.type,
      selectedShiftType: currentDay.type,
      applyToWeek: false,
      reason: '',
    });
  };

  // Save Shift Update & API Sync
  const handleSaveShiftUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const template = SHIFT_TEMPLATES[editShiftModal.selectedShiftType];
    const newDayObj: ScheduledDay = {
      type: template.type,
      name: template.name,
      text: template.text,
      inTime: 'inTime' in template ? template.inTime : undefined,
      outTime: 'outTime' in template ? template.outTime : undefined,
      breakTime: 'breakTime' in template ? template.breakTime : undefined,
      grace: 'grace' in template ? template.grace : undefined,
    };

    setSchedules(prev =>
      prev.map(emp => {
        if (emp.employeeCode === editShiftModal.empCode) {
          const updatedDays = [...emp.days];
          if (editShiftModal.applyToWeek) {
            for (let i = 0; i < 5; i++) {
              updatedDays[i] = { ...newDayObj };
            }
          } else {
            updatedDays[editShiftModal.dayIndex] = { ...newDayObj };
          }
          return {
            ...emp,
            assignedShift: template.name,
            shiftTiming: template.text,
            days: updatedDays,
          };
        }
        return emp;
      })
    );

    // Sync to API Gateway
    try {
      await apiClient.put('/shifts/schedule-matrix/cell', {
        employeeId: editShiftModal.empCode,
        date: editShiftModal.dateFormatted,
        shiftCode: template.type.toUpperCase(),
      });
    } catch {
      // Clean fallback if offline
    }

    setEditShiftModal(prev => ({ ...prev, isOpen: false }));
    toast.success(
      'Shift Schedule Updated',
      `Assigned ${template.name} (${template.text}) to ${editShiftModal.empName} for ${editShiftModal.dateFormatted}.`
    );
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSwap(true);

    setTimeout(() => {
      setIsSubmittingSwap(false);
      setShowSwapModal(false);
      setSwapReason('');
      toast.success(
        'Shift Swap Requested',
        `Swap request for ${swapDate} submitted to manager for approval.`
      );
    }, 450);
  };

  // Month View Day Shift Calculation for Month Grid
  const getMonthDayShiftForEmp = (emp: EmployeeRosterRecord, dayNum: number) => {
    const dayOfWeek = (dayNum + 1) % 7; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { type: 'off' as const, name: 'Weekly Off', text: 'Off', color: 'slate' };
    }
    switch (emp.employeeCode) {
      case 'EMP-1001':
        return { type: 'gs' as const, name: 'General Shift', text: '9AM-5PM', color: 'blue' };
      case 'EMP-1003':
        return { type: 'ms' as const, name: 'Morning Shift', text: '8AM-4PM', color: 'amber' };
      case 'EMP-1005':
        return { type: 'es' as const, name: 'Evening Shift', text: '2PM-10PM', color: 'rose' };
      case 'EMP-1006':
        return { type: 'ns' as const, name: 'Night Shift', text: '10PM-6AM', color: 'purple' };
      default:
        return { type: 'gs' as const, name: 'General Shift', text: '9AM-5PM', color: 'blue' };
    }
  };

  const currentWeek = WEEKS_LIST[weekIndex] || WEEKS_LIST[2];
  const currentMonth = MONTHS_LIST[monthIndex] || MONTHS_LIST[1];
  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Admin Module Sub-navigation
  const adminSubNavLinks = [
    { label: 'Shift Library', path: '/shifts/library', count: 12 },
    { label: 'Schedule Matrix', path: '/shifts/schedule' },
    { label: 'Create Shift', path: '/shifts/create' },
    { label: 'Shift Groups', path: '/shifts/groups' },
    { label: 'Assignments', path: '/shifts/assignments' },
    { label: 'Shift Swaps', path: '/shifts/swaps' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{isEmployee ? 'Employee Self-Service' : isManager ? 'Team Management' : 'Administration'}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">
              {isEmployee ? 'My Shift Schedule' : isManager ? 'Team Schedule' : 'Schedule Matrix'}</span>
            <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
              {isEmployee ? 'ESS-ROSTER' : isManager ? 'MGR-OPS-ROSTER' : 'ADM-MASTER'}</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {isEmployee
              ? 'My Monthly Shift Schedule & Roster'
              : isManager
              ? 'Team Schedule (Operations & Assembly)'
              : 'Enterprise Team Schedule & Master Matrix'}</h1>

          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployee
              ? 'View your personal assigned shifts, lunch windows, weekly offs, and request shift exchanges.'
              : isManager
              ? 'Click any shift cell in Weekly Grid or Month View to change shift allocations for your direct team.'
              : 'Plan, assign, and manage enterprise-wide weekly and monthly multi-tier shift rosters.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {isEmployee ? (
            <button
              onClick={() => setShowSwapModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Request Shift Swap</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => toast.success('Roster Broadcast', 'Published weekly schedule notification to team!')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Send className="h-4 w-4" />
                <span>Publish Schedule</span>
              </button>
              <button 
                onClick={() => toast.info('Export Matrix', 'Generating CSV roster export...')}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 transition"
                title="Export schedule"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}</div>
      </div>

      {/* Admin Module Sub-navigation (Hidden for Employee) */}
      {isAdmin && (
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
          {adminSubNavLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
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
      )}

      {/* Manager Role Dual Perspective Control Bar */}
      {isManager && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Manager Scope View:</span>
            </span>
            <div className="flex items-center rounded-lg bg-white p-0.5 border border-blue-200 shadow-2xs font-semibold">
              <button
                onClick={() => setManagerScopeMode('team')}
                className={`px-3 py-1 rounded-md transition ${
                  managerScopeMode === 'team'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Supervised Team (4 Staff)
              </button>
              <button
                onClick={() => setManagerScopeMode('all')}
                className={`px-3 py-1 rounded-md transition ${
                  managerScopeMode === 'all'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Team + Myself (5 Staff)
              </button>
              <button
                onClick={() => setManagerScopeMode('self')}
                className={`px-3 py-1 rounded-md transition ${
                  managerScopeMode === 'self'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Roster Only (Self)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search reportee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-blue-200 rounded-lg px-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={selectedShiftFilter}
              onChange={(e) => setSelectedShiftFilter(e.target.value)}
              className="bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Shift Types</option>
              <option value="GS">General Shift</option>
              <option value="MS">Morning Shift</option>
              <option value="ES">Evening Shift</option>
              <option value="NS">Night Shift</option>
              <option value="OFF">Weekly Off</option>
            </select>
          </div>
        </div>
      )}

      {/* Week/Month Navigator & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Date Navigator Toggleable for Week vs Month */}
        <div className="flex items-center gap-2">
          {viewMode === 'grid' ? (
            <>
              <button
                onClick={() => setWeekIndex(prev => Math.max(0, prev - 1))}
                disabled={weekIndex === 0}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1 font-bold text-slate-900 text-xs">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{currentWeek.label}</span>
              </div>
              <button
                onClick={() => setWeekIndex(prev => Math.min(WEEKS_LIST.length - 1, prev + 1))}
                disabled={weekIndex === WEEKS_LIST.length - 1}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMonthIndex(prev => Math.max(0, prev - 1))}
                disabled={monthIndex === 0}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1 font-bold text-slate-900 text-xs">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{currentMonth.name}</span>
              </div>
              <button
                onClick={() => setMonthIndex(prev => Math.min(MONTHS_LIST.length - 1, prev + 1))}
                disabled={monthIndex === MONTHS_LIST.length - 1}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </>
          )}</div>

        {/* Filter Dropdowns & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {!isEmployee && (
            <>
              {viewMode === 'calendar' && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    value={monthEmpFilter}
                    onChange={(e) => setMonthEmpFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                  >
                    <option value="ALL">All Team Members ({scopedSchedule.length})</option>
                    {scopedSchedule.map(emp => (
                      <option key={emp.employeeCode} value={emp.employeeCode}>
                        {emp.name} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none">
                {isManager ? (
                  <option>Operations & Assembly</option>
                ) : (
                  <>
                    <option>All Departments</option>
                    <option>Operations & Assembly</option>
                    <option>Technology</option>
                    <option>HR</option>
                    <option>Sales</option>
                  </>
                )}
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none">
                <option>Main Office (Bengaluru HQ)</option>
                <option>Mumbai Financial Centre</option>
              </select>
            </>
          )}

          {/* Weekly Grid vs Month View Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg px-3 py-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`rounded-lg px-3 py-1 transition-all ${
                viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month View
            </button>
          </div>
        </div>
      </div>

      {/* Role-Scoped KPI Cards */}
      {isEmployee ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Current Shift</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">General Shift</p>
            <p className="text-xs font-semibold text-slate-600">09:00 AM – 05:00 PM</p>
            <p className="text-[10px] text-slate-400">15m Arrival Grace</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <Calendar className="h-5 w-5" />
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{currentMonth.name}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">22 Days</p>
            <p className="text-xs font-semibold text-slate-600">Working Days Scheduled</p>
            <p className="text-[10px] text-slate-400">176 Work Hours Total</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-indigo-600">
              <Coffee className="h-5 w-5" />
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Weekly Offs</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">8 Days</p>
            <p className="text-xs font-semibold text-slate-600">Saturdays & Sundays</p>
            <p className="text-[10px] text-slate-400">Fixed weekend cycle</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-purple-600">
              <RotateCcw className="h-5 w-5" />
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Swaps</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-600">0 Pending</p>
            <p className="text-xs font-semibold text-slate-600">Shift Swap History</p>
            <p className="text-[10px] text-slate-400">1 approved this quarter</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-blue-600">
              <Users className="h-5 w-5" />
              <span className="text-[10px] font-bold text-slate-400">Scheduled</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{scopedSchedule.length}</p>
            <p className="text-xs font-semibold text-slate-600">{isManager ? 'Team Direct Staff' : 'Scheduled Employees'}</p>
            <p className="text-[10px] text-slate-400">{isManager ? 'Operations & Assembly' : 'of 32 enterprise members'}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-amber-500">
              <Clock className="h-5 w-5" />
              <span className="text-[10px] font-bold text-amber-600">Open</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">0</p>
            <p className="text-xs font-semibold text-slate-600">Open Shifts</p>
            <p className="text-[10px] text-slate-400">Fully allocated</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-rose-500">
              <Users className="h-5 w-5" />
              <span className="text-[10px] font-bold text-rose-600">Unassigned</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600">0</p>
            <p className="text-xs font-semibold text-slate-600">Unassigned Shifts</p>
            <p className="text-[10px] text-slate-400">100% assigned</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-[10px] font-bold text-emerald-600">100%</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">100%</p>
            <p className="text-xs font-semibold text-slate-600">Roster Coverage</p>
            <p className="text-[10px] text-slate-400">vs required staffing</p>
          </div>
        </div>
      )}

      {/* Main Schedule Container (Weekly Grid vs Month View) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Content Area (9 Cols) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-9">
          {viewMode === 'grid' ? (
            /* ========================================================== */
            /* 1. WEEKLY GRID VIEW                                        */
            /* ========================================================== */
            <>
              <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">
                    {isEmployee ? 'My Assigned Weekly Shift Roster' : isManager ? 'Operations & Assembly Staff Matrix' : 'Enterprise Workforce Schedule Matrix'}</span>
                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {scopedSchedule.length} Member{scopedSchedule.length > 1 ? 's' : ''}</span>
                  {!isEmployee && (
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                      💡 Click any shift cell to change/edit
                    </span>
                  )}</div>

                {isEmployee && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Shift Locked & Confirmed
                  </span>
                )}</div>

              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3 min-w-[190px]">Employee / Role</th>
                    {weekDayNames.map((dName, idx) => {
                      const dNum = currentWeek.days[idx];
                      const isWeekend = idx >= 5;
                      return (
                        <th key={idx} className={`px-3 py-3 text-center min-w-[120px] ${isWeekend ? 'bg-slate-50/50' : ''}`}>
                          {dName} <span className="block text-[10px] font-normal text-slate-400">Sep {dNum}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedSchedule.map((emp) => (
                    <tr key={emp.employeeCode} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[10px] text-slate-400">{emp.employeeCode} • {emp.dept}</p>
                          </div>
                        </div>
                      </td>
                      {emp.days.map((day, idx) => {
                        const dateNum = currentWeek.days[idx];
                        const dayName = weekDayNames[idx];
                        return (
                          <td key={idx} className={`p-1.5 text-center ${idx >= 5 ? 'bg-slate-50/30' : ''}`}>
                            <div 
                              onClick={() => {
                                if (!isEmployee) {
                                  handleOpenEditShift(emp, idx, dayName, dateNum);
                                }
                              }}
                              className={`rounded-xl border p-2 text-[10px] transition-all group relative cursor-pointer ${getChipStyle(day.type)} ${
                                !isEmployee ? 'hover:shadow-md hover:scale-[1.02]' : 'hover:shadow-xs'
                              }`}
                              title={!isEmployee ? `Click to change shift for ${emp.name} on ${dayName} Sep ${dateNum}` : undefined}
                            >
                              <p className="font-bold">{day.text}</p>
                              <p className="text-[9px] opacity-80">{day.name}</p>

                              {/* Manager / Admin Edit Hover Badge */}
                              {!isEmployee && (
                                <div className="hidden group-hover:flex absolute inset-0 bg-blue-600/90 text-white rounded-xl font-bold text-[10px] items-center justify-center gap-1 shadow-sm transition">
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
                                </div>
                              )}

                              {/* Employee Swap Day Button */}
                              {isEmployee && day.type !== 'off' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSwapDate(`2026-09-${dateNum < 10 ? '0' + dateNum : dateNum}`);
                                    setShowSwapModal(true);
                                  }}
                                  className="hidden group-hover:block absolute inset-0 bg-blue-600/90 text-white rounded-xl font-bold text-[9px] py-2 transition"
                                >
                                  Swap Day
                                </button>
                              )}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {isEmployee && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing personal roster schedule for <strong>Sarah Jenkins (EMP-1001)</strong></span>
                  <button
                    onClick={() => toast.info('Roster Export', 'Downloading your monthly schedule in PDF...')}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {t('shifts.downloadRosterPdf', 'Download My Roster (PDF)')}</button>
                </div>
              )}
            </>
          ) : (
            /* ========================================================== */
            /* 2. FULL MONTH VIEW CALENDAR                                */
            /* ========================================================== */
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Monthly Roster Calendar — {currentMonth.name}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    {monthEmpFilter === 'ALL' ? `All Team Staff (${scopedSchedule.length})` : scopedSchedule.find(e => e.employeeCode === monthEmpFilter)?.name}</span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> General</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Morning</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Evening</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Night</span>
                </div>
              </div>

              {/* 7-Day Column Header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                <div className="text-slate-400">Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div className="text-slate-400">Sat</div>
              </div>

              {/* Month Grid Cells (September 2026: 30 days, starts Tuesday => offset 2) */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for starting offset */}
                {Array.from({ length: currentMonth.startDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[105px] rounded-xl border border-slate-100 bg-slate-50/40 p-2 opacity-40">
                    <span className="text-[10px] text-slate-300 font-bold">{31 - currentMonth.startDayOffset + i + 1}</span>
                  </div>
                ))}

                {/* Days 1 to TotalDays */}
                {Array.from({ length: currentMonth.totalDays }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayOfWeek = (dayNum + currentMonth.startDayOffset - 1) % 7;
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const isToday = dayNum === 18;

                  return (
                    <div
                      key={dayNum}
                      className={`min-h-[105px] rounded-xl border p-2 text-xs flex flex-col justify-between transition-all ${
                        isToday
                          ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500 shadow-xs'
                          : isWeekend
                          ? 'border-slate-200 bg-slate-50/60'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isToday ? 'text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full' : isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>
                          {dayNum}</span>
                        {isToday && (
                          <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded">
                            Today
                          </span>
                        )}
                        {isWeekend && (
                          <span className="text-[9px] text-slate-400 font-medium">Off</span>
                        )}</div>

                      {/* Shifts in this Day */}
                      <div className="space-y-1 my-1">
                        {monthEmpFilter === 'ALL' ? (
                          // Show mini badges for all team members
                          scopedSchedule.map(emp => {
                            const shift = getMonthDayShiftForEmp(emp, dayNum);
                            const chipBg =
                              shift.type === 'gs' ? 'bg-blue-100 text-blue-800' :
                              shift.type === 'ms' ? 'bg-amber-100 text-amber-800' :
                              shift.type === 'es' ? 'bg-rose-100 text-rose-800' :
                              shift.type === 'ns' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500';
                            
                            return (
                              <div
                                key={emp.employeeCode}
                                onClick={() => {
                                  if (!isEmployee) {
                                    handleOpenEditShift(emp, (dayNum % 7), 'Day', dayNum);
                                  }
                                }}
                                className={`flex items-center justify-between text-[9px] px-1.5 py-0.5 rounded font-medium truncate ${chipBg} ${!isEmployee ? 'cursor-pointer hover:opacity-80' : ''}`}
                                title={`${emp.name}: ${shift.name}`}
                              >
                                <span className="truncate font-semibold">{emp.name.split(' ')[0]}</span>
                                <span className="text-[8px] font-mono uppercase">{shift.type}</span>
                              </div>
                            );
                          })
                        ) : (
                          // Show single selected employee detail
                          (() => {
                            const emp = scopedSchedule.find(e => e.employeeCode === monthEmpFilter) || scopedSchedule[0];
                            const shift = getMonthDayShiftForEmp(emp, dayNum);
                            return (
                              <div 
                                onClick={() => {
                                  if (!isEmployee) {
                                    handleOpenEditShift(emp, (dayNum % 7), 'Day', dayNum);
                                  }
                                }}
                                className={`p-1.5 rounded-lg border text-center ${getChipStyle(shift.type)} ${!isEmployee ? 'cursor-pointer hover:shadow-xs' : ''}`}
                              >
                                <p className="font-bold text-[10px]">{shift.name}</p>
                                <p className="text-[9px] opacity-75">{shift.text}</p>
                              </div>
                            );
                          })()
                        )}</div>

                      <div className="text-[9px] text-slate-400 text-right">
                        {isWeekend ? 'Weekend Off' : 'Coverage 100%'}</div>
                    </div>
                  );
                })}</div>
            </div>
          )}</div>

        {/* Right Sidebar: Guidelines & Quick Actions (3 Cols) */}
        <div className="space-y-6 lg:col-span-3">
          {/* Shift Legend */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Shift Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <div>
                  <p className="font-semibold text-slate-800">General Shift</p>
                  <p className="text-[10px] text-slate-400">9:00 AM – 5:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                <div>
                  <p className="font-semibold text-slate-800">Morning Shift</p>
                  <p className="text-[10px] text-slate-400">8:00 AM – 4:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                <div>
                  <p className="font-semibold text-slate-800">Evening Shift</p>
                  <p className="text-[10px] text-slate-400">2:00 PM – 10:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                <div>
                  <p className="font-semibold text-slate-800">Night Shift</p>
                  <p className="text-[10px] text-slate-400">10:00 PM – 6:00 AM</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300"></span>
                <div>
                  <p className="font-semibold text-slate-800">Off / Unscheduled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Shift Guidelines / Policy Rule Box */}
          {isEmployee ? (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>My Shift Policy Rules</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-indigo-900">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lateness Grace:</span>
                  <span className="font-semibold">15 Minutes (09:15 AM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lunch Break:</span>
                  <span className="font-semibold">60m (01:00 PM – 02:00 PM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Overtime Trigger:</span>
                  <span className="font-semibold text-emerald-700">Past 05:30 PM (1.5x)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Swap Lead Time:</span>
                  <span className="font-semibold">24 Hours Prior</span>
                </div>
              </div>
            </div>
          ) : (
            /* Staffing Summary for Manager/Admin */
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Staffing Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Staff in Scope</span>
                  <span className="font-bold text-slate-900">{scopedSchedule.length}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Scheduled</span>
                  <span className="font-bold text-slate-900">{scopedSchedule.length}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Open Shifts</span>
                  <span className="font-bold text-emerald-600">0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Unassigned</span>
                  <span className="font-bold text-emerald-600">0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span>Coverage</span>
                  <span className="font-bold text-emerald-600">100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Quick Actions</h4>
            {isEmployee ? (
              <>
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="flex w-full items-center gap-2 rounded-lg bg-blue-50 p-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Request Shift Swap</span>
                </button>
                <NavLink
                  to="/policies/leaves"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Apply for Leave</span>
                </NavLink>
              </>
            ) : (
              <>
                <button
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Copy Previous Week Assignments?',
                      text: 'This will copy all shift allocations from the preceding week into the current schedule.',
                      confirmButtonText: 'Yes, Copy Schedule',
                      icon: 'info',
                    });
                    if (confirmed) {
                      toast.success('Roster Cloned', 'Successfully cloned schedule pattern to active week!');
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-lg bg-blue-50 p-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Last Week</span>
                </button>
                <button
                  onClick={() => toast.info('Auto Roster', 'Auto-assigning balanced morning/evening rotation...')}
                  className="flex w-full items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Auto-Balance Shifts</span>
                </button>
                <NavLink
                  to="/shifts/library"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Sliders className="h-3.5 w-3.5 text-slate-400" />
                  <span>Manage Shift Library</span>
                </NavLink>
              </>
            )}</div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. EDIT / REASSIGN SHIFT MODAL (MANAGER & ADMIN)           */}
      {/* ========================================================== */}
      {editShiftModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('shifts.change_shift_assignment', 'Change Shift Assignment')}</h3>
                  <p className="text-xs text-slate-500">Update scheduled shift for team member</p>
                </div>
              </div>
              <button
                onClick={() => setEditShiftModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShiftUpdate} className="p-6 space-y-4">
              {/* Target Employee & Date Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img src={editShiftModal.empAvatar} alt="" className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <p className="font-bold text-xs text-slate-900">{editShiftModal.empName}</p>
                  <p className="text-[11px] text-slate-500">{editShiftModal.empCode} • {editShiftModal.dateFormatted}</p>
                </div>
              </div>

              {/* Shift Options Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">{t('shifts.select_new_shift', 'Select New Shift')}</label>
                <div className="space-y-2">
                  {Object.entries(SHIFT_TEMPLATES).map(([key, item]) => {
                    const isSelected = editShiftModal.selectedShiftType === key;
                    return (
                      <div
                        key={key}
                        onClick={() => setEditShiftModal(prev => ({ ...prev, selectedShiftType: key as any }))}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="shiftSelection"
                            checked={isSelected}
                            onChange={() => {}}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.text}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          key === 'gs' ? 'bg-blue-100 text-blue-700' :
                          key === 'ms' ? 'bg-amber-100 text-amber-700' :
                          key === 'es' ? 'bg-rose-100 text-rose-700' :
                          key === 'ns' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {key}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Apply Scope */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editShiftModal.applyToWeek}
                    onChange={(e) => setEditShiftModal(prev => ({ ...prev, applyToWeek: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Apply this shift to the entire working week (Mon – Fri)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditShiftModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. SHIFT SWAP MODAL (EMPLOYEE SELF-SERVICE)                */}
      {/* ========================================================== */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('shifts.request_shift_swap', 'Request Shift Swap')}</h3>
                  <p className="text-xs text-slate-500">Exchange an upcoming scheduled shift with a team colleague</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('shifts.date_to_swap_out', 'Date to Swap Out')}</label>
                <input
                  type="date"
                  value={swapDate}
                  onChange={(e) => setSwapDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('shifts.exchange_with_colleague_operat', 'Exchange With Colleague (Operations & Assembly)')}</label>
                <select
                  value={swapWithEmp}
                  onChange={(e) => setSwapWithEmp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EMP-1003">Marcus Brody (EMP-1003 — Morning Shift)</option>
                  <option value="EMP-1005">Elena Rostova (EMP-1005 — Evening Shift)</option>
                  <option value="EMP-1006">Tariq Mansoor (EMP-1006 — Night Shift)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('shifts.desired_target_shift', 'Desired Target Shift')}</label>
                <select
                  value={swapDesiredShift}
                  onChange={(e) => setSwapDesiredShift(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Morning Shift (08:00 AM - 04:00 PM)</option>
                  <option>Evening Shift (02:00 PM - 10:00 PM)</option>
                  <option>Night Shift (10:00 PM - 06:00 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('shifts.reason_for_exchange_request', 'Reason for Exchange Request')}</label>
                <textarea
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  rows={3}
                  placeholder={t('shifts.e_g_medical_appointment_in_the', 'e.g., Medical appointment in the morning, doctor consultation.')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('action.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSwap}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  {isSubmittingSwap ? t('shifts.submitting', 'Submitting...') : t('shifts.submitSwapRequest', 'Submit Swap Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
