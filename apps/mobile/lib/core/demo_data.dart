import 'models.dart';

class DemoData {
  static const organizations = [
    Organization('ACME Global Industries', 'acme.infitimepro.com'),
    Organization('Northwind Logistics', 'northwind.infitimepro.com'),
    Organization('InfiTime Demo', 'demo.infitimepro.com'),
  ];

  static const currentUserName = 'Priya Nair';
  static const currentUserCode = 'EMP-00234';
  static const currentDepartment = 'HR Bangalore';
  static const demoDateLabel = 'Tue, 17 Sep 2024';
  static const demoLocation = 'Bangalore, India';

  static const _first = [
    'Priya', 'Aarav', 'Sneha', 'Rohan', 'Kavya', 'Vihan', 'Ananya', 'Naresh',
    'Meera', 'Aditya', 'Isha', 'Kabir', 'Diya', 'Arjun', 'Nisha', 'Rahul',
    'Pooja', 'Vikram', 'Tara', 'Dev', 'Anika', 'Harsh', 'Leela', 'Omar',
    'Sara', 'Nikhil', 'Aisha', 'Karthik', 'Riya', 'Farhan', 'Lakshmi', 'Imran',
    'Neha', 'Sanjay', 'Divya', 'Amit', 'Shreya', 'Varun', 'Pallavi', 'Yusuf',
    'Anjali', 'Deepak', 'Kiran', 'Simran', 'Mohit', 'Bhavna', 'Rakesh',
  ];

  static const _last = [
    'Nair', 'Sharma', 'Kulkarni', 'Mehta', 'Iyer', 'Patel', 'Das', 'Andukoori',
    'Reddy', 'Menon', 'Kapoor', 'Joshi', 'Bose', 'Gill', 'Chopra', 'Desai',
    'Banerjee', 'Khan', 'Pillai', 'Rao', 'Shah', 'Verma', 'Nambiar', 'Malhotra',
  ];

  static const _depts = ['HR', 'Engineering', 'Finance', 'Logistics', 'Operations', 'Sales'];
  static const _sites = ['Bangalore HQ', 'Chennai Plant', 'Hyderabad Office', 'Remote'];
  static const _shifts = ['General Shift', 'Morning Shift', 'Evening Shift', 'Night Shift'];

  static List<TeamMember> orgMembers() => _members(present: 28, late: 5, wfh: 4, absent: 6, onLeave: 3, missing: 1);

  static List<TeamMember> teamMembers() {
    return _members(present: 18, late: 3, wfh: 2, absent: 5, onLeave: 4, missing: 0)
        .map((m) => TeamMember(
              id: m.id,
              name: m.name,
              code: m.code,
              department: m.department,
              location: m.location,
              shift: m.shift,
              status: m.status,
              checkIn: m.checkIn,
              note: m.note,
              delay: m.delay,
              onMyTeam: true,
            ))
        .toList();
  }

