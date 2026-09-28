import {
  ScheduleMatrixDTO,
  ShiftAssignmentDTO,
  ShiftDTO,
  ShiftGroupDTO,
  ShiftSwapRequestDTO,
} from '@infi-timepro/shared-types';

export class ShiftsService {
  private shifts: ShiftDTO[] = [
    {
      id: 'shf_1',
      code: 'GS',
      name: 'General Shift',
      description: 'Standard day shift for general office employees.',
      shiftType: 'fixed',
      shiftCategory: 'General',
      colorHex: '#3B82F6',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 15m | OUT: 15m',
      graceInMinutes: 15,
      graceOutMinutes: 15,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: true,
      status: 'active',
    },
    {
      id: 'shf_2',
      code: 'MS',
      name: 'Morning Shift',
      description: 'Early morning shift for production and operations.',
      shiftType: 'fixed',
      shiftCategory: 'Production',
      colorHex: '#10B981',
      startTime: '07:00 AM',
      endTime: '04:00 PM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 10m | OUT: 10m',
      graceInMinutes: 10,
      graceOutMinutes: 10,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: false,
      status: 'active',
    },
    {
      id: 'shf_3',
      code: 'ES',
      name: 'Evening Shift',
      description: 'Second shift for operational coverage.',
      shiftType: 'fixed',
      shiftCategory: 'Production',
      colorHex: '#F59E0B',
      startTime: '02:00 PM',
      endTime: '11:00 PM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 10m | OUT: 10m',
      graceInMinutes: 10,
      graceOutMinutes: 10,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: false,
      status: 'active',
    },
    {
      id: 'shf_4',
      code: 'NS',
      name: 'Night Shift',
      description: 'Overnight shift starting after 8 PM.',
      shiftType: 'night',
      shiftCategory: 'Support',
      colorHex: '#8B5CF6',
      startTime: '10:00 PM',
      endTime: '07:00 AM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 15m | OUT: 15m',
      graceInMinutes: 15,
      graceOutMinutes: 15,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: false,
      status: 'active',
    },
    {
      id: 'shf_5',
      code: 'FS',
      name: 'Flexi Shift',
      description: 'Flexible timing with core working hours.',
      shiftType: 'flexible',
      shiftCategory: 'Management',
      colorHex: '#06B6D4',
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 30m | OUT: 30m',
      graceInMinutes: 30,
      graceOutMinutes: 30,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: true,
      status: 'active',
    },
    {
      id: 'shf_6',
      code: 'US1',
      name: 'US Shift (EST)',
      description: 'North American market coverage shift.',
      shiftType: 'fixed',
      shiftCategory: 'Support',
      colorHex: '#64748B',
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 15m | OUT: 15m',
      graceInMinutes: 15,
      graceOutMinutes: 15,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: false,
      status: 'draft',
    },
    {
      id: 'shf_7',
      code: 'CM',
      name: 'Cross-Midnight',
      description: 'Cross-midnight shift ending next day.',
      shiftType: 'cross_midnight',
      shiftCategory: 'Operations',
      colorHex: '#EC4899',
      startTime: '09:00 PM',
      endTime: '06:00 AM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 10m | OUT: 10m',
      graceInMinutes: 10,
      graceOutMinutes: 10,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: false,
      status: 'active',
    },
    {
      id: 'shf_8',
      code: 'WS',
      name: 'Weekend Shift',
      description: 'Special weekend support schedule.',
      shiftType: 'fixed',
      shiftCategory: 'Support',
      colorHex: '#94A3B8',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      duration: '08h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 10m | OUT: 10m',
      graceInMinutes: 10,
      graceOutMinutes: 10,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '7h 00m',
      overtimeThreshold: '8h 00m',
      autoDetectEnabled: false,
      status: 'archived',
    },
  ];

