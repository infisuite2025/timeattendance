import 'geofence.dart';
import 'models.dart';

class MappedWorkspace {
  MappedWorkspace({
    this.days = const {},
    this.loadedMonth,
    this.team = const [],
    this.org = const [],
    this.requests = const [],
    this.approvals = const [],
    this.history = const [],
    this.exceptions = const [],
    this.shifts = const [],
    this.groups = const [],
    this.swaps = const [],
    this.checkedIn,
    this.clockInLabel,
    this.clockOutLabel,
    this.presentDays = 0,
    this.absentDays = 0,
    this.lateDays = 0,
    this.leaveDays = 0,
    this.attendancePercentage = 0,
    this.workedMinutes = 0,
    this.assignedShift = '',
  });

  final Map<int, DayAttendance> days;
  final DateTime? loadedMonth;
  final List<TeamMember> team;
  final List<TeamMember> org;
  final List<RegularisationRequest> requests;
  final List<ApprovalItem> approvals;
  final List<ApprovalItem> history;
  final List<AttendanceException> exceptions;
  final List<ShiftTemplate> shifts;
  final List<ShiftGroup> groups;
  final List<SwapRequest> swaps;
  final bool? checkedIn;
  final String? clockInLabel;
  final String? clockOutLabel;
  final int presentDays;
  final int absentDays;
  final int lateDays;
  final int leaveDays;
  final int attendancePercentage;
  final int workedMinutes;
  final String assignedShift;
}

MappedWorkspace mapMyAttendance(dynamic data) {
  if (data is! Map) return MappedWorkspace();
  final rawDays = data['days'];
  if (rawDays is! List) return MappedWorkspace();
  final days = <int, DayAttendance>{};
  DateTime? month;
  bool? checkedIn;
  String? clockIn;
  String? clockOut;
  var workedMinutes = 0;
  var assignedShift = '';
  final today = _dateKey(DateTime.now());

  for (final item in rawDays) {
    if (item is! Map) continue;
    final date = item['date']?.toString() ?? '';
    final parsed = DateTime.tryParse(date);
    if (parsed == null) continue;
    month ??= DateTime(parsed.year, parsed.month, 1);
    final kind = _dayKind(item['status']?.toString() ?? '', item['isLate'] == true);
    final minutes = item['netWorkDurationMinutes'] is num ? (item['netWorkDurationMinutes'] as num).toInt() : 0;
    final record = DayAttendance(
      day: parsed.day,
      kind: kind,
      inTime: item['firstIn']?.toString(),
      outTime: item['lastOut']?.toString(),
      hours: _hours(item['netWorkDurationMinutes']),
      shift: '${item['shiftName'] ?? 'Shift'} ${item['shiftTiming'] ?? ''}'.trim(),
      displayDate: _pretty(parsed),
      minutes: minutes,
    );
    days[parsed.day] = record;
    if (date == today) {
      checkedIn = kind == DayKind.present || kind == DayKind.late || kind == DayKind.wfh || kind == DayKind.halfDay;
      clockIn = record.inTime;
      clockOut = record.outTime;
      workedMinutes = minutes;
      assignedShift = record.shift;
      if (clockOut != null && clockOut != '--' && clockOut.isNotEmpty) checkedIn = false;
    }
  }
  final summary = data['summary'];
  int countOf(String key) => summary is Map && summary[key] is num ? (summary[key] as num).toInt() : 0;
  return MappedWorkspace(
    days: days,
    loadedMonth: month,
    checkedIn: checkedIn,
    clockInLabel: clockIn,
    clockOutLabel: clockOut,
    presentDays: countOf('presentDays'),
    absentDays: countOf('absentDays'),
    lateDays: countOf('lateDays'),
    leaveDays: countOf('leaveDays'),
    attendancePercentage: countOf('attendancePercentage'),
    workedMinutes: workedMinutes,
    assignedShift: assignedShift,
  );
}

List<TeamMember> mapLive(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        TeamMember(
          id: item['employeeId']?.toString() ?? item['id']?.toString() ?? '',
          name: item['employeeName']?.toString() ?? 'Employee',
          code: item['employeeCode']?.toString() ?? '',
          department: item['department']?.toString() ?? '',
          location: item['location']?.toString() ?? '',
          shift: item['shiftName']?.toString() ?? '',
          status: _attendanceStatus(item['status']?.toString() ?? '', item['isLate'] == true),
          checkIn: item['firstInTime']?.toString(),
          note: item['location']?.toString(),
          delay: (item['lateByMinutes'] is num && (item['lateByMinutes'] as num) > 0) ? 'Late by ${item['lateByMinutes']} mins' : null,
        ),
  ];
}