  static List<TeamMember> _members({
    required int present,
    required int late,
    required int wfh,
    required int absent,
    required int onLeave,
    required int missing,
  }) {
    final plan = <AttendanceStatus>[
      ...List.filled(present, AttendanceStatus.present),
      ...List.filled(late, AttendanceStatus.late),
      ...List.filled(wfh, AttendanceStatus.wfh),
      ...List.filled(absent, AttendanceStatus.absent),
      ...List.filled(onLeave, AttendanceStatus.onLeave),
      ...List.filled(missing, AttendanceStatus.missingPunch),
    ];

    const seeded = [
      ('Priya Nair', 'EMP-00234', 'HR', 'Bangalore HQ', 'General Shift'),
      ('Aarav Sharma', 'EMP-01082', 'Engineering', 'Bangalore HQ', 'General Shift'),
      ('Sneha Kulkarni', 'EMP-01440', 'Logistics', 'Remote', 'Flexi Shift'),
      ('Rohan Mehta', 'EMP-00917', 'Engineering', 'Bangalore HQ', 'General Shift'),
      ('Kavya Iyer', 'EMP-01103', 'Finance', 'Hyderabad Office', 'General Shift'),
      ('Vihan Patel', 'EMP-01822', 'Operations', 'Chennai Plant', 'Morning Shift'),
      ('Ananya Das', 'EMP-00771', 'Sales', 'Hyderabad Office', 'General Shift'),
      ('Naresh Andukoori', 'EMP-00419', 'HR', 'Bangalore HQ', 'General Shift'),
    ];

    return List.generate(plan.length, (i) {
      final status = plan[i];
      final seededRow = i < seeded.length ? seeded[i] : null;
      final name = seededRow?.$1 ?? '${_first[i % _first.length]} ${_last[(i * 3) % _last.length]}';
      final code = seededRow?.$2 ?? 'EMP-${(20000 + i * 17).toString().padLeft(5, '0')}';
      final dept = seededRow?.$3 ?? _depts[i % _depts.length];
      final site = status == AttendanceStatus.wfh ? 'Remote' : (seededRow?.$4 ?? _sites[i % _sites.length]);
      final shift = seededRow?.$5 ?? _shifts[i % _shifts.length];
      return TeamMember(
        id: 'tm-$i',
        name: name,
        code: code,
        department: dept,
        location: site,
        shift: shift,
        status: status,
        checkIn: _checkIn(status, i),
        note: _note(status),
        delay: status == AttendanceStatus.late ? 'Late by ${20 + (i % 4) * 8} mins' : null,
      );
    });
  }

  static String? _checkIn(AttendanceStatus status, int i) {
    switch (status) {
      case AttendanceStatus.present:
        return '09:0${i % 6} AM';
      case AttendanceStatus.late:
        return '09:${28 + (i % 5)} AM';
      case AttendanceStatus.wfh:
        return '09:0${i % 4} AM';
      case AttendanceStatus.absent:
      case AttendanceStatus.onLeave:
      case AttendanceStatus.missingPunch:
        return null;
    }
  }

  static String? _note(AttendanceStatus status) {
    switch (status) {
      case AttendanceStatus.present:
        return 'At office';
      case AttendanceStatus.wfh:
        return 'Working from home';
      case AttendanceStatus.onLeave:
        return 'Annual Leave 12-13 Sep';
      case AttendanceStatus.missingPunch:
        return 'No check-in found';
      case AttendanceStatus.absent:
        return 'Not checked in';
      case AttendanceStatus.late:
        return 'Checked in after grace';
    }
  }

  static Map<int, DayAttendance> september() {
    final days = <int, DayAttendance>{};
    for (var day = 1; day <= 30; day++) {
      final date = DateTime(2024, 9, day);
      final weekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
      if (weekend) {
        days[day] = DayAttendance(day: day, kind: DayKind.weeklyOff);
        continue;
      }
      days[day] = DayAttendance(
        day: day,
        kind: DayKind.present,
        inTime: '09:05 AM',
        outTime: '06:12 PM',
        hours: '9h 07m',
      );
    }
    days[10] = const DayAttendance(
      day: 10,
      kind: DayKind.late,
      inTime: '09:25 AM',
      outTime: '06:10 PM',
      hours: '8h 15m',
      reason: 'Traffic delay due to heavy rain.',
    );
    days[23] = const DayAttendance(
      day: 23,
      kind: DayKind.late,
      inTime: '09:22 AM',
      outTime: '06:05 PM',
      hours: '8h 13m',
      reason: 'Client call ran past the grace window.',
    );
    days[4] = const DayAttendance(day: 4, kind: DayKind.wfh, inTime: '09:02 AM', outTime: '06:01 PM', hours: '8h 59m');
    days[18] = const DayAttendance(day: 18, kind: DayKind.wfh, inTime: '08:58 AM', outTime: '06:04 PM', hours: '9h 06m');
    days[19] = const DayAttendance(day: 19, kind: DayKind.leave, reason: 'Annual leave');
    days[6] = const DayAttendance(
      day: 6,
      kind: DayKind.halfDay,
      inTime: '09:04 AM',
      outTime: '01:10 PM',
      hours: '4h 06m',
      reason: 'Approved half-day leave in the afternoon.',
    );
    days[27] = const DayAttendance(day: 27, kind: DayKind.holiday, reason: 'Company holiday');
    return days;
  }