  private shiftGroups: ShiftGroupDTO[] = [
    {
      id: 'grp_1',
      code: 'GRP-001',
      name: 'General Shift',
      description: 'Standard working hours for general office staff across all departments.',
      includedShifts: ['Morning (9AM - 5PM)', 'Evening (1PM - 9PM)'],
      locations: 'Head Office & All Departments',
      employeeCount: 68,
      patternType: 'Fixed',
      status: 'active',
    },
    {
      id: 'grp_2',
      code: 'GRP-002',
      name: 'Production Rotational',
      description: '24/7 manufacturing floor rotational pattern.',
      includedShifts: ['Morning', 'Evening', 'Night'],
      locations: 'Manufacturing Production',
      employeeCount: 54,
      patternType: 'Rotational',
      status: 'active',
    },
    {
      id: 'grp_3',
      code: 'GRP-003',
      name: 'Support Team',
      description: 'Tier 1 & Tier 2 customer service support.',
      includedShifts: ['Day', 'Evening'],
      locations: 'Head Office Support',
      employeeCount: 32,
      patternType: 'Fixed',
      status: 'active',
    },
    {
      id: 'grp_4',
      code: 'GRP-004',
      name: 'Weekend Operations',
      description: 'Critical facility plant operations.',
      includedShifts: ['Morning', 'Night'],
      locations: 'Plant 1 Operations',
      employeeCount: 28,
      patternType: 'Rotational',
      status: 'active',
    },
    {
      id: 'grp_5',
      code: 'GRP-005',
      name: 'Night Crew',
      description: 'Dedicated overnight security and server maintenance.',
      includedShifts: ['Night'],
      locations: 'Plant 1 Security',
      employeeCount: 18,
      patternType: 'Fixed',
      status: 'active',
    },
    {
      id: 'grp_6',
      code: 'GRP-006',
      name: 'Management',
      description: 'Executive management flexible hours.',
      includedShifts: ['Flexible', 'Day'],
      locations: 'Head Office Management',
      employeeCount: 12,
      patternType: 'Flexible',
      status: 'inactive',
    },
    {
      id: 'grp_7',
      code: 'GRP-007',
      name: 'Field Staff',
      description: 'On-site installation and inspection staff.',
      includedShifts: ['Morning', 'Evening'],
      locations: 'Multiple Locations Field Operations',
      employeeCount: 36,
      patternType: 'Rotational',
      status: 'active',
    },
  ];

  private shiftAssignments: ShiftAssignmentDTO[] = [
    {
      id: 'sa_1',
      employeeId: 'emp_aarav_005',
      employeeCode: 'EMP-001',
      employeeName: 'Aarav Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
      department: 'Technology',
      currentShift: 'General Shift (09:00 AM - 06:00 PM)',
      shiftTiming: '09:00 AM - 06:00 PM',
      effectiveFrom: '01 Sep 2024',
      effectiveTo: '30 Sep 2024',
      assignedBy: 'Naresh Andholavi',
      status: 'active',
    },
    {
      id: 'sa_2',
      employeeId: 'emp_priya_003',
      employeeCode: 'EMP-002',
      employeeName: 'Priya Nair',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
      department: 'HR',
      currentShift: 'Morning Shift (06:00 AM - 02:00 PM)',
      shiftTiming: '06:00 AM - 02:00 PM',
      effectiveFrom: '01 Sep 2024',
      effectiveTo: '30 Sep 2024',
      assignedBy: 'Rohan Mehta',
      status: 'active',
    },
    {
      id: 'sa_3',
      employeeId: 'emp_rohan_004',
      employeeCode: 'EMP-003',
      employeeName: 'Rohan Mehta',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
      department: 'Sales',
      currentShift: 'Evening Shift (02:00 PM - 10:00 PM)',
      shiftTiming: '02:00 PM - 10:00 PM',
      effectiveFrom: '01 Sep 2024',
      effectiveTo: '30 Sep 2024',
      assignedBy: 'Smita Kulkarni',
      status: 'active',
    },
    {
      id: 'sa_4',
      employeeId: 'emp_smita_009',
      employeeCode: 'EMP-004',
      employeeName: 'Smita Kulkarni',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
      department: 'Marketing',
      currentShift: 'General Shift (09:00 AM - 06:00 PM)',
      shiftTiming: '09:00 AM - 06:00 PM',
      effectiveFrom: '01 Sep 2024',
      effectiveTo: '30 Sep 2024',
      assignedBy: 'Naresh Andholavi',
      status: 'active',
    },
    {
      id: 'sa_5',
      employeeId: 'emp_vikram_010',
      employeeCode: 'EMP-005',
      employeeName: 'Vikram Singh',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop',
      department: 'Operations',
      currentShift: 'Night Shift (10:00 PM - 06:00 AM)',
      shiftTiming: '10:00 PM - 06:00 AM',
      effectiveFrom: '01 Sep 2024',
      effectiveTo: '30 Sep 2024',
      assignedBy: 'Rohan Mehta',
      status: 'scheduled',
    },
  ];

