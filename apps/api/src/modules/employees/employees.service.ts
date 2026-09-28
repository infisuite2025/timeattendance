import { EmployeeDetailDTO, EmployeeSummaryDTO } from '@infi-timepro/shared-types';
import { AuditService } from '../audit/audit.service.js';

export class EmployeesService {
  private employees: EmployeeDetailDTO[] = [];

  constructor() {
    this.initEmployees();
  }

  private initEmployees() {
    const seedNamed: EmployeeDetailDTO[] = [
      {
        id: 'emp_naresh_001',
        employeeCode: 'TP0001',
        firstName: 'Naresh',
        lastName: 'Andukoori',
        fullName: 'Naresh Andukoori',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
        jobTitle: 'Principal Systems Administrator',
        departmentId: 'dept_hr_004',
        departmentName: 'Human Resources',
        locationId: 'loc_hyd_001',
        locationName: 'Hyderabad Main Office',
        employmentType: 'full_time',
        employmentStatus: 'active',
        biometricId: 'BIO-EMP-001',
        joiningDate: '2020-01-01',
        overtimeEligible: true,
        remoteWorkEligible: false,
        email: 'naresh@company.com',
        phoneNumber: '+91 9876543210',
        currentShift: {
          id: 'shf_gen_001',
          code: 'GS',
          name: 'General Shift',
          timing: '09:00 AM - 06:00 PM',
        },
        attendanceSummary: {
          presentDays: 21,
          absentDays: 0,
          lateDays: 1,
          leaveDays: 1,
          wfhDays: 0,
          totalHours: '168h 30m',
          attendanceRate: 98,
        },
      },
      {
        id: 'emp_srinivas_002',
        employeeCode: 'TP1012',
        firstName: 'Srinivas',
        lastName: 'Reddy',
        fullName: 'Srinivas Reddy',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
        jobTitle: 'Product Manager',
        departmentId: 'dept_prod_002',
        departmentName: 'Product',
        locationId: 'loc_hyd_001',
        locationName: 'Hyderabad Main Office',
        reportingManagerId: 'emp_naresh_001',
        reportingManagerName: 'Naresh Andukoori',
        employmentType: 'full_time',
        employmentStatus: 'active',
        biometricId: 'BIO-EMP-012',
        joiningDate: '2022-03-15',
        overtimeEligible: true,
        remoteWorkEligible: true,
        email: 'srinivas.reddy@company.com',
        phoneNumber: '+91 9876543211',
        currentShift: {
          id: 'shf_gen_001',
          code: 'GS',
          name: 'General Shift',
          timing: '09:00 AM - 06:00 PM',
        },
        attendanceSummary: {
          presentDays: 18,
          absentDays: 2,
          lateDays: 3,
          leaveDays: 2,
          wfhDays: 3,
          totalHours: '142h 30m',
          attendanceRate: 88,
        },
      },
      {
        id: 'emp_priya_003',
        employeeCode: 'TP0456',
        firstName: 'Priya',
        lastName: 'Sharma',
        fullName: 'Priya Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
        jobTitle: 'Lead Product Designer',
        departmentId: 'dept_prod_002',
        departmentName: 'Product',
        locationId: 'loc_blr_002',
        locationName: 'Bengaluru HQ',
        reportingManagerId: 'emp_srinivas_002',
        reportingManagerName: 'Srinivas Reddy',
        employmentType: 'full_time',
        employmentStatus: 'active',
        biometricId: 'BIO-EMP-234',
        joiningDate: '2023-01-10',
        overtimeEligible: false,
        remoteWorkEligible: true,
        email: 'priya.sharma@company.com',
        phoneNumber: '+91 9876543212',
        currentShift: {
          id: 'shf_gen_001',
          code: 'GS',
          name: 'General Shift',
          timing: '09:00 AM - 06:00 PM',
        },
        attendanceSummary: {
          presentDays: 20,
          absentDays: 1,
          lateDays: 0,
          leaveDays: 1,
          wfhDays: 4,
          totalHours: '160h 15m',
          attendanceRate: 95,
        },
      },
      {
        id: 'emp_amit_006',
        employeeCode: 'TP0783',
        firstName: 'Amit',
        lastName: 'Kumar',
        fullName: 'Amit Kumar',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
        jobTitle: 'Regional Sales Lead',
        departmentId: 'dept_sales_003',
        departmentName: 'Sales & Marketing',
        locationId: 'loc_mum_003',
        locationName: 'Mumbai Office',
        reportingManagerId: 'emp_naresh_001',
        reportingManagerName: 'Naresh Andukoori',
        employmentType: 'full_time',
        employmentStatus: 'active',
        biometricId: 'BIO-EMP-783',
        joiningDate: '2021-07-20',
        overtimeEligible: true,
        remoteWorkEligible: false,
        email: 'amit.kumar@company.com',
        phoneNumber: '+91 9876543215',
        currentShift: {
          id: 'shf_gen_001',
          code: 'GS',
          name: 'General Shift',
          timing: '09:00 AM - 06:00 PM',
        },
        attendanceSummary: {
          presentDays: 19,
          absentDays: 1,
          lateDays: 4,
          leaveDays: 0,
          wfhDays: 1,
          totalHours: '155h 40m',
          attendanceRate: 91,
        },
      },
      {
        id: 'emp_rohan_004',
        employeeCode: 'EMP-0026',
        firstName: 'Rohan',
        lastName: 'Mehta',
        fullName: 'Rohan Mehta',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
        jobTitle: 'Senior Software Engineer',
        departmentId: 'dept_eng_001',
        departmentName: 'Engineering',
        locationId: 'loc_blr_002',
        locationName: 'Bengaluru HQ',
        reportingManagerId: 'emp_naresh_001',
        reportingManagerName: 'Naresh Andukoori',
        employmentType: 'full_time',
        employmentStatus: 'active',
        biometricId: 'BIO-EMP-026',
        joiningDate: '2023-06-01',
        overtimeEligible: true,
        remoteWorkEligible: true,
        email: 'rohan.mehta@company.com',
        phoneNumber: '+91 9876543213',
        currentShift: {
          id: 'shf_gen_001',
          code: 'GS',
          name: 'General Shift',
          timing: '09:00 AM - 06:00 PM',
        },
        attendanceSummary: {
          presentDays: 17,
          absentDays: 3,
          lateDays: 2,
          leaveDays: 2,
          wfhDays: 2,
          totalHours: '138h 20m',
          attendanceRate: 85,
        },
      },
      {
        id: 'emp_aarav_005',
        employeeCode: 'EMP-001',
        firstName: 'Aarav',
        lastName: 'Sharma',
        fullName: 'Aarav Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
        jobTitle: 'Frontend Engineer',
        departmentId: 'dept_eng_001',
        departmentName: 'Engineering',
        locationId: 'loc_blr_002',
        locationName: 'Bengaluru HQ',
        reportingManagerId: 'emp_rohan_004',
        reportingManagerName: 'Rohan Mehta',
        employmentType: 'full_time',
        employmentStatus: 'active',
        biometricId: 'BIO-EMP-001',
        joiningDate: '2023-08-01',
        overtimeEligible: true,
        remoteWorkEligible: true,
        email: 'aarav.sharma@company.com',
        phoneNumber: '+91 9876543214',
        currentShift: {
          id: 'shf_morn_002',
          code: 'MS',
          name: 'Morning Shift',
          timing: '07:00 AM - 04:00 PM',
        },
        attendanceSummary: {
          presentDays: 22,
          absentDays: 0,
          lateDays: 1,
          leaveDays: 0,
          wfhDays: 5,
          totalHours: '176h 00m',
          attendanceRate: 100,
        },
      }
    ];

    const firstNames = ['Rajesh', 'Ananya', 'Vikram', 'Deepika', 'Karthik', 'Sneha', 'Arjun', 'Pooja', 'Siddharth', 'Divya', 'Manish', 'Neha', 'Sanjay', 'Ritu', 'Aditya', 'Meera'];
    const lastNames = ['Verma', 'Nair', 'Iyer', 'Patel', 'Rao', 'Chowdhury', 'Deshmukh', 'Gupta', 'Joshi', 'Singh', 'Bhat', 'Kapoor', 'Pillai', 'Saxena', 'Mukherjee', 'Menon'];

    const locations = [
      { id: 'loc_hyd_001', name: 'Hyderabad Main Office', count: 650 },
      { id: 'loc_blr_002', name: 'Bengaluru HQ', count: 302 },
      { id: 'loc_mum_003', name: 'Mumbai Office', count: 146 },
      { id: 'loc_del_004', name: 'Delhi Office', count: 100 },
      { id: 'loc_chn_005', name: 'Chennai Plant', count: 50 },
    ];

    const departments = [
      { id: 'dept_eng_001', name: 'Engineering', title: 'Software Engineer' },
      { id: 'dept_prod_002', name: 'Product', title: 'Product Specialist' },
      { id: 'dept_sales_003', name: 'Sales & Marketing', title: 'Account Executive' },
      { id: 'dept_hr_004', name: 'Human Resources', title: 'HR Generalist' },
      { id: 'dept_fin_005', name: 'Finance & Accounts', title: 'Financial Analyst' },
      { id: 'dept_ops_006', name: 'Operations & Support', title: 'Operations Associate' },
    ];

    const generated: EmployeeDetailDTO[] = [];
    let empCounter = 1001;

    // Distribute employees across locations to match exact breakdown: 650, 302, 146, 100, 50
    let locIndex = 0;
    let locCounter = 0;

    for (let i = 0; i < 1248; i++) {
      if (i < seedNamed.length) {
        generated.push(seedNamed[i]);
        continue;
      }

      // Determine location based on quota
      while (locIndex < locations.length && locCounter >= locations[locIndex].count) {
        locIndex++;
        locCounter = 0;
      }
      const loc = locations[locIndex] || locations[0];
      locCounter++;

      const dept = departments[i % departments.length];
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[(i * 3) % lastNames.length];
      const code = `TP${String(empCounter++).padStart(4, '0')}`;
      const isContractor = i % 10 === 0; // ~10.3% flexible workforce (128 contractors)

      generated.push({
        id: `emp_gen_${i}`,
        employeeCode: code,
        firstName: fn,
        lastName: ln,
        fullName: `${fn} ${ln}`,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i % 500)}?w=120&auto=format&fit=crop`,
        jobTitle: dept.title,
        departmentId: dept.id,
        departmentName: dept.name,
        locationId: loc.id,
        locationName: loc.name,
        employmentType: isContractor ? 'contractor' : 'full_time',
        employmentStatus: 'active',
        biometricId: `BIO-${code}`,
        joiningDate: '2023-01-15',
        overtimeEligible: true,
        remoteWorkEligible: !isContractor,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@company.com`,
        phoneNumber: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        currentShift: {
          id: 'shf_gen_001',
          code: 'GS',
          name: 'General Shift',
          timing: '09:00 AM - 06:00 PM',
        },
        attendanceSummary: {
          presentDays: 20,
          absentDays: 1,
          lateDays: 1,
          leaveDays: 0,
          wfhDays: 2,
          totalHours: '160h 00m',
          attendanceRate: 95,
        },
      });
    }

    this.employees = generated;
  }

  async getEmployees(params?: {
    search?: string;
    departmentId?: string;
    locationId?: string;
    status?: string;
  }): Promise<EmployeeSummaryDTO[]> {
    let result = [...this.employees];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.jobTitle.toLowerCase().includes(q)
      );
    }

    if (params?.departmentId && params.departmentId !== 'all') {
      const deptId = params.departmentId;
      result = result.filter((e) => e.departmentId === deptId || e.departmentName.toLowerCase() === deptId.toLowerCase());
    }

    if (params?.locationId && params.locationId !== 'all') {
      const locId = params.locationId;
      result = result.filter((e) => e.locationId === locId || e.locationName.toLowerCase() === locId.toLowerCase());
    }

    return result;
  }

  async getEmployeeById(id: string): Promise<EmployeeDetailDTO | null> {
    const found = this.employees.find((e) => e.id === id || e.employeeCode === id);
    return found || this.employees[0];
  }

  async createEmployee(payload: any): Promise<EmployeeDetailDTO> {
    if (!payload.firstName?.trim() || !payload.lastName?.trim() || !payload.email?.trim()) {
      throw new Error('Mandatory field validation failed: First Name, Last Name, and Corporate Email are required.');
    }

    const emailLower = payload.email.trim().toLowerCase();
    const existing = this.employees.find((e) => e.email?.toLowerCase() === emailLower);
    if (existing) {
      throw new Error(`Duplicate profile conflict: Corporate email "${payload.email.trim()}" is already registered to ${existing.fullName} (${existing.employeeCode}).`);
    }

    const newEmp: EmployeeDetailDTO = {
      id: `emp_${Date.now()}`,
      employeeCode: `TP${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      fullName: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
      jobTitle: payload.jobTitle?.trim() || 'Software Engineer',
      departmentId: payload.departmentId || 'dept_eng_001',
      departmentName: 'Engineering',
      locationId: payload.locationId || 'loc_hyd_001',
      locationName: 'Hyderabad Main Office',
      employmentType: payload.employmentType || 'full_time',
      employmentStatus: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      overtimeEligible: true,
      remoteWorkEligible: true,
      email: emailLower,
      currentShift: {
        id: 'shf_gen_001',
        code: 'GS',
        name: 'General Shift',
        timing: '09:00 AM - 06:00 PM',
      },
      attendanceSummary: {
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        leaveDays: 0,
        wfhDays: 0,
        totalHours: '0h 00m',
        attendanceRate: 100,
      },
    };
    this.employees.unshift(newEmp);

    AuditService.recordEvent({
      eventCode: 'EMPLOYEE_PROFILE_CREATED',
      category: 'security',
      severity: 'info',
      targetEntity: 'EmployeeProfile',
      targetId: newEmp.id,
      description: `Created new workforce profile for ${newEmp.fullName} (${newEmp.employeeCode} - ${newEmp.email}).`,
      afterState: { id: newEmp.id, code: newEmp.employeeCode, email: newEmp.email, role: newEmp.jobTitle }
    }).catch(() => null);

    return newEmp;
  }

  async updateEmployee(id: string, payload: any): Promise<EmployeeDetailDTO> {
    const index = this.employees.findIndex((e) => e.id === id || e.employeeCode === id);
    if (index === -1) {
      throw new Error('Employee not found');
    }
    const current = this.employees[index];
    const updated: EmployeeDetailDTO = {
      ...current,
      fullName: payload.name || payload.fullName || current.fullName,
      jobTitle: payload.designation || payload.jobTitle || current.jobTitle,
      departmentName: payload.department || payload.departmentName || current.departmentName,
      locationName: payload.location || payload.locationName || current.locationName,
      email: payload.email || current.email,
      phoneNumber: payload.phone || payload.phoneNumber || current.phoneNumber,
      employmentStatus: payload.status ? (payload.status.toLowerCase() === 'active' ? 'active' : payload.status.toLowerCase()) : current.employmentStatus,
    };
    this.employees[index] = updated;

    AuditService.recordEvent({
      eventCode: 'EMPLOYEE_PROFILE_MUTATED',
      category: 'security',
      severity: 'warning',
      targetEntity: 'EmployeeProfile',
      targetId: updated.id,
      description: `Updated profile details for ${updated.fullName} (${updated.employeeCode}).`,
      beforeState: { jobTitle: current.jobTitle, status: current.employmentStatus },
      afterState: { jobTitle: updated.jobTitle, status: updated.employmentStatus }
    }).catch(() => null);

    return updated;
  }
}

export const employeesService = new EmployeesService();