  static List<PunchEvent> punchesFor(DayAttendance day) {
    switch (day.kind) {
      case DayKind.present:
      case DayKind.halfDay:
        return [
          PunchEvent(timeLabel: day.inTime ?? '09:05 AM', type: 'Check-in', source: 'Biometric', place: 'Main Office', validity: 'Valid'),
          const PunchEvent(timeLabel: '01:00 PM', type: 'Break Out', source: 'Biometric', place: 'Main Office', validity: 'Valid'),
          const PunchEvent(timeLabel: '02:00 PM', type: 'Break In', source: 'Mobile App', place: 'iPhone 15', validity: 'Valid'),
          if (day.kind != DayKind.halfDay)
            PunchEvent(timeLabel: day.outTime ?? '06:12 PM', type: 'Check-out', source: 'Biometric', place: 'Main Office', validity: 'Valid'),
        ];
      case DayKind.late:
        return [
          PunchEvent(timeLabel: day.inTime ?? '09:25 AM', type: 'Check-in', source: 'Biometric', place: 'Main Office', validity: 'Valid', flagged: true),
          PunchEvent(timeLabel: day.outTime ?? '06:10 PM', type: 'Check-out', source: 'Biometric', place: 'Main Office', validity: 'Valid'),
        ];
      case DayKind.wfh:
        return [
          PunchEvent(timeLabel: day.inTime ?? '09:02 AM', type: 'Check-in', source: 'Mobile App', place: 'Remote', validity: 'Valid'),
          PunchEvent(timeLabel: day.outTime ?? '06:01 PM', type: 'Check-out', source: 'Mobile App', place: 'Remote', validity: 'Valid'),
        ];
      case DayKind.missing:
        return [
          const PunchEvent(timeLabel: '06:12 PM', type: 'Check-out', source: 'Biometric', place: 'Main Office', validity: 'Needs review', flagged: true),
        ];
      case DayKind.leave:
      case DayKind.holiday:
      case DayKind.weeklyOff:
      case DayKind.absent:
        return const [];
    }
  }

  static List<RegularisationRequest> requests() {
    const types = [
      'Missing Punch',
      'Late Coming',
      'Short Working Hours',
      'Shift Change',
      'Work From Home',
      'Attendance Correction',
    ];
    const quota = {'Draft': 12, 'Pending': 8, 'Approved': 24, 'Rejected': 4, 'Sent Back': 3};
    final items = <RegularisationRequest>[];
    var n = 1;
    quota.forEach((status, count) {
      for (var i = 0; i < count; i++) {
        final type = types[(n + i) % types.length];
        final day = 1 + ((n * 3 + i) % 26);
        items.add(RegularisationRequest(
          id: 'REG-${(8000 + n).toString()}',
          type: type,
          dateLabel: '$day Sep 2024',
          issue: _issueFor(type),
          actualTime: '09:05 AM',
          correctedTime: type == 'Missing Punch' ? '09:00 AM' : '09:05 AM',
          location: i.isEven ? 'Bangalore HQ' : 'Client Site',
          reason: _reasonFor(type),
          status: status,
          createdLabel: '$day Sep 2024',
        ));
        n++;
      }
    });
    items[12] = RegularisationRequest(
      id: items[12].id,
      type: 'Missing Punch',
      dateLabel: '12 Sep 2024',
      issue: 'I forgot to punch in at the start of my shift.',
      actualTime: 'Not recorded',
      correctedTime: '09:05 AM',
      location: 'Bangalore HQ',
      reason: 'I forgot to punch in at the start of my shift. I was at my desk by 09:05 AM.',
      status: 'Pending',
      createdLabel: '12 Sep 2024',
      attachment: 'desk-pass.pdf',
    );
    return items;
  }

  static String _issueFor(String type) {
    switch (type) {
      case 'Missing Punch':
        return 'Missing check-in';
      case 'Late Coming':
        return 'Arrived after grace';
      case 'Short Working Hours':
        return 'Worked less than the shift';
      case 'Shift Change':
        return 'Worked a different shift';
      case 'Work From Home':
        return 'Marked on site, worked remotely';
      default:
        return 'Attendance record needs a correction';
    }
  }

