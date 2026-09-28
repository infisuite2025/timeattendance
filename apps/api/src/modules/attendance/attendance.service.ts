import {
  AttendanceDayDTO,
  RawPunchDTO,
  MyAttendanceMonthViewDTO,
  MyAttendanceDayRecordDTO,
  TeamAttendanceSummaryDTO,
  TeamAttendanceMemberDTO
} from '@infi-timepro/shared-types';

export class AttendanceService {
  getRecentPunches(): RawPunchDTO[] {
    return [
      {
        id: 'p_1',
        employeeId: 'emp_srinivas_002',
        employeeCode: 'TP0012',
        employeeName: 'Srinivas Reddy',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
        timestampUtc: '2025-04-28T03:32:00Z',
        timeDisplay: '09:02 AM',
        eventType: 'IN',
        source: 'face_recognition',
        locationName: 'Hyderabad',
        deviceId: 'FR-01',
        status: 'accepted',
      },
      {
        id: 'p_2',
        employeeId: 'emp_priya_003',
        employeeCode: 'TP0456',
        employeeName: 'Priya Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
        timestampUtc: '2025-04-28T03:28:00Z',
        timeDisplay: '08:58 AM',
        eventType: 'IN',
        source: 'mobile_app',
        locationName: 'Bengaluru',
        deviceId: 'APP',
        status: 'accepted',
      },
      {
        id: 'p_3',
        employeeId: 'emp_amit_006',
        employeeCode: 'TP0678',
        employeeName: 'Amit Kumar',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
        timestampUtc: '2025-04-28T03:45:00Z',
        timeDisplay: '09:15 AM',
        eventType: 'IN',
        source: 'web_portal',
        locationName: 'Mumbai',
        deviceId: 'WEB',
        status: 'accepted',
      },
      {
        id: 'p_4',
        employeeId: 'emp_neha_007',
        employeeCode: 'TP0890',
        employeeName: 'Neha Singh',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
        timestampUtc: '2025-04-28T12:42:00Z',
        timeDisplay: '06:12 PM',
        eventType: 'OUT',
        source: 'biometric',
        locationName: 'Delhi',
        deviceId: 'BIO-02',
        status: 'accepted',
      },
      {
        id: 'p_5',
        employeeId: 'emp_rakesh_008',
        employeeCode: 'TP1123',
        employeeName: 'Rakesh Varma',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
        timestampUtc: '2025-04-28T12:38:00Z',
        timeDisplay: '06:08 PM',
        eventType: 'OUT',
        source: 'face_recognition',
        locationName: 'Hyderabad',
        deviceId: 'FR-01',
        status: 'accepted',
      },
    ];
  }

  getLiveAttendanceList(): AttendanceDayDTO[] {
    return [
      {
        id: 'att_1',
        employeeId: 'emp_srinivas_002',
        employeeCode: 'TP1012',
        employeeName: 'Srinivas Reddy',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
        department: 'Engineering',
        location: 'Hyderabad',
        jobTitle: 'Product Manager',
        attendanceDate: '2025-04-28',
        shiftName: 'General Shift',
        shiftCode: 'GS',
        shiftTiming: '09:00 AM - 06:00 PM',
        status: 'present',
        firstInTime: '08:58 AM',
        lastOutTime: '06:08 PM',
        workDuration: '1h 34m',
        breakDuration: '1h 00m',
        netHours: '7h 10m',
        regularHours: '8h 00m',
        overtimeHours: '10m',
        shortfallHours: '0m',
        isLate: false,
        lateByMinutes: 0,
        punches: [],
      },
      {
        id: 'att_2',
        employeeId: 'emp_priya_003',
        employeeCode: 'TP0456',
        employeeName: 'Priya Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
        department: 'Product',
        location: 'Bengaluru',
        jobTitle: 'Product Designer',
        attendanceDate: '2025-04-28',
        shiftName: 'General Shift',
        shiftCode: 'GS',
        shiftTiming: '09:00 AM - 06:00 PM',
        status: 'present',
        firstInTime: '08:47 AM',
        lastOutTime: '--',
        workDuration: '1h 45m',
        breakDuration: '0m',
        netHours: '1h 45m',
        regularHours: '8h 00m',
        overtimeHours: '0m',
        shortfallHours: '0m',
        isLate: false,
        lateByMinutes: 0,
        punches: [],
      },
      {
        id: 'att_3',
        employeeId: 'emp_amit_006',
        employeeCode: 'TP0783',
        employeeName: 'Amit Kumar',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
        department: 'Sales',
        location: 'Mumbai',
        jobTitle: 'Sales Lead',
        attendanceDate: '2025-04-28',
        shiftName: 'General Shift',
        shiftCode: 'GS',
        shiftTiming: '09:00 AM - 06:00 PM',
        status: 'late',
        firstInTime: '09:15 AM',
        lastOutTime: '--',
        workDuration: '1h 17m',
        breakDuration: '0m',
        netHours: '1h 17m',
        regularHours: '8h 00m',
        overtimeHours: '0m',
        shortfallHours: '0m',
        isLate: true,
        lateByMinutes: 15,
        punches: [],
      },
      {
        id: 'att_4',
        employeeId: 'emp_neha_007',
        employeeCode: 'TP0890',
        employeeName: 'Neha Singh',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
        department: 'HR',
        location: 'Delhi',
        jobTitle: 'HR Specialist',
        attendanceDate: '2025-04-28',
        shiftName: 'General Shift',
        shiftCode: 'GS',
        shiftTiming: '09:00 AM - 06:00 PM',
        status: 'absent',
        firstInTime: '--',
        lastOutTime: '--',
        workDuration: '0h 00m',
        breakDuration: '0m',
        netHours: '0h 00m',
        regularHours: '8h 00m',
        overtimeHours: '0m',
        shortfallHours: '8h 00m',
        isLate: false,
        lateByMinutes: 0,
        punches: [],
      },
      {
        id: 'att_5',
        employeeId: 'emp_rakesh_008',
        employeeCode: 'TP1123',
        employeeName: 'Rakesh Varma',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop',
        department: 'Engineering',
        location: 'Hyderabad',
        jobTitle: 'Backend Engineer',
        attendanceDate: '2025-04-28',
        shiftName: 'General Shift',
        shiftCode: 'GS',
        shiftTiming: '09:00 AM - 06:00 PM',
        status: 'present',
        firstInTime: '08:06 AM',
        lastOutTime: '05:32 PM',
        workDuration: '9h 26m',
        breakDuration: '1h 00m',
        netHours: '8h 26m',
        regularHours: '8h 00m',
        overtimeHours: '26m',
        shortfallHours: '0m',
        isLate: false,
        lateByMinutes: 0,
        punches: [],
      },
    ];
  }