  private shiftSwaps: ShiftSwapRequestDTO[] = [
    {
      id: 'swp_1',
      requestCode: 'SSW-2024-001',
      requesterId: 'emp_aarav_005',
      requesterName: 'Aarav Sharma',
      requesterDept: 'Technology',
      requesterAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
      swapWithId: 'emp_priya_003',
      swapWithName: 'Priya Nair',
      swapWithDept: 'Technology',
      swapWithAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
      date: '12 Sep 2024 (Thu)',
      currentShift: 'Morning',
      currentShiftTiming: '9:00 AM - 5:00 PM',
      requestedShift: 'Evening',
      requestedShiftTiming: '2:00 PM - 10:00 PM',
      reason: 'Personal commitment in the morning. Need to attend a family function.',
      status: 'pending',
      submittedOn: '10 Sep 2024, 10:24 AM',
    },
    {
      id: 'swp_2',
      requestCode: 'SSW-2024-002',
      requesterId: 'emp_rohan_004',
      requesterName: 'Rohan Mehta',
      requesterDept: 'Sales',
      swapWithId: 'emp_vikram_010',
      swapWithName: 'Vikram Singh',
      swapWithDept: 'Sales',
      date: '14 Sep 2024 (Sat)',
      currentShift: 'Evening',
      currentShiftTiming: '2:00 PM - 10:00 PM',
      requestedShift: 'Morning',
      requestedShiftTiming: '9:00 AM - 5:00 PM',
      reason: 'Family event.',
      status: 'approved',
      submittedOn: '09 Sep 2024, 02:15 PM',
    },
  ];

  getShifts(): ShiftDTO[] {
    return this.shifts;
  }

  getShiftGroups(): ShiftGroupDTO[] {
    return this.shiftGroups;
  }

  getShiftAssignments(): ShiftAssignmentDTO[] {
    return this.shiftAssignments;
  }

  getShiftSwaps(): ShiftSwapRequestDTO[] {
    return this.shiftSwaps;
  }