  static String _reasonFor(String type) => 'Requesting a correction for $type on the recorded day.';

  static List<ApprovalItem> approvals() {
    return [
      ApprovalItem(
        id: 'REG-8092',
        kind: 'Regularisation',
        employee: 'Priya Nair',
        employeeCode: 'EMP-00234',
        department: 'HR Bangalore',
        dateLabel: '12 Sep 2024',
        summary: 'Missed punch. Add check-in at 09:05 AM.',
        priority: 'High',
        status: 'Pending',
        submittedAt: '12 Sep 2024, 06:40 PM',
        original: {'Check-in': 'Not recorded', 'Check-out': '06:12 PM', 'Status': 'Missing Punch'},
        requested: {'Check-in': '09:05 AM', 'Check-out': '06:12 PM', 'Status': 'Present'},
      ),
      ApprovalItem(
        id: 'REG-8104',
        kind: 'Regularisation',
        employee: 'Aarav Sharma',
        employeeCode: 'EMP-01082',
        department: 'Engineering',
        dateLabel: '16 Sep 2024',
        summary: 'Late arrival. Move check-in from 09:28 AM to 09:10 AM.',
        priority: 'Medium',
        status: 'Pending',
        submittedAt: '16 Sep 2024, 07:12 PM',
        original: {'Check-in': '09:28 AM', 'Status': 'Late'},
        requested: {'Check-in': '09:10 AM', 'Status': 'Present'},
      ),
      ApprovalItem(
        id: 'OT-4102',
        kind: 'Overtime',
        employee: 'Rohan Mehta',
        employeeCode: 'EMP-00917',
        department: 'Engineering',
        dateLabel: '12 Sep 2024',
        summary: 'Claimed 3h 10m overtime for a production deployment.',
        priority: 'Normal',
        status: 'Pending',
        submittedAt: '12 Sep 2024, 08:05 PM',
        original: {'Calculated OT': '1h 07m', 'Eligible OT': '1h 00m'},
        requested: {'Claimed OT': '3h 10m', 'Multiplier': '1.5x'},
      ),
      ApprovalItem(
        id: 'SWP-201',
        kind: 'Shift Swap',
        employee: 'Sneha Kulkarni',
        employeeCode: 'EMP-01440',
        department: 'Logistics',
        dateLabel: '18 Sep 2024',
        summary: 'Morning shift swapped with Kavya Iyer for the night shift.',
        priority: 'Normal',
        status: 'Pending',
        submittedAt: '15 Sep 2024, 11:20 AM',
        original: {'Sneha': 'Morning Shift', 'Kavya': 'Night Shift'},
        requested: {'Sneha': 'Night Shift', 'Kavya': 'Morning Shift'},
      ),
      ApprovalItem(
        id: 'REG-8066',
        kind: 'Regularisation',
        employee: 'Vihan Patel',
        employeeCode: 'EMP-01822',
        department: 'Operations',
        dateLabel: '11 Sep 2024',
        summary: 'Missing punch at Chennai Plant.',
        priority: 'High',
        status: 'Pending',
        submittedAt: '11 Sep 2024, 07:48 PM',
        original: {'Check-in': 'Not recorded', 'Site': 'Chennai Plant'},
        requested: {'Check-in': '06:04 AM', 'Site': 'Chennai Plant'},
      ),
    ];
  }

  static List<ApprovalItem> approvalHistory() {
    const rows = [
      ('REG-7901', 'Regularisation', 'Meera Reddy', 'Approved', '4h'),
      ('OT-3988', 'Overtime', 'Arjun Gill', 'Rejected', '1d 2h'),
      ('SWP-188', 'Shift Swap', 'Diya Bose', 'Approved', '6h'),
      ('REG-7880', 'Regularisation', 'Kabir Joshi', 'Sent Back', '3h'),
      ('OT-3970', 'Overtime', 'Tara Rao', 'Approved', '9h'),
      ('REG-7864', 'Regularisation', 'Dev Shah', 'Approved', '5h'),
      ('SWP-176', 'Shift Swap', 'Isha Kapoor', 'Rejected', '2d'),
      ('REG-7842', 'Regularisation', 'Aditya Menon', 'Approved', '7h'),
    ];
    return [
      for (final row in rows)
        ApprovalItem(
          id: row.$1,
          kind: row.$2,
          employee: row.$3,
          employeeCode: 'EMP-00000',
          department: 'Operations',
          dateLabel: 'Sep 2024',
          summary: '${row.$2} closed as ${row.$4}.',
          priority: 'Normal',
          status: row.$4,
          submittedAt: 'Sep 2024',
          turnaround: row.$5,
          original: const {'Record': 'Original'},
          requested: const {'Record': 'Requested'},
        ),
    ];
  }