  getDayDetail(id: string): AttendanceDayDTO {
    return {
      id: id || 'att_srinivas_001',
      employeeId: 'emp_srinivas_002',
      employeeCode: 'TP1012',
      employeeName: 'Srinivas Reddy',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
      department: 'Product',
      location: 'Hyderabad',
      jobTitle: 'Product Manager',
      attendanceDate: 'Mon, 28 Apr 2025',
      shiftName: 'General Shift',
      shiftCode: 'GS',
      shiftTiming: '09:00 AM - 06:00 PM',
      status: 'present',
      firstInTime: '08:58 AM',
      lastOutTime: '06:08 PM',
      workDuration: '8h 10m',
      breakDuration: '1h 00m',
      netHours: '7h 10m',
      regularHours: '8h 00m',
      overtimeHours: '10m',
      shortfallHours: '0m',
      isLate: false,
      lateByMinutes: 0,
      punches: [
        { time: '08:58 AM', event: 'Check In', source: 'Face Recognition Office Device', location: 'Hyderabad Main Office', status: 'On Time' },
        { time: '12:30 PM', event: 'Break Out', source: 'Web Portal Chrome (Windows)', location: 'Hyderabad Main Office', status: 'Lunch break' },
        { time: '01:30 PM', event: 'Break In', source: 'Web Portal Chrome (Windows)', location: 'Hyderabad Main Office', status: 'Back from break' },
        { time: '06:08 PM', event: 'Check Out', source: 'Face Recognition Office Device', location: 'Hyderabad Main Office', status: 'Work completed' },
      ],
      remarks: [
        { date: '28 Apr 2025 01:15 PM', author: 'Srinivas Reddy', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', text: 'Lunch break extended due to client meeting.', badge: 'Noted' },
        { date: '28 Apr 2025 06:20 PM', author: 'Srinivas Reddy', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop', text: 'Working from office today.', badge: 'Info' },
      ],
    };
  }

  getMyAttendance(employeeId: string, month: string = 'September', year: number = 2026): MyAttendanceMonthViewDTO {
    const daysCount = 30;
    const days: MyAttendanceDayRecordDTO[] = [];
    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let weeklyOffDays = 0;
    let totalWorkDurationHours = 0;
    let totalOvertimeHours = 0;

    for (let day = 1; day <= daysCount; day++) {
      const dateStr = `2026-09-${day < 10 ? '0' + day : day}`;
      const d = new Date(dateStr);
      const dayOfWeekNum = d.getDay(); // 0 = Sun, 6 = Sat
      const dayOfWeekName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeekNum];

      if (dayOfWeekNum === 0 || dayOfWeekNum === 6) {
        weeklyOffDays++;
        days.push({
          id: `att-my-${day}`,
          date: dateStr,
          dayOfWeek: dayOfWeekName,
          shiftCode: 'WO',
          shiftName: 'Weekly Off',
          shiftTiming: 'Off Day',
          grossDurationMinutes: 0,
          breakDurationMinutes: 0,
          netWorkDurationMinutes: 0,
          regularDurationMinutes: 0,
          overtimeMinutes: 0,
          status: 'weekly_off',
          isLate: false,
          lateByMinutes: 0,
          isEarlyOut: false,
          earlyOutByMinutes: 0,
          isRegularised: false,
          isSandwichPenalty: false,
          punches: []
        });
        continue;
      }

      if (day === 8) {
        // Leave
        leaveDays++;
        days.push({
          id: `att-my-${day}`,
          date: dateStr,
          dayOfWeek: dayOfWeekName,
          shiftCode: 'GS',
          shiftName: 'General Shift',
          shiftTiming: '09:00 AM - 06:00 PM',
          grossDurationMinutes: 0,
          breakDurationMinutes: 0,
          netWorkDurationMinutes: 0,
          regularDurationMinutes: 0,
          overtimeMinutes: 0,
          status: 'on_leave',
          isLate: false,
          lateByMinutes: 0,
          isEarlyOut: false,
          earlyOutByMinutes: 0,
          isRegularised: false,
          isSandwichPenalty: false,
          punches: []
        });
        continue;
      }

      if (day === 4) {
        // Late
        lateDays++;
        presentDays++;
        totalWorkDurationHours += 8.2;
        days.push({
          id: `att-my-${day}`,
          date: dateStr,
          dayOfWeek: dayOfWeekName,
          shiftCode: 'GS',
          shiftName: 'General Shift',
          shiftTiming: '09:00 AM - 06:00 PM',
          firstIn: '09:24 AM',
          lastOut: '06:35 PM',
          grossDurationMinutes: 551,
          breakDurationMinutes: 60,
          netWorkDurationMinutes: 491,
          regularDurationMinutes: 480,
          overtimeMinutes: 11,
          status: 'late',
          isLate: true,
          lateByMinutes: 24,
          isEarlyOut: false,
          earlyOutByMinutes: 0,
          isRegularised: false,
          isSandwichPenalty: false,
          punches: [
            { id: `pch-${day}-1`, time: '09:24 AM', type: 'IN', source: 'mobile_app', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
            { id: `pch-${day}-2`, time: '01:05 PM', type: 'BREAK_OUT', source: 'web_portal', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
            { id: `pch-${day}-3`, time: '02:05 PM', type: 'BREAK_IN', source: 'web_portal', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
            { id: `pch-${day}-4`, time: '06:35 PM', type: 'OUT', source: 'biometric', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          ]
        });
        continue;
      }

      // Normal Present Day
      presentDays++;
      totalWorkDurationHours += 8.5;
      totalOvertimeHours += 0.5;
      days.push({
        id: `att-my-${day}`,
        date: dateStr,
        dayOfWeek: dayOfWeekName,
        shiftCode: 'GS',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        firstIn: '08:55 AM',
        lastOut: '06:25 PM',
        grossDurationMinutes: 570,
        breakDurationMinutes: 60,
        netWorkDurationMinutes: 510,
        regularDurationMinutes: 480,
        overtimeMinutes: 30,
        status: 'present',
        isLate: false,
        lateByMinutes: 0,
        isEarlyOut: false,
        earlyOutByMinutes: 0,
        isRegularised: day === 11,
        isSandwichPenalty: false,
        punches: [
          { id: `pch-${day}-1`, time: '08:55 AM', type: 'IN', source: 'biometric', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          { id: `pch-${day}-2`, time: '01:00 PM', type: 'BREAK_OUT', source: 'biometric', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          { id: `pch-${day}-3`, time: '02:00 PM', type: 'BREAK_IN', source: 'biometric', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
          { id: `pch-${day}-4`, time: '06:25 PM', type: 'OUT', source: 'biometric', locationName: 'Bengaluru Tech Park HQ', isFlagged: false },
        ]
      });
    }

    const totalWorkingDays = 22;
    const attendancePercentage = Math.round((presentDays / totalWorkingDays) * 100);

    return {
      summary: {
        month,
        year,
        totalWorkingDays,
        presentDays,
        lateDays,
        halfDays,
        absentDays,
        leaveDays,
        holidayDays: 0,
        weeklyOffDays,
        totalWorkDurationHours: Math.round(totalWorkDurationHours * 10) / 10,
        totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
        totalShortfallHours: 0,
        attendancePercentage,
        regularisedDaysCount: 1
      },
      days
    };
  }

  getTeamAttendance(managerId: string, date: string = '2026-09-14', department?: string): TeamAttendanceSummaryDTO {
    const members: TeamAttendanceMemberDTO[] = [
      {
        employeeId: 'emp-001',
        employeeCode: 'EMP-1001',
        employeeName: 'Sarah Jenkins',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        department: 'Engineering',
        designation: 'Staff Frontend Architect',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        todayStatus: 'present',
        firstIn: '08:55 AM',
        lastOut: '--',
        netWorkDurationMinutes: 480,
        isLate: false,
        lateByMinutes: 0,
        pendingRequestsCount: 0,
        locationName: 'Bengaluru Tech Park HQ',
        lastPunchChannel: 'biometric'
      },
      {
        employeeId: 'emp-002',
        employeeCode: 'EMP-1002',
        employeeName: 'Michael Chang',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: 'Product Design',
        designation: 'Principal UI/UX Lead',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        todayStatus: 'present',
        firstIn: '09:14 AM',
        lastOut: '--',
        netWorkDurationMinutes: 460,
        isLate: false,
        lateByMinutes: 0,
        pendingRequestsCount: 1,
        locationName: 'Bengaluru Tech Park HQ',
        lastPunchChannel: 'mobile_app'
      },
      {
        employeeId: 'emp-003',
        employeeCode: 'EMP-1003',
        employeeName: 'Priya Sharma',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        department: 'Operations',
        designation: 'Operations Specialist',
        shiftName: 'Morning Shift',
        shiftTiming: '07:00 AM - 03:30 PM',
        todayStatus: 'late',
        firstIn: '07:35 AM',
        lastOut: '03:40 PM',
        netWorkDurationMinutes: 485,
        isLate: true,
        lateByMinutes: 35,
        pendingRequestsCount: 1,
        locationName: 'Bengaluru Tech Park HQ',
        lastPunchChannel: 'geofence'
      },
      {
        employeeId: 'emp-004',
        employeeCode: 'EMP-1004',
        employeeName: 'David Rodriguez',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        department: 'Customer Success',
        designation: 'Enterprise CS Manager',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        todayStatus: 'present',
        firstIn: '08:45 AM',
        lastOut: '--',
        netWorkDurationMinutes: 490,
        isLate: false,
        lateByMinutes: 0,
        pendingRequestsCount: 0,
        locationName: 'Bengaluru Tech Park HQ',
        lastPunchChannel: 'web_portal'
      },
      {
        employeeId: 'emp-005',
        employeeCode: 'EMP-1005',
        employeeName: 'Elena Rostova',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: 'Marketing',
        designation: 'Growth Marketer',
        shiftName: 'General Shift',
        shiftTiming: '09:00 AM - 06:00 PM',
        todayStatus: 'on_leave',
        firstIn: '--',
        lastOut: '--',
        netWorkDurationMinutes: 0,
        isLate: false,
        lateByMinutes: 0,
        pendingRequestsCount: 0,
        locationName: 'Bengaluru Tech Park HQ',
      },
      {
        employeeId: 'emp-006',
        employeeCode: 'EMP-1006',
        employeeName: 'Vikram Malhotra',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        department: 'Engineering',
        designation: 'Senior Backend Engineer',
        shiftName: 'Night Shift',
        shiftTiming: '10:00 PM - 06:30 AM',
        todayStatus: 'missing_punch',
        firstIn: '10:02 PM',
        lastOut: '--',
        netWorkDurationMinutes: 508,
        isLate: false,
        lateByMinutes: 0,
        pendingRequestsCount: 1,
        locationName: 'Mumbai Financial Centre',
        lastPunchChannel: 'biometric'
      }
    ];

    let filtered = members;
    if (department && department !== 'all') {
      filtered = filtered.filter(m => m.department.toLowerCase() === department.toLowerCase());
    }

    const present = filtered.filter(m => m.todayStatus === 'present').length;
    const late = filtered.filter(m => m.todayStatus === 'late').length;
    const absent = filtered.filter(m => m.todayStatus === 'absent').length;
    const leave = filtered.filter(m => m.todayStatus === 'on_leave').length;
    const missing = filtered.filter(m => m.todayStatus === 'missing_punch').length;
    const pending = filtered.reduce((acc, m) => acc + m.pendingRequestsCount, 0);

    return {
      date,
      totalTeamSize: filtered.length,
      presentCount: present + late,
      absentCount: absent,
      lateCount: late,
      onLeaveCount: leave,
      missingPunchCount: missing,
      pendingRegularisationsCount: pending,
      teamCompliancePercentage: Math.round(((present + late) / (filtered.length || 1)) * 100),
      members: filtered
    };
  }
}

export const attendanceService = new AttendanceService();