List<TeamMember> mapTeam(dynamic data) {
  final members = data is Map ? data['members'] : data;
  if (members is! List) return const [];
  return [
    for (final item in members)
      if (item is Map)
        TeamMember(
          id: item['employeeId']?.toString() ?? '',
          name: item['employeeName']?.toString() ?? 'Employee',
          code: item['employeeCode']?.toString() ?? '',
          department: item['department']?.toString() ?? '',
          location: item['locationName']?.toString() ?? '',
          shift: item['shiftName']?.toString() ?? '',
          status: _attendanceStatus(item['todayStatus']?.toString() ?? '', item['isLate'] == true),
          checkIn: item['firstIn']?.toString(),
          delay: (item['lateByMinutes'] is num && (item['lateByMinutes'] as num) > 0) ? 'Late by ${item['lateByMinutes']} mins' : null,
          onMyTeam: true,
        ),
  ];
}

List<RegularisationRequest> mapRegularisations(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        RegularisationRequest(
          id: item['id']?.toString() ?? '',
          type: _regType(item['requestType']?.toString() ?? ''),
          dateLabel: item['attendanceDate']?.toString() ?? '',
          issue: item['reasonCategory']?.toString() ?? '',
          actualTime: item['originalIn']?.toString() ?? 'Not recorded',
          correctedTime: item['requestedIn']?.toString() ?? item['requestedOut']?.toString() ?? '',
          location: item['department']?.toString() ?? '',
          reason: item['reasonText']?.toString() ?? '',
          status: _statusLabel(item['status']?.toString() ?? 'pending'),
          createdLabel: item['submittedAt']?.toString() ?? '',
          attachment: item['attachmentUrl']?.toString(),
          employeeName: item['employeeName']?.toString() ?? '',
          employeeCode: item['employeeCode']?.toString() ?? '',
          department: item['department']?.toString() ?? '',
        ),
  ];
}

List<ApprovalItem> mapApprovals(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map) _approval(item),
  ];
}

List<ApprovalItem> mapHistory(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        ApprovalItem(
          id: item['requestCode']?.toString() ?? item['id']?.toString() ?? '',
          kind: _kind(item['category']?.toString() ?? ''),
          employee: item['employeeName']?.toString() ?? '',
          employeeCode: item['employeeCode']?.toString() ?? '',
          department: item['approverRole']?.toString() ?? '',
          dateLabel: item['decisionTimestamp']?.toString() ?? '',
          summary: item['comments']?.toString() ?? '',
          priority: 'Normal',
          status: _statusLabel(item['decision']?.toString() ?? ''),
          submittedAt: item['decisionTimestamp']?.toString() ?? '',
          turnaround: item['approverName']?.toString() ?? '',
          original: const {'Record': 'Original'},
          requested: {'Decision': item['decision']?.toString() ?? ''},
        ),
  ];
}

List<AttendanceException> mapExceptions(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        AttendanceException(
          id: item['id']?.toString() ?? '',
          employee: item['employeeName']?.toString() ?? '',
          code: item['employeeCode']?.toString() ?? '',
          type: _exceptionType(item['exceptionType']?.toString() ?? ''),
          priority: _severity(item['severity']?.toString() ?? ''),
          detail: item['description']?.toString() ?? '',
          reviewed: item['status']?.toString() == 'resolved' || item['status']?.toString() == 'waived',
        ),
  ];
}

List<ShiftTemplate> mapShifts(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        ShiftTemplate(
          id: item['id']?.toString() ?? '',
          name: item['name']?.toString() ?? 'Shift',
          code: item['code']?.toString() ?? '',
          start: item['startTime']?.toString() ?? '',
          end: item['endTime']?.toString() ?? '',
          breakLabel: item['breakDuration']?.toString() ?? '',
          graceLate: '${item['graceInMinutes'] ?? ''} mins',
          graceEarly: '${item['graceOutMinutes'] ?? ''} mins',
          duration: item['duration']?.toString() ?? '',
        ),
  ];
}

List<ShiftGroup> mapGroups(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        ShiftGroup(
          name: item['name']?.toString() ?? 'Group',
          employees: item['employeeCount'] is num ? (item['employeeCount'] as num).toInt() : 0,
          pattern: item['patternType']?.toString() ?? 'Fixed',
          summary: item['description']?.toString() ?? '',
          shifts: item['includedShifts'] is List ? [for (final shift in item['includedShifts'] as List) shift.toString()] : const [],
        ),
  ];
}