  static List<ShiftTemplate> shifts() {
    return [
      ShiftTemplate(id: 'GS', name: 'General Shift', code: 'GS', start: '09:00 AM', end: '06:00 PM', breakLabel: '01h 00m', graceLate: '15 mins', graceEarly: '15 mins', duration: '8h 00m'),
      ShiftTemplate(id: 'MS', name: 'Morning Shift', code: 'MS', start: '06:00 AM', end: '02:00 PM', breakLabel: '00h 30m', graceLate: '10 mins', graceEarly: '10 mins', duration: '7h 30m'),
      ShiftTemplate(id: 'ES', name: 'Evening Shift', code: 'ES', start: '02:00 PM', end: '10:00 PM', breakLabel: '00h 30m', graceLate: '10 mins', graceEarly: '10 mins', duration: '7h 30m'),
      ShiftTemplate(id: 'NS', name: 'Night Shift', code: 'NS', start: '10:00 PM', end: '06:00 AM', breakLabel: '00h 45m', graceLate: '15 mins', graceEarly: '15 mins', duration: '7h 15m'),
      ShiftTemplate(id: 'FX', name: 'Flexi Shift', code: 'FX', start: '08:00 AM', end: '05:00 PM', breakLabel: '01h 00m', graceLate: '30 mins', graceEarly: '15 mins', duration: '8h 00m'),
      ShiftTemplate(id: 'US', name: 'US Shift', code: 'US', start: '06:30 PM', end: '03:30 AM', breakLabel: '01h 00m', graceLate: '15 mins', graceEarly: '15 mins', duration: '8h 00m'),
    ];
  }

  static List<ShiftGroup> groups() {
    return const [
      ShiftGroup(name: 'Bangalore General', employees: 42, pattern: 'Fixed', summary: 'One shift, Monday to Friday.', shifts: ['General Shift']),
      ShiftGroup(name: 'Plant Rotation A', employees: 28, pattern: 'Rotational', summary: 'Morning, evening, and night on a 3-week cycle.', shifts: ['Morning Shift', 'Evening Shift', 'Night Shift']),
      ShiftGroup(name: 'US Coverage', employees: 11, pattern: 'Fixed', summary: 'Evening overlap with the US business day.', shifts: ['US Shift']),
      ShiftGroup(name: 'Flex Desk', employees: 16, pattern: 'Fixed', summary: 'Core hours with a flexible start.', shifts: ['Flexi Shift']),
    ];
  }

  static List<SwapRequest> swaps() {
    return [
      SwapRequest(id: 'SWP-201', fromName: 'Sneha Kulkarni', toName: 'Kavya Iyer', fromShift: 'Morning Shift', toShift: 'Night Shift', dateLabel: '18 Sep 2024', status: 'Pending', reason: 'Family commitment in the morning.'),
      SwapRequest(id: 'SWP-198', fromName: 'Rohan Mehta', toName: 'Aarav Sharma', fromShift: 'General Shift', toShift: 'Evening Shift', dateLabel: '19 Sep 2024', status: 'Pending', reason: 'Needs the evening window for a release.'),
      SwapRequest(id: 'SWP-190', fromName: 'Vihan Patel', toName: 'Naresh Andukoori', fromShift: 'Morning Shift', toShift: 'General Shift', dateLabel: '09 Sep 2024', status: 'Approved', reason: 'Approved by the plant supervisor.'),
    ];
  }

