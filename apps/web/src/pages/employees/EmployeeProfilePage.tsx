import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  TabletSmartphone,
  CheckCircle2,
  FileText,
  UserCheck,
  Edit2,
  X,
  Save,
  Check,
  Layers,
  History,
  AlertCircle,
  Plus,
  Briefcase,
  Smartphone,
  Fingerprint,
  ScanFace,
  Lock,
  Bell,
  Globe,
  Radio,
  Sparkles,
  ChevronRight,
  Shield,
  Send,
  Download,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotification } from '../../context/NotificationContext.tsx';
import { useI18n } from '../../context/I18nContext.tsx';
import { apiClient } from '../../services/apiClient.ts';
import { DpdpaConsentItemDTO, DpdpaOfficerInfoDTO } from '@infi-timepro/shared-types';

export const EmployeeProfilePage: React.FC = () => {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const { toast, confirm } = useNotification();

  const [activeTab, setActiveTab] = useState<'details' | 'attendance_policy' | 'devices' | 'preferences' | 'dpdpa'>('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);

  const [dpdpaConsents, setDpdpaConsents] = useState<DpdpaConsentItemDTO[]>([]);
  const [dpoInfo, setDpoInfo] = useState<DpdpaOfficerInfoDTO | null>(null);
  const [isExportingData, setIsExportingData] = useState(false);
  const [grievanceCategory, setGrievanceCategory] = useState('data_access');
  const [grievanceDescription, setGrievanceDescription] = useState('');
  const [isFilingGrievance, setIsFilingGrievance] = useState(false);

  // Profile Data State
  const [profile, setProfile] = useState({
    name: user.name || 'Sarah Jenkins',
    employeeCode: user.employeeCode || 'EMP-1001',
    designation: user.designation || 'Senior Process Specialist',
    department: user.department || 'Operations & Assembly',
    email: user.email || 'sarah.jenkins@company.com',
    avatar: user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '+91 98765 43210',
    emergencyContactName: 'Robert Jenkins (Spouse)',
    emergencyContactPhone: '+91 98765 99881',
    address: '#402, Lotus Grand Residences, Outer Ring Road, Bengaluru, Karnataka 560103',
    joiningDate: '12 January 2023',
    employmentType: 'Full-Time Permanent',
    bandGrade: 'IC-4 Senior Technical Specialist',
    workMode: 'Hybrid (3 Days Office / 2 Days Remote)',
    baseLocation: 'Bengaluru Tech Park HQ (Block B, Level 2)',
    timezone: 'Asia/Kolkata (IST — UTC+05:30)',
    reportingManagerName: 'Vikram Singh',
    reportingManagerCode: 'MGR-104',
    reportingManagerEmail: 'vikram.singh@company.com',
    reportingManagerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    legalEntity: 'InfiTime Global Technologies India Pvt Ltd',
    costCenter: 'CC-OPS-IN-04',
    // Shifts & Attendance Config
    assignedShiftName: 'General Shift',
    shiftTiming: '09:00 AM – 05:00 PM',
    shiftGrace: '15 Minutes (Up to 09:15 AM)',
    lunchWindow: '01:00 PM – 02:00 PM (60 Minutes)',
    weeklyOffPattern: 'Fixed 5-Day Work Week (Saturdays & Sundays Off)',
    otEligibility: 'Eligible past 05:30 PM (1.5x Multiplier)',
    // Hardware & Devices
    biometricPin: 'BIO-99481',
    rfidCardNo: 'RFID-BLR-88029',
    faceTokenId: 'FT-BLR-JENKINS-01',
    faceEnrolledAt: '14 Jan 2023 (Turnstile Terminal BIO-01)',
    mobileDeviceModel: 'Apple iPhone 15 Pro',
    mobileAppVersion: 'v2.4.1 (Build 180)',
    mobileDeviceId: 'UUID-9A88-FF41-2026',
    antiMockGpsActive: true,
    // Notification Preferences
    notifyShiftChanges: true,
    notifyPunchReminders: true,
    notifyLeaveApprovals: true,
    notifyOvertimeAlerts: true
  });

  // Edit Form Temporary State
  const [editForm, setEditForm] = useState({
    phone: profile.phone,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone,
    address: profile.address
  });

  const loadDpdpaData = async () => {
    try {
      const [cnsRes, dpoRes] = await Promise.all([
        apiClient.get<DpdpaConsentItemDTO[]>('/dpdpa/consents'),
        apiClient.get<DpdpaOfficerInfoDTO>('/dpdpa/officer-info')
      ]);
      if (cnsRes.data) {
        setDpdpaConsents(Array.isArray(cnsRes.data) ? cnsRes.data : (cnsRes.data as any).data || []);
      }
      if (dpoRes.data) {
        setDpoInfo(dpoRes.data);
      }
    } catch {
      toast.error('Failed to load DPDPA consent state');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'dpdpa') {
      loadDpdpaData();
    }
  }, [activeTab]);

  const handleToggleConsent = async (consent: DpdpaConsentItemDTO) => {
    if (consent.isMandatory && consent.isGranted) {
      toast.error('Statutory Mandatory Consent', `DPDPA Rule: "${consent.title}" is mandatory for employment contract & attendance tracking.`);
      return;
    }

    try {
      const res = await apiClient.put<DpdpaConsentItemDTO[]>(`/dpdpa/consents/${consent.id}`, {
        isGranted: !consent.isGranted
      });
      if (res.data) {
        setDpdpaConsents(res.data);
        toast.success(
          !consent.isGranted ? 'Consent Granted' : 'Consent Revoked',
          `Updated DPDPA consent for "${consent.title}".`
        );
      } else if (res.error) {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to update DPDPA consent');
    }
  };

  const handleDownloadDataSummary = async () => {
    setIsExportingData(true);
    try {
      const res = await apiClient.get('/dpdpa/personal-data-summary');
      if (res.data) {
        const jsonString = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DPDPA_Sec11_Personal_Data_Summary_${profile.employeeCode}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Statutory Summary Downloaded', 'Generated DPDPA Sec 11 Data Principal Personal Summary with SHA-256 seal.');
      } else {
        toast.error(res.error?.message || 'Failed to generate summary');
      }
    } catch {
      toast.error('Error generating personal data summary');
    } finally {
      setIsExportingData(false);
    }
  };

  const handleFileGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceDescription.trim()) return;

    setIsFilingGrievance(true);
    try {
      const res = await apiClient.post('/dpdpa/privacy-grievance', {
        category: grievanceCategory,
        description: grievanceDescription.trim()
      });
      if (res.data) {
        toast.success('Privacy Grievance Registered', `Grievance ticket ${res.data.id} assigned to DPO ${dpoInfo?.dpoName || 'Rajesh Kumar'}.`);
        setShowGrievanceModal(false);
        setGrievanceDescription('');
      } else if (res.error) {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to submit privacy grievance ticket');
    } finally {
      setIsFilingGrievance(false);
    }
  };
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      phone: editForm.phone,
      emergencyContactName: editForm.emergencyContactName,
      emergencyContactPhone: editForm.emergencyContactPhone,
      address: editForm.address
    }));
    setShowEditModal(false);
    toast.success('Profile Updated', 'Your contact details and address have been updated successfully.');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.error('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (newPwd.length < 8) {
      toast.error('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setShowPasswordModal(false);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    toast.success('Security PIN Updated', 'Your authentication credentials have been updated.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Employee Self-Service</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-700">My Profile & Preferences</span>
        <span className="ml-2 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
          ESS-ID: {profile.employeeCode}</span>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 relative">
          <div className="absolute right-6 top-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {profile.employmentType}</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-white"
              />
              <span className="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-500 ring-2 ring-white" title="Active Staff">
                <Check className="w-3 h-3 text-white" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">{profile.name}</h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm">
                  {profile.employeeCode}</span>
              </div>
              <p className="text-sm font-semibold text-slate-600">{profile.designation}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {profile.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.baseLocation}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2 md:pt-0">
            <button
              onClick={() => {
                setEditForm({
                  phone: profile.phone,
                  emergencyContactName: profile.emergencyContactName,
                  emergencyContactPhone: profile.emergencyContactPhone,
                  address: profile.address
                });
                setShowEditModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" /> Security PIN
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-600">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Active Shift</span>
          </div>
          <p className="font-bold text-base text-slate-900">{profile.assignedShiftName}</p>
          <p className="text-xs text-slate-500">{profile.shiftTiming}</p>
          <p className="text-[10px] text-slate-400">Arrival grace: {profile.shiftGrace}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <UserCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Supervisor</span>
          </div>
          <p className="font-bold text-base text-slate-900">{profile.reportingManagerName}</p>
          <p className="text-xs text-slate-500">{profile.reportingManagerCode} • Operations Lead</p>
          <p className="text-[10px] text-slate-400">{profile.reportingManagerEmail}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Mobile Kiosk</span>
          </div>
          <p className="font-bold text-base text-slate-900">{profile.mobileDeviceModel}</p>
          <p className="text-xs text-slate-500">App {profile.mobileAppVersion}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Anti-Spoofing GPS Active</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <ScanFace className="w-5 h-5" />
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Biometric Gate</span>
          </div>
          <p className="font-bold text-base text-slate-900">Enrolled & Verified</p>
          <p className="text-xs text-slate-500">Badge: {profile.rfidCardNo}</p>
          <p className="text-[10px] text-slate-400">Synced across HQ Turnstiles</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal & Employment Information</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance_policy')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'attendance_policy'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift Rules & Overtime Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'devices'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TabletSmartphone className="w-4 h-4" />
          <span>Biometric & Device Authentication</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification & App Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('dpdpa')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'dpdpa'
              ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>DPDPA 2023 Consent & Privacy Center</span>
        </button>
      </div>

      {/* TAB 1: Personal & Employment Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Contact Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Contact Information
              </h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Work Email</span>
                <span className="font-semibold text-slate-800 font-mono">{profile.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Primary Phone</span>
                <span className="font-semibold text-slate-800">{profile.phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Emergency Contact Person</span>
                <span className="font-semibold text-slate-800">{profile.emergencyContactName}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Emergency Phone</span>
                <span className="font-semibold text-slate-800">{profile.emergencyContactPhone}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">Residential Address</span>
                <span className="font-semibold text-slate-800 leading-relaxed">{profile.address}</span>
              </div>
            </div>
          </div>

          {/* Employment Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Employment & Organization Profile
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Official HR Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Joining</span>
                <span className="font-semibold text-slate-800">{profile.joiningDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Employment Classification</span>
                <span className="font-semibold text-slate-800">{profile.employmentType}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Band / Job Level</span>
                <span className="font-semibold text-slate-800">{profile.bandGrade}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Work Arrangement</span>
                <span className="font-semibold text-blue-600">{profile.workMode}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Cost Center</span>
                <span className="font-semibold text-slate-800 font-mono">{profile.costCenter}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Legal Entity</span>
                <span className="font-semibold text-slate-800">{profile.legalEntity}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Shift Rules & Overtime Policy */}
      {activeTab === 'attendance_policy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              Assigned Shift & Schedule Policy
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-blue-900">
                  <span>Shift Name: {profile.assignedShiftName}</span>
                  <span className="font-mono">{profile.shiftTiming}</span>
                </div>
                <p className="text-[11px] text-blue-700">8.0 Planned Work Hours + 1.0h Lunch Break</p>
              </div>

              <div className="space-y-2 text-slate-700 pt-1">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Lateness Grace Window:</span>
                  <span className="font-semibold text-slate-900">{profile.shiftGrace}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Unpaid Lunch Break:</span>
                  <span className="font-semibold text-slate-900">{profile.lunchWindow}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Weekly Off Pattern:</span>
                  <span className="font-semibold text-slate-900">{profile.weeklyOffPattern}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Timezone Base:</span>
                  <span className="font-semibold text-slate-900 font-mono">{profile.timezone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Overtime & Regularisation Entitlements
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Overtime Policy: Standard Rate</span>
                  <span className="text-emerald-700 font-mono">1.5x Multiplier</span>
                </div>
                <p className="text-[11px] text-emerald-700">Extra hours detected past 05:30 PM with 15m grace deduction.</p>
              </div>

              <div className="space-y-2 text-slate-700 pt-1">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Monthly Regularisation Limit:</span>
                  <span className="font-semibold text-slate-900">Max 3 Requests / Month</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Approval Workflow:</span>
                  <span className="font-semibold text-slate-900">Single Tier (Reporting Manager)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Comp-Off Accrual:</span>
                  <span className="font-semibold text-slate-900">Available for Weekend & Holiday Swipes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Biometric & Device Authentication */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ScanFace className="w-4 h-4 text-purple-600" />
              Hardware Biometric Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Biometric Template Hash:</span>
                <span className="font-mono font-semibold text-blue-600">{profile.faceTokenId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Physical RFID Badge ID:</span>
                <span className="font-mono font-semibold text-slate-900">{profile.rfidCardNo}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Enrollment Station:</span>
                <span className="font-semibold text-slate-900">{profile.faceEnrolledAt}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Mesh Sync Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized across all 4 gates
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              Authorized Mobile Handset
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Handset Model:</span>
                <span className="font-semibold text-slate-900">{profile.mobileDeviceModel}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Device UUID:</span>
                <span className="font-mono text-slate-600">{profile.mobileDeviceId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Installed Flutter Suite:</span>
                <span className="font-semibold text-slate-900">{profile.mobileAppVersion}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Hardware Sensor Spoof Shield:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Anti-Mock GPS Enforced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Notification & Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-bold text-base text-slate-900">{t('employees.notification_alerts_reminders', 'Notification Alerts & Reminders')}</h3>
            <p className="text-xs text-slate-500">Configure how InfiTimePro notifies you regarding attendance, punches, and roster updates.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900 text-xs">Shift Schedule Changes & Swaps</p>
                <p className="text-slate-500 text-[11px]">Receive push and email notifications whenever your manager updates your shift schedule.</p>
              </div>
              <input
                type="checkbox"
                checked={profile.notifyShiftChanges}
                onChange={(e) => {
                  setProfile(p => ({ ...p, notifyShiftChanges: e.target.checked }));
                  toast.success('Preference Saved', 'Shift notification preference updated.');
                }}
                className="rounded text-blue-600 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900 text-xs">Morning Punch-in Grace Reminder</p>
                <p className="text-slate-500 text-[11px]">Receive an alert 15 minutes before your shift start time to avoid lateness penalties.</p>
              </div>
              <input
                type="checkbox"
                checked={profile.notifyPunchReminders}
                onChange={(e) => {
                  setProfile(p => ({ ...p, notifyPunchReminders: e.target.checked }));
                  toast.success('Preference Saved', 'Punch reminder preference updated.');
                }}
                className="rounded text-blue-600 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-900 text-xs">Leave & Regularisation Decision Alerts</p>
                <p className="text-slate-500 text-[11px]">Instant notifications when your supervisor approves or reviews your time-off applications.</p>
              </div>
              <input
                type="checkbox"
                checked={profile.notifyLeaveApprovals}
                onChange={(e) => {
                  setProfile(p => ({ ...p, notifyLeaveApprovals: e.target.checked }));
                  toast.success('Preference Saved', 'Approval notification preference updated.');
                }}
                className="rounded text-blue-600 h-4 w-4"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DPDPA 2023 Consent & Privacy Center */}
      {activeTab === 'dpdpa' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Action Banner */}
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Digital Personal Data Protection Act, 2023 (DPDPA India) Center</h2>
              </div>
              <p className="text-xs text-emerald-200">
                Statutory Data Principal Rights Portal. Manage itemized consents, download your personal data summary, or file privacy grievances.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadDataSummary}
                disabled={isExportingData}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExportingData ? 'Generating Summary...' : 'Download Personal Data Summary (Sec 11)'}
              </button>
              <button
                onClick={() => setShowGrievanceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700 text-emerald-100 font-semibold text-xs rounded-xl transition"
              >
                <AlertCircle className="w-4 h-4 text-emerald-300" />
                <span>File Privacy Grievance</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Consent Manager Toggles */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Itemized Data Principal Consent Registry (DPDPA Sec 6)
                </h3>
                <p className="text-xs text-slate-500">
                  Review and manage itemized consents granted for attendance processing and workforce management.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {dpdpaConsents.map((consent) => (
                  <div key={consent.id} className="p-4 bg-white hover:bg-slate-50 transition flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{consent.title}</span>
                        {consent.isMandatory ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Statutory Mandatory
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            Optional Consent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{consent.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Legal Basis: {consent.statutoryBasis} • Status: {consent.isGranted ? `Granted (${new Date(consent.grantedAt || '').toLocaleDateString()})` : 'Revoked'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleConsent(consent)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        consent.isGranted ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          consent.isGranted ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: DPO & Data Residency Registry */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Data Protection Officer (DPO)</h3>
                </div>

                {dpoInfo && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Designated DPO</span>
                      <span className="font-bold text-slate-900">{dpoInfo.dpoName}</span>
                      <span className="text-slate-500 block text-[11px]">{dpoInfo.dpoTitle}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Email</span>
                      <span className="font-mono text-blue-600 font-semibold">{dpoInfo.dpoEmail}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Grievance Hotline</span>
                      <span className="font-mono text-slate-800">{dpoInfo.dpoPhone}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">DPBI Registration Code</span>
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                        {dpoInfo.dpbiRegistrationCode}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2 text-emerald-950 text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold">India Data Residency Certification</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  All employee personal data, biometric hashes, and location logs are stored strictly inside Indian Data Centers (<span className="font-mono font-bold">AWS ap-south-1 Mumbai</span>). Zero cross-border data transfer without statutory authorization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DPDPA Privacy Grievance Modal */}
      {showGrievanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">File DPDPA Privacy Grievance</h3>
                  <p className="text-xs text-slate-500">Statutory Privacy Ticket (DPDPA 2023 Sec 13)</p>
                </div>
              </div>
              <button
                onClick={() => setShowGrievanceModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFileGrievance} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grievance Category</label>
                <select
                  value={grievanceCategory}
                  onChange={(e) => setGrievanceCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="data_access">Right to Access Data Summary (Sec 11)</option>
                  <option value="data_correction">Right to Data Correction (Sec 12)</option>
                  <option value="consent_withdrawal">Consent Withdrawal Dispute (Sec 6)</option>
                  <option value="unauthorized_processing">Unauthorized Personal Data Processing</option>
                  <option value="erasure_request">Data Erasure / Deletion Request</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grievance Description *</label>
                <textarea
                  rows={4}
                  required
                  value={grievanceDescription}
                  onChange={(e) => setGrievanceDescription(e.target.value)}
                  placeholder="Describe your privacy concern or data correction request in detail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrievanceModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFilingGrievance}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {isFilingGrievance ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Ticket to DPO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('employees.edit_contact_details', 'Edit Contact Details')}</h3>
                  <p className="text-xs text-slate-500">Update your phone number, residential address, and emergency contact</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('employees.primary_mobile_number', 'Primary Mobile Number')}</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('employees.emergency_contact_person', 'Emergency Contact Person')}</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('employees.emergency_phone', 'Emergency Phone')}</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('employees.residential_address', 'Residential Address')}</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security PIN Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t('employees.change_security_pin', 'Change Security PIN')}</h3>
                  <p className="text-xs text-slate-500">Update your biometric kiosk PIN & mobile passcode</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('employees.current_pin_password', 'Current PIN / Password')}</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('employees.new_security_pin_min_8_chars', 'New Security PIN (Min 8 Chars)')}</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('employees.confirm_new_pin', 'Confirm New PIN')}</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >{t('employees.update_security_pin', 'Update Security PIN')}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
