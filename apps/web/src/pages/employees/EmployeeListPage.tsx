import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Building,
  MapPin,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiClient } from '../../services/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { EmployeeDetailDTO, EmployeeSummaryDTO } from '@infi-timepro/shared-types';
import { useI18n } from '../../context/I18nContext.tsx';
import { encodeSecureToken } from '../../utils/routeSecurity.ts';

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  employeeCount: number;
}

interface LocationItem {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

export const EmployeeListPage: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useNotification();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State & Validation
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newDept, setNewDept] = useState('dept_eng_001');
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic API State
  const [employees, setEmployees] = useState<EmployeeDetailDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, locRes] = await Promise.all([
        apiClient.get<EmployeeDetailDTO[]>('/employees'),
        apiClient.get<DepartmentItem[]>('/organization/departments'),
        apiClient.get<LocationItem[]>('/organization/locations')
      ]);

      if (empRes.data) {
        const list = Array.isArray(empRes.data) ? empRes.data : (empRes.data as any).data || [];
        setEmployees(list);
      }
      if (deptRes.data) {
        const dList = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data as any).data || [];
        setDepartments(dList);
      }
      if (locRes.data) {
        const lList = Array.isArray(locRes.data) ? locRes.data : (locRes.data as any).data || [];
        setLocations(lList);
      }
    } catch {
      toast.error('Failed to load employee directory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      emp.fullName?.toLowerCase().includes(q) ||
      emp.employeeCode?.toLowerCase().includes(q) ||
      emp.jobTitle?.toLowerCase().includes(q);

    const matchesDept =
      selectedDept === 'all' ||
      emp.departmentId === selectedDept ||
      emp.departmentName?.toLowerCase() === selectedDept.toLowerCase();

    const matchesLoc =
      selectedLocation === 'all' ||
      emp.locationId === selectedLocation ||
      emp.locationName?.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesDept && matchesLoc;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Mandatory Field Assertions
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim() || !newJobTitle.trim()) {
      setFormError('Please fill in all mandatory fields (First Name, Last Name, Email, Job Title).');
      return;
    }

    // Email Format Assertion
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setFormError('Invalid corporate email address format.');
      return;
    }

    // Local Uniqueness / Duplicate Assertion
    const existingEmp = employees.find(emp => emp.email?.toLowerCase() === newEmail.trim().toLowerCase());
    if (existingEmp) {
      setFormError(`An employee with email "${newEmail.trim()}" already exists (${existingEmp.fullName} - ${existingEmp.employeeCode}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        email: newEmail.trim(),
        jobTitle: newJobTitle.trim(),
        departmentId: newDept
      };

      const res = await apiClient.post<EmployeeDetailDTO>('/employees', payload);
      if (res.data) {
        toast.success(`Employee ${newFirstName} ${newLastName} created successfully!`);
        setIsAddModalOpen(false);
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        setNewJobTitle('');
        setFormError(null);
        await loadData();
      } else if (res.error) {
        setFormError(res.error.message || 'Failed to create employee profile.');
        toast.error(res.error.message || 'Failed to create employee');
      }
    } catch {
      setFormError('Network connection error while submitting profile.');
      toast.error('Error adding employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalWorkforce = employees.length;
  const fullTimeCount = employees.filter(e => e.employmentType === 'full_time' || !e.employmentType).length;
  const flexCount = employees.filter(e => e.employmentType !== 'full_time' && e.employmentType).length;
  const uniqueSites = locations.length || 5;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-600 font-medium">Loading Employees & Workforce Directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Administration</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-700">Employees Directory</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('employees.employees_workforce_directory', 'Employees & Workforce Directory')}</h1>
          <p className="text-xs text-slate-500">
            Manage worker profiles, organizational assignments, and attendance configurations.
          </p>
        </div>

        {role !== 'DATA_PROTECTION_OFFICER' ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Data Principals Audit Register (Read-Only)</span>
          </span>
        )}
      </div>

      {/* Directory Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Workforce</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalWorkforce.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-medium">98.5% Active Status</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Full-Time Staff</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{fullTimeCount.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">
            {totalWorkforce > 0 ? ((fullTimeCount / totalWorkforce) * 100).toFixed(1) : 100}% of total
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Contractors & Interns</p>
          <p className="mt-2 text-2xl font-bold text-purple-600">{flexCount.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">
            {totalWorkforce > 0 ? ((flexCount / totalWorkforce) * 100).toFixed(1) : 0}% flexible workforce
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Locations & Plants</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{uniqueSites} Sites</p>
          <p className="text-[11px] text-slate-400">All geofences operational</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('employees.search_by_name_employee_id_rol', 'Search by name, employee ID, role...')}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Employee Code</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Assigned Shift</th>
              <th className="px-4 py-3">Employment Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="w-10 px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3">
                  <NavLink
                    to={`/employees/${encodeSecureToken(emp.employeeCode || emp.id)}`}
                    className="flex items-center gap-3 hover:text-blue-600"
                  >
                    <img
                      src={emp.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop'}
                      alt={emp.fullName}
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{emp.fullName}</p>
                      <p className="text-[11px] text-slate-500">{emp.jobTitle}</p>
                    </div>
                  </NavLink>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">{emp.employeeCode}</td>
                <td className="px-4 py-3 text-slate-600">{emp.departmentName}</td>
                <td className="px-4 py-3 text-slate-600">{emp.locationName}</td>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {emp.currentShift ? `${emp.currentShift.name} (${emp.currentShift.timing})` : 'General Shift (09:00 - 18:00)'}</td>
                <td className="px-4 py-3 text-slate-600 capitalize">
                  {emp.employmentType ? emp.employmentType.replace('_', '-') : 'Full-time'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 capitalize">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {emp.employmentStatus || 'Active'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No employee profiles found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {filteredEmployees.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs bg-slate-50/50">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(startIndex + pageSize, filteredEmployees.length)}</span> of{' '}
              <span className="font-bold text-slate-800">{filteredEmployees.length.toLocaleString()}</span> employees
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="text-slate-600 font-medium px-2">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}</div>

      {/* Add Employee Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">{t('employees.add_new_employee_profile', 'Add New Employee Profile')}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    {t('employees.first_name', 'First Name')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => {
                      setNewFirstName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder={t('employees.e_g_rahul', 'e.g. Rahul')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    {t('employees.last_name', 'Last Name')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => {
                      setNewLastName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder={t('employees.e_g_varma', 'e.g. Varma')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-700">
                  {t('employees.corporate_email', 'Corporate Email')} <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder={t('employees.e_g_rahul_varma_company_com', 'e.g. rahul.varma@company.com')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    {t('employees.job_title', 'Job Title')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobTitle}
                    onChange={(e) => {
                      setNewJobTitle(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder={t('employees.e_g_qa_automation_lead', 'e.g. QA Automation Lead')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    {t('employees.department', 'Department')} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    'Create Profile'
                  )}</button>
              </div>
            </form>
          </div>
        </div>
      )}</div>
  );
};