  static List<SiteOffice> sites() {
    return const [
      SiteOffice(name: 'Bengaluru HQ', kind: 'Head Office', present: 52, absent: 12, health: 'On Track', pinX: 0.42, pinY: 0.62),
      SiteOffice(name: 'Chennai Plant', kind: 'Plant / Facility', present: 21, absent: 7, health: 'Some Delays', pinX: 0.48, pinY: 0.78),
      SiteOffice(name: 'Hyderabad Office', kind: 'Branch Office', present: 12, absent: 4, health: 'On Track', pinX: 0.46, pinY: 0.58),
      SiteOffice(name: 'Remote Workforce', kind: 'Remote / Other', present: 2, absent: 2, health: 'Attention', pinX: 0.62, pinY: 0.36),
    ];
  }

  static List<AttendanceException> exceptions() {
    return [
      AttendanceException(id: 'EX-1', employee: 'Priya Nair', code: 'EMP-00234', type: 'Missing Punch', priority: 'High', detail: 'No check-in on 12 Sep.'),
      AttendanceException(id: 'EX-2', employee: 'Aarav Sharma', code: 'EMP-01082', type: 'Late Arrival', priority: 'Medium', detail: '28 minutes past grace.'),
      AttendanceException(id: 'EX-3', employee: 'Sneha Kulkarni', code: 'EMP-01440', type: 'Early Departure', priority: 'High', detail: 'Left 46 minutes early.'),
      AttendanceException(id: 'EX-4', employee: 'Rohan Mehta', code: 'EMP-00917', type: 'Short Hours', priority: 'Medium', detail: 'Worked 6h 12m of 8h.'),
      AttendanceException(id: 'EX-5', employee: 'Ananya Das', code: 'EMP-00771', type: 'Unscheduled Attendance', priority: 'Low', detail: 'Punch on a weekly off.'),
      AttendanceException(id: 'EX-6', employee: 'Vihan Patel', code: 'EMP-01822', type: 'Missing Punch', priority: 'High', detail: 'No check-in at Chennai Plant.'),
      AttendanceException(id: 'EX-7', employee: 'Naresh Andukoori', code: 'EMP-00419', type: 'Late Arrival', priority: 'Low', detail: '4 minutes past grace.'),
      AttendanceException(id: 'EX-8', employee: 'Kavya Iyer', code: 'EMP-01103', type: 'Short Hours', priority: 'Medium', detail: 'Break ran 25 minutes long.'),
    ];
  }

  static List<AppNotification> notifications() {
    return [
      AppNotification(title: 'Regularisation pending', body: 'Naresh Andukoori still needs to review REG-8092.', timeLabel: '2h ago'),
      AppNotification(title: 'Team exception', body: '3 teammates need attention today.', timeLabel: 'Today'),
      AppNotification(title: 'Shift published', body: 'Bangalore General schedule is available for this week.', timeLabel: 'Yesterday'),
    ];
  }

  static const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  static const locationExceptions = [
    ('Rohan Mehta', 'Geofence breach', 'Checked in from an unapproved location.'),
    ('Sneha Kulkarni', 'No location found', 'The punch did not include a site.'),
  ];
}

String dayKindLabel(DayKind kind) {
  switch (kind) {
    case DayKind.present:
      return 'Present';
    case DayKind.late:
      return 'Late';
    case DayKind.leave:
      return 'Leave';
    case DayKind.wfh:
      return 'WFH';
    case DayKind.holiday:
      return 'Holiday';
    case DayKind.weeklyOff:
      return 'Weekly Off';
    case DayKind.halfDay:
      return 'Half Day';
    case DayKind.absent:
      return 'Absent';
    case DayKind.missing:
      return 'Missing Punch';
  }
}

String statusLabel(AttendanceStatus status) {
  switch (status) {
    case AttendanceStatus.present:
      return 'Present';
    case AttendanceStatus.late:
      return 'Late';
    case AttendanceStatus.absent:
      return 'Absent';
    case AttendanceStatus.wfh:
      return 'WFH';
    case AttendanceStatus.onLeave:
      return 'On Leave';
    case AttendanceStatus.missingPunch:
      return 'Missing Punch';
  }
}