List<SiteOffice> mapLocations(dynamic data) {
  if (data is! List) return const [];
  final sites = <SiteOffice>[];
  for (var i = 0; i < data.length; i++) {
    final item = data[i];
    if (item is! Map) continue;
    final status = item['status']?.toString() ?? '';
    final count = item['employeeCount'] is num ? (item['employeeCount'] as num).toInt() : 0;
    sites.add(SiteOffice(
      name: item['name']?.toString() ?? 'Site',
      kind: item['city']?.toString() ?? item['code']?.toString() ?? '',
      present: count,
      absent: 0,
      health: status == 'operational' ? 'On Track' : 'Needs attention',
      pinX: 0.22 + (i % 3) * 0.28,
      pinY: 0.28 + (i ~/ 3) * 0.28,
    ));
  }
  return sites;
}

List<PunchFence> mapFences(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map && item['latitude'] is num && item['longitude'] is num)
        PunchFence(
          name: item['name']?.toString() ?? item['locationName']?.toString() ?? 'Site',
          latitude: (item['latitude'] as num).toDouble(),
          longitude: (item['longitude'] as num).toDouble(),
          radiusMeters: item['geofenceRadiusMeters'] is num
              ? (item['geofenceRadiusMeters'] as num).toDouble()
              : item['radiusMeters'] is num
                  ? (item['radiusMeters'] as num).toDouble()
                  : 150,
        ),
  ];
}

List<PunchEvent> mapPunches(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        PunchEvent(
          timeLabel: item['timeDisplay']?.toString() ?? '',
          type: _eventType(item['eventType']?.toString() ?? ''),
          source: _sourceLabel(item['source']?.toString() ?? ''),
          place: item['locationName']?.toString() ?? '',
          validity: item['status']?.toString() == 'flagged' ? 'Flagged' : 'Valid',
          flagged: item['status']?.toString() == 'flagged',
        ),
  ];
}

List<RosterPerson> mapSchedule(dynamic data) {
  final rows = data is Map ? data['schedule'] : null;
  if (rows is! List) return const [];
  return [
    for (final item in rows)
      if (item is Map)
        RosterPerson(
          name: item['employeeName']?.toString() ?? 'Employee',
          days: [
            if (item['shifts'] is List)
              for (final cell in item['shifts'] as List)
                if (cell is Map && cell['isOff'] != true)
                  RosterCell(
                    dayName: cell['dayName']?.toString() ?? '',
                    code: cell['shiftCode']?.toString() ?? '—',
                    shiftName: cell['shiftName']?.toString() ?? cell['shiftCode']?.toString() ?? '',
                  ),
          ],
        ),
  ];
}

String scheduleWeek(dynamic data) {
  if (data is! Map) return '';
  return data['weekRange']?.toString() ?? '';
}

List<SwapRequest> mapSwaps(dynamic data) {
  if (data is! List) return const [];
  return [
    for (final item in data)
      if (item is Map)
        SwapRequest(
          id: item['id']?.toString() ?? '',
          fromName: item['requesterName']?.toString() ?? '',
          toName: item['swapWithName']?.toString() ?? '',
          fromShift: item['currentShift']?.toString() ?? '',
          toShift: item['requestedShift']?.toString() ?? '',
          dateLabel: item['date']?.toString() ?? '',
          status: _statusLabel(item['status']?.toString() ?? 'pending'),
          reason: item['reason']?.toString() ?? '',
        ),
  ];
}

String _eventType(String value) {
  switch (value.toUpperCase()) {
    case 'IN':
      return 'Check-in';
    case 'OUT':
      return 'Check-out';
    case 'BREAK_OUT':
      return 'Break out';
    case 'BREAK_IN':
      return 'Break in';
    default:
      return value.isEmpty ? 'Punch' : value;
  }
}

String _sourceLabel(String value) {
  switch (value) {
    case 'face_recognition':
      return 'Face recognition';
    case 'mobile_app':
      return 'Mobile App';
    case 'web_portal':
      return 'Web';
    case 'biometric':
      return 'Biometric';
    case 'geofence':
      return 'Geofence';
    default:
      return value.isEmpty ? 'Unknown' : value;
  }
}

String requestTypeForApi(String label) {
  switch (label) {
    case 'Work From Home':
      return 'wfh';
    case 'Missing Punch':
      return 'missing_punch';
    case 'Shift Change':
      return 'full_day_present';
    case 'Late Coming':
    case 'Short Working Hours':
    case 'Attendance Correction':
      return 'time_adjustment';
    default:
      return 'time_adjustment';
  }
}

