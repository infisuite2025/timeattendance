enum AttendanceStatus { present, late, absent, wfh, onLeave, missingPunch }

enum DayKind { present, late, leave, wfh, holiday, weeklyOff, halfDay, absent, missing }

class Organization {
  const Organization(this.name, this.domain);
  final String name;
  final String domain;
  String get label => '$name ($domain)';
}

class TeamMember {
  const TeamMember({
    required this.id,
    required this.name,
    required this.code,
    required this.department,
    required this.location,
    required this.shift,
    required this.status,
    this.checkIn,
    this.note,
    this.delay,
    this.onMyTeam = false,
  });

  final String id;
  final String name;
  final String code;
  final String department;
  final String location;
  final String shift;
  final AttendanceStatus status;
  final String? checkIn;
  final String? note;
  final String? delay;
  final bool onMyTeam;

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }
}

class DayAttendance {
  const DayAttendance({
    required this.day,
    required this.kind,
    this.inTime,
    this.outTime,
    this.hours,
    this.reason,
    this.shift = 'General Shift 09:00 AM - 06:00 PM',
    this.displayDate,
  });

  final int day;
  final DayKind kind;
  final String? inTime;
  final String? outTime;
  final String? hours;
  final String? reason;
  final String shift;
  final String? displayDate;
}

class PunchEvent {
  const PunchEvent({
    required this.timeLabel,
    required this.type,
    required this.source,
    required this.place,
    required this.validity,
    this.flagged = false,
  });

  final String timeLabel;
  final String type;
  final String source;
  final String place;
  final String validity;
  final bool flagged;
}

class RegularisationRequest {
  RegularisationRequest({
    required this.id,
    required this.type,
    required this.dateLabel,
    required this.issue,
    required this.actualTime,
    required this.correctedTime,
    required this.location,
    required this.reason,
    required this.status,
    required this.createdLabel,
    this.attachment,
    this.employeeName = 'Priya Nair',
    this.employeeCode = 'EMP-00234',
    this.department = 'HR Bangalore',
  });

  final String id;
  String type;
  String dateLabel;
  String issue;
  String actualTime;
  String correctedTime;
  String location;
  String reason;
  String status;
  String createdLabel;
  String? attachment;
  final String employeeName;
  final String employeeCode;
  final String department;

  String get timings => '$actualTime → $correctedTime';
}

class ApprovalItem {
  ApprovalItem({
    required this.id,
    required this.kind,
    required this.employee,
    required this.employeeCode,
    required this.department,
    required this.dateLabel,
    required this.summary,
    required this.priority,
    required this.status,
    required this.submittedAt,
    required this.original,
    required this.requested,
    this.comment = '',
    this.turnaround = '—',
  });

  final String id;
  final String kind;
  final String employee;
  final String employeeCode;
  final String department;
  final String dateLabel;
  final String summary;
  final String priority;
  String status;
  final String submittedAt;
  final Map<String, String> original;
  final Map<String, String> requested;
  String comment;
  String turnaround;
}

class ShiftTemplate {
  ShiftTemplate({
    required this.id,
    required this.name,
    required this.code,
    required this.start,
    required this.end,
    required this.breakLabel,
    required this.graceLate,
    required this.graceEarly,
    required this.duration,
  });

  final String id;
  String name;
  String code;
  String start;
  String end;
  String breakLabel;
  String graceLate;
  String graceEarly;
  String duration;

  String get window => '$start - $end';
}

class ShiftGroup {
  const ShiftGroup({
    required this.name,
    required this.employees,
    required this.pattern,
    required this.summary,
    required this.shifts,
  });

  final String name;
  final int employees;
  final String pattern;
  final String summary;
  final List<String> shifts;
}

class SwapRequest {
  SwapRequest({
    required this.id,
    required this.fromName,
    required this.toName,
    required this.fromShift,
    required this.toShift,
    required this.dateLabel,
    required this.status,
    required this.reason,
  });

  final String id;
  final String fromName;
  final String toName;
  final String fromShift;
  final String toShift;
  final String dateLabel;
  String status;
  final String reason;
}

class SiteOffice {
  const SiteOffice({
    required this.name,
    required this.kind,
    required this.present,
    required this.absent,
    required this.health,
    required this.pinX,
    required this.pinY,
  });

  final String name;
  final String kind;
  final int present;
  final int absent;
  final String health;
  final double pinX;
  final double pinY;

  int get headcount => present + absent;
}

class AttendanceException {
  AttendanceException({
    required this.id,
    required this.employee,
    required this.code,
    required this.type,
    required this.priority,
    required this.detail,
    this.reviewed = false,
  });

  final String id;
  final String employee;
  final String code;
  final String type;
  final String priority;
  final String detail;
  bool reviewed;
}

class AppNotification {
  AppNotification({required this.title, required this.body, required this.timeLabel, this.read = false});

  final String title;
  final String body;
  final String timeLabel;
  bool read;
}

class GeoCapture {
  const GeoCapture({
    required this.label,
    required this.insideFence,
    required this.mockFlag,
    required this.source,
    this.accuracyMeters,
    this.latitude,
    this.longitude,
  });

  final String label;
  final bool insideFence;
  final bool mockFlag;
  final String source;
  final double? accuracyMeters;
  final double? latitude;
  final double? longitude;
}