  private scheduleMatrix: ScheduleMatrixDTO = {
    weekRange: 'Sep 16 – Sep 22, 2024',
    metrics: {
      scheduledEmployees: 28,
      totalEmployees: 32,
      openShifts: 4,
      unassignedShifts: 3,
      coveragePercentage: 92,
    },
    schedule: [
      {
        employeeId: 'emp_aarav_005',
        employeeName: 'Aarav Sharma',
        department: 'Technology',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
        shifts: [
          { date: '2024-09-16', dayName: 'Mon', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-17', dayName: 'Tue', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-18', dayName: 'Wed', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-19', dayName: 'Thu', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-20', dayName: 'Fri', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-21', dayName: 'Sat', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-22', dayName: 'Sun', isOff: true, shiftCode: 'OFF' },
        ],
      },
      {
        employeeId: 'emp_priya_003',
        employeeName: 'Priya Nair',
        department: 'HR',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
        shifts: [
          { date: '2024-09-16', dayName: 'Mon', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-17', dayName: 'Tue', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-18', dayName: 'Wed', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-19', dayName: 'Thu', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-20', dayName: 'Fri', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-21', dayName: 'Sat', shiftCode: 'ES', shiftName: 'Evening Shift', timing: '10:00 AM – 6:00 PM', colorHex: '#F59E0B' },
          { date: '2024-09-22', dayName: 'Sun', isOff: true, shiftCode: 'OFF' },
        ],
      },
      {
        employeeId: 'emp_rohan_004',
        employeeName: 'Rohan Mehta',
        department: 'Sales',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
        shifts: [
          { date: '2024-09-16', dayName: 'Mon', shiftCode: 'MS', shiftName: 'Morning Shift', timing: '8:00 AM – 4:00 PM', colorHex: '#10B981' },
          { date: '2024-09-17', dayName: 'Tue', shiftCode: 'MS', shiftName: 'Morning Shift', timing: '8:00 AM – 4:00 PM', colorHex: '#10B981' },
          { date: '2024-09-18', dayName: 'Wed', shiftCode: 'MS', shiftName: 'Morning Shift', timing: '8:00 AM – 4:00 PM', colorHex: '#10B981' },
          { date: '2024-09-19', dayName: 'Thu', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-20', dayName: 'Fri', shiftCode: 'MS', shiftName: 'Morning Shift', timing: '8:00 AM – 4:00 PM', colorHex: '#10B981' },
          { date: '2024-09-21', dayName: 'Sat', shiftCode: 'MS', shiftName: 'Morning Shift', timing: '8:00 AM – 4:00 PM', colorHex: '#10B981' },
          { date: '2024-09-22', dayName: 'Sun', isOff: true, shiftCode: 'OFF' },
        ],
      },
      {
        employeeId: 'emp_sneha_011',
        employeeName: 'Sneha Kulkarni',
        department: 'Marketing',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
        shifts: [
          { date: '2024-09-16', dayName: 'Mon', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-17', dayName: 'Tue', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-18', dayName: 'Wed', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-19', dayName: 'Thu', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-20', dayName: 'Fri', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-21', dayName: 'Sat', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-22', dayName: 'Sun', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
        ],
      },
      {
        employeeId: 'emp_vikram_010',
        employeeName: 'Vikram Singh',
        department: 'Operations',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop',
        shifts: [
          { date: '2024-09-16', dayName: 'Mon', shiftCode: 'NS', shiftName: 'Night Shift', timing: '2:00 PM – 10:00 PM', colorHex: '#8B5CF6' },
          { date: '2024-09-17', dayName: 'Tue', shiftCode: 'NS', shiftName: 'Night Shift', timing: '2:00 PM – 10:00 PM', colorHex: '#8B5CF6' },
          { date: '2024-09-18', dayName: 'Wed', shiftCode: 'NS', shiftName: 'Night Shift', timing: '2:00 PM – 10:00 PM', colorHex: '#8B5CF6' },
          { date: '2024-09-19', dayName: 'Thu', shiftCode: 'NS', shiftName: 'Night Shift', timing: '2:00 PM – 10:00 PM', colorHex: '#8B5CF6' },
          { date: '2024-09-20', dayName: 'Fri', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-21', dayName: 'Sat', shiftCode: 'NS', shiftName: 'Night Shift', timing: '2:00 PM – 10:00 PM', colorHex: '#8B5CF6' },
          { date: '2024-09-22', dayName: 'Sun', shiftCode: 'NS', shiftName: 'Night Shift', timing: '2:00 PM – 10:00 PM', colorHex: '#8B5CF6' },
        ],
      },
      {
        employeeId: 'emp_kavya_012',
        employeeName: 'Kavya Iyer',
        department: 'Finance',
        avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop',
        shifts: [
          { date: '2024-09-16', dayName: 'Mon', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-17', dayName: 'Tue', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-18', dayName: 'Wed', isLeave: true, shiftCode: 'LEAVE', shiftName: 'Annual Leave' },
          { date: '2024-09-19', dayName: 'Thu', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-20', dayName: 'Fri', shiftCode: 'GS', shiftName: 'General Shift', timing: '9:00 AM – 5:00 PM', colorHex: '#3B82F6' },
          { date: '2024-09-21', dayName: 'Sat', isOff: true, shiftCode: 'OFF' },
          { date: '2024-09-22', dayName: 'Sun', isOff: true, shiftCode: 'OFF' },
        ],
      },
    ],
  };

  getScheduleMatrix(): ScheduleMatrixDTO {
    return this.scheduleMatrix;
  }

  createShift(payload: any): ShiftDTO {
    const newShift: ShiftDTO = {
      id: `shf_${Date.now()}`,
      code: payload.code || 'NEW',
      name: payload.name || 'Custom Shift',
      description: payload.description || '',
      shiftType: payload.shiftType || 'fixed',
      shiftCategory: payload.shiftCategory || 'General',
      colorHex: payload.colorHex || '#3B82F6',
      startTime: payload.startTime || '09:00 AM',
      endTime: payload.endTime || '06:00 PM',
      duration: '09h 00m',
      breakDuration: '01h 00m',
      isBreakPaid: false,
      graceRules: 'IN: 15m | OUT: 15m',
      graceInMinutes: 15,
      graceOutMinutes: 15,
      halfDayThreshold: '4h 00m',
      fullDayThreshold: '8h 00m',
      overtimeThreshold: '9h 00m',
      autoDetectEnabled: Boolean(payload.autoDetectEnabled),
      status: 'active',
    };
    this.shifts.unshift(newShift);
    return newShift;
  }

  updateShiftStatus(id: string, status: 'active' | 'draft' | 'archived'): ShiftDTO | null {
    const shift = this.shifts.find(s => s.id === id || s.code === id);
    if (!shift) return null;
    shift.status = status;
    return shift;
  }

  deleteShift(id: string): boolean {
    const idx = this.shifts.findIndex(s => s.id === id || s.code === id);
    if (idx === -1) return false;
    this.shifts.splice(idx, 1);
    return true;
  }

  createShiftGroup(payload: any): ShiftGroupDTO {
    const newGroup: ShiftGroupDTO = {
      id: `grp_${Date.now()}`,
      code: payload.code || `GRP-${Math.floor(100 + Math.random() * 900)}`,
      name: payload.name || 'New Shift Group',
      description: payload.description || 'Custom shift group.',
      includedShifts: payload.includedShifts || ['General Shift'],
      locations: payload.locations || 'All Departments',
      employeeCount: payload.employeeCount || 0,
      patternType: payload.patternType || 'Fixed',
      status: 'active',
    };
    this.shiftGroups.unshift(newGroup);
    return newGroup;
  }

  assignShift(payload: any): ShiftAssignmentDTO {
    const newAssign: ShiftAssignmentDTO = {
      id: `sa_${Date.now()}`,
      employeeId: payload.employeeId || 'emp_custom',
      employeeCode: payload.employeeCode || 'EMP-NEW',
      employeeName: payload.employeeName || 'Assigned Staff',
      avatarUrl: payload.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
      department: payload.department || 'Operations',
      currentShift: payload.currentShift || 'General Shift (09:00 AM - 06:00 PM)',
      shiftTiming: payload.shiftTiming || '09:00 AM - 06:00 PM',
      effectiveFrom: payload.effectiveFrom || '01 Sep 2026',
      effectiveTo: payload.effectiveTo || '30 Sep 2026',
      assignedBy: payload.assignedBy || 'Naresh Andukoori',
      status: 'active',
    };
    this.shiftAssignments.unshift(newAssign);
    return newAssign;
  }

  createShiftSwap(payload: any): ShiftSwapRequestDTO {
    const newSwap: ShiftSwapRequestDTO = {
      id: `swp_${Date.now()}`,
      requestCode: `SSW-2026-${Math.floor(100 + Math.random() * 900)}`,
      requesterId: payload.requesterId || 'emp_001',
      requesterName: payload.requesterName || 'Aarav Sharma',
      requesterDept: payload.requesterDept || 'Technology',
      requesterAvatar: payload.requesterAvatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
      swapWithId: payload.swapWithId || 'emp_002',
      swapWithName: payload.swapWithName || 'Priya Nair',
      swapWithDept: payload.swapWithDept || 'HR',
      swapWithAvatar: payload.swapWithAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
      date: payload.date || '22 Sep 2026',
      currentShift: payload.currentShift || 'General Shift',
      currentShiftTiming: payload.currentShiftTiming || '09:00 AM - 06:00 PM',
      requestedShift: payload.requestedShift || 'Morning Shift',
      requestedShiftTiming: payload.requestedShiftTiming || '07:00 AM - 04:00 PM',
      reason: payload.reason || 'Personal commitment',
      status: 'pending',
      submittedOn: new Date().toLocaleString(),
    };
    this.shiftSwaps.unshift(newSwap);
    return newSwap;
  }

  approveShiftSwap(id: string): ShiftSwapRequestDTO | null {
    const swap = this.shiftSwaps.find(s => s.id === id || s.requestCode === id);
    if (!swap) return null;
    swap.status = 'approved';
    return swap;
  }

  rejectShiftSwap(id: string): ShiftSwapRequestDTO | null {
    const swap = this.shiftSwaps.find(s => s.id === id || s.requestCode === id);
    if (!swap) return null;
    swap.status = 'rejected';
    return swap;
  }

  updateScheduleCell(employeeId: string, date: string, shiftCode: string): boolean {
    const matrix = this.getScheduleMatrix();
    const empRoster = matrix.schedule.find(s => s.employeeId === employeeId || s.employeeName.toLowerCase().includes(employeeId.toLowerCase()));
    if (!empRoster) return false;
    const dayCell = empRoster.shifts.find(d => d.date === date);
    if (!dayCell) return false;
    
    dayCell.shiftCode = shiftCode;
    if (shiftCode === 'OFF') {
      dayCell.isOff = true;
      dayCell.shiftName = 'Weekly Off';
    } else {
      dayCell.isOff = false;
      const targetShift = this.shifts.find(s => s.code === shiftCode);
      if (targetShift) {
        dayCell.shiftName = targetShift.name;
        dayCell.timing = `${targetShift.startTime} – ${targetShift.endTime}`;
        dayCell.colorHex = targetShift.colorHex;
      }
    }
    return true;
  }
}

export const shiftsService = new ShiftsService();