String categoryForApi(String kind) {
  switch (kind) {
    case 'Overtime':
      return 'overtime';
    case 'Shift Swap':
      return 'shift_swap';
    default:
      return 'regularisation';
  }
}

String decisionForApi(String decision) {
  switch (decision) {
    case 'Approved':
      return 'approved';
    case 'Rejected':
      return 'rejected';
    default:
      return 'sent_back';
  }
}

ApprovalItem _approval(Map item) {
  return ApprovalItem(
    id: item['id']?.toString() ?? '',
    kind: _kind(item['category']?.toString() ?? ''),
    employee: item['employeeName']?.toString() ?? '',
    employeeCode: item['employeeCode']?.toString() ?? '',
    department: item['department']?.toString() ?? '',
    dateLabel: item['targetDate']?.toString() ?? '',
        summary: item['summaryDetails']?.toString() ?? item['title']?.toString() ?? '',
    priority: _priority(item['priority']?.toString() ?? 'medium'),
    status: _statusLabel(item['status']?.toString() ?? 'pending'),
    submittedAt: item['submittedAt']?.toString() ?? '',
    original: {'Original': item['originalValues']?.toString() ?? '—'},
    requested: {'Requested': item['requestedValues']?.toString() ?? '—'},
    comment: item['reasonText']?.toString() ?? '',
  );
}

DayKind _dayKind(String status, bool late) {
  if (late || status == 'late') return DayKind.late;
  switch (status) {
    case 'absent':
      return DayKind.absent;
    case 'on_leave':
      return DayKind.leave;
    case 'wfh':
      return DayKind.wfh;
    case 'holiday':
      return DayKind.holiday;
    case 'weekly_off':
      return DayKind.weeklyOff;
    case 'half_day':
      return DayKind.halfDay;
    case 'missing_punch':
      return DayKind.missing;
    default:
      return DayKind.present;
  }
}

AttendanceStatus _attendanceStatus(String status, bool late) {
  if (late || status == 'late' || status == 'early_departure') return AttendanceStatus.late;
  switch (status) {
    case 'absent':
      return AttendanceStatus.absent;
    case 'wfh':
    case 'field_duty':
      return AttendanceStatus.wfh;
    case 'on_leave':
      return AttendanceStatus.onLeave;
    case 'missing_punch':
      return AttendanceStatus.missingPunch;
    default:
      return AttendanceStatus.present;
  }
}

String _regType(String value) {
  switch (value) {
    case 'missed_punch':
      return 'Missing Punch';
    case 'wfh':
      return 'Work From Home';
    case 'half_day':
      return 'Short Working Hours';
    case 'full_day':
      return 'Shift Change';
    default:
      return 'Attendance Correction';
  }
}

String _exceptionType(String value) {
  switch (value) {
    case 'missing_in_punch':
    case 'missing_out_punch':
      return 'Missing Punch';
    case 'late_arrival':
      return 'Late Arrival';
    case 'early_departure':
      return 'Early Departure';
    case 'unscheduled_shift':
      return 'Unscheduled Attendance';
    case 'geofence_breach':
      return 'Outside Office';
    case 'missing_in':
    case 'missing_out':
      return 'Missing Punch';
    default:
      return 'Short Hours';
  }
}

String _severity(String value) {
  switch (value) {
    case 'critical':
    case 'high':
      return 'High';
    case 'info':
      return 'Low';
    default:
      return 'Medium';
  }
}

String _statusLabel(String value) {
  switch (value) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'sent_back':
      return 'Sent Back';
    case 'draft':
      return 'Draft';
    default:
      return value.isEmpty ? 'Pending' : '${value[0].toUpperCase()}${value.substring(1)}';
  }
}

String _kind(String category) {
  switch (category) {
    case 'overtime':
      return 'Overtime';
    case 'shift_swap':
      return 'Shift Swap';
    default:
      return 'Regularisation';
  }
}

String _priority(String value) {
  switch (value) {
    case 'high':
      return 'High';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
}

String? _hours(dynamic minutes) {
  if (minutes is! num) return null;
  final total = minutes.toInt();
  return '${total ~/ 60}h ${(total % 60).toString().padLeft(2, '0')}m';
}

String _dateKey(DateTime date) {
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}

String _pretty(DateTime date) {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${weekdays[date.weekday - 1]}, ${date.day} ${months[date.month - 1]} ${date.year}';
}
