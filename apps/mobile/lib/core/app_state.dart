import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'demo_data.dart';
import 'geofence.dart';
import 'models.dart';
import 'workspace_mapper.dart';

class AppState extends ChangeNotifier {
  AppState({WorkspaceApi? api}) : api = api ?? WorkspaceApi() {
    restore();
  }

  final WorkspaceApi api;

  static const _prefsKey = 'infitimepro.mobile.session';

  bool ready = false;
  bool signedIn = false;
  bool rememberMe = true;
  bool syncing = false;
  String email = 'priya.nair@company.com';
  String organization = DemoData.organizations.first.name;
  String firstName = 'Priya';
  String lastName = 'Nair';
  String employeeId = 'emp_priya_003';
  String? connectionError;
  bool workspaceLinked = false;
  DateTime loadedMonth = DateTime(2024, 9, 1);

  bool actionBusy = false;

  bool get isBusy => syncing || locating || actionBusy;
  String get initials {
    final parts = displayName.split(RegExp(r'\s+')).where((part) => part.isNotEmpty).toList();
    if (parts.isEmpty) return 'NA';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  bool checkedIn = true;
  bool onBreak = false;
  String clockInLabel = '09:05 AM';
  String? clockOutLabel;
  String breakLabel = '01:00 PM – 02:00 PM';
  int workedMinutes = 156;
  String locationLabel = 'Bangalore HQ';
  bool locationMock = false;
  bool insideFence = true;
  String locationSource = 'assigned_site';
  bool locating = false;

  DateTime calendarMonth = DateTime(2024, 9, 1);
  int selectedDay = 10;

  final List<RegularisationRequest> requests = DemoData.requests();
  final List<ApprovalItem> approvals = DemoData.approvals();
  final List<ApprovalItem> approvalHistory = DemoData.approvalHistory();
  final List<ShiftTemplate> shifts = DemoData.shifts();
  final List<ShiftGroup> groups = DemoData.groups();
  final List<SwapRequest> swaps = DemoData.swaps();
  final List<TeamMember> org = DemoData.orgMembers();
  final List<TeamMember> team = DemoData.teamMembers();
  final List<SiteOffice> sites = DemoData.sites();
  final List<AttendanceException> exceptions = DemoData.exceptions();
  final Map<int, DayAttendance> september = DemoData.september();
  final List<AppNotification> notifications = DemoData.notifications();

  final Map<String, String> assignments = {};
  bool schedulePublished = true;
  String scheduleNote = 'Week of 16 Sep 2024';

  int get unreadNotifications => notifications.where((n) => !n.read).length;

  int _requestSeq = 9000;

  DayAttendance day(int value) {
    return september[value] ??
        DayAttendance(
          day: value,
          kind: DayKind.present,
          inTime: clockInLabel,
          outTime: clockOutLabel,
          hours: formatDuration(workedMinutes),
        );
  }

  Future<void> restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_prefsKey);
      if (raw != null) {
        final data = jsonDecode(raw);
        if (data is Map) {
          rememberMe = data['rememberMe'] == true;
          email = (data['email'] as String?)?.trim().isNotEmpty == true ? data['email'] as String : email;
          organization = (data['organization'] as String?) ?? organization;
          signedIn = data['signedIn'] == true && rememberMe;
          if (data['checkedIn'] is bool) checkedIn = data['checkedIn'] as bool;
          if (data['onBreak'] is bool) onBreak = data['onBreak'] as bool;
          clockInLabel = (data['clockInLabel'] as String?) ?? clockInLabel;
          clockOutLabel = data['clockOutLabel'] as String?;
          if (data['workedMinutes'] is int) workedMinutes = data['workedMinutes'] as int;
          locationLabel = (data['locationLabel'] as String?) ?? locationLabel;
          api.token = data['token'] as String?;
          api.tenantId = (data['tenantId'] as String?) ?? api.tenantId;
          firstName = (data['firstName'] as String?) ?? firstName;
          lastName = (data['lastName'] as String?) ?? lastName;
          employeeId = (data['employeeId'] as String?) ?? employeeId;
        }
      }
      if (signedIn && api.token != null) {
        await loadWorkspace();
      }
    } catch (_) {
      signedIn = false;
    } finally {
      ready = true;
      notifyListeners();
    }
  }

  Future<void> _persist() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (!rememberMe) {
        await prefs.remove(_prefsKey);
        return;
      }
      await prefs.setString(
        _prefsKey,
        jsonEncode({
          'rememberMe': rememberMe,
          'email': email,
          'organization': organization,
          'signedIn': signedIn,
          'checkedIn': checkedIn,
          'onBreak': onBreak,
          'clockInLabel': clockInLabel,
          'clockOutLabel': clockOutLabel,
          'workedMinutes': workedMinutes,
          'locationLabel': locationLabel,
          'token': api.token,
          'tenantId': api.tenantId,
          'firstName': firstName,
          'lastName': lastName,
          'employeeId': employeeId,
        }),
      );
    } catch (_) {}
  }

  Future<void> signIn({
    required String nextEmail,
    required String nextOrganization,
    required bool remember,
    required String password,
  }) async {
    appLog('sign in ${nextEmail.trim()}');
    syncing = true;
    notifyListeners();
    try {
    final session = await api.login(email: nextEmail.trim(), password: password);
    final user = session['user'];
    api.token = session['token']?.toString();
    if (api.token == null || api.token!.isEmpty) {
      throw ApiException('The workspace did not return a session.');
    }
    if (user is Map) {
      api.tenantId = user['tenantId']?.toString() ?? api.tenantId;
      firstName = user['firstName']?.toString() ?? firstName;
      lastName = user['lastName']?.toString() ?? lastName;
      employeeId = user['employeeId']?.toString() ?? employeeId;
      email = user['email']?.toString() ?? nextEmail.trim();
    } else {
      email = nextEmail.trim();
    }
    appLog('session ready for $email');
    organization = nextOrganization;
    rememberMe = remember;
    signedIn = true;
    notifyListeners();
    await loadWorkspace();
    await _persist();
    } finally {
      if (syncing) {
        syncing = false;
        notifyListeners();
      }
    }
  }

  Future<void> signOut() async {
    signedIn = false;
    api.token = null;
    connectionError = null;
    notifyListeners();
    await _persist();
  }

  Future<void> loadWorkspace() async {
    syncing = true;
    connectionError = null;
    notifyListeners();
    final missed = <String>[];
    var loadedAny = false;

    Future<void> pull(String label, Future<void> Function() action) async {
      try {
        await action();
        loadedAny = true;
        appLog('workspace loaded $label');
      } catch (error) {
        missed.add(label);
        appLog('workspace $label FAILED $error');
      }
    }

    await pull('attendance', () async {
      final data = await api.get('/attendance/my-attendance', query: {'month': 'September', 'year': '2026'});
      final mapped = mapMyAttendance(data);
      if (mapped.days.isNotEmpty) {
        september
          ..clear()
          ..addAll(mapped.days);
      }
      if (mapped.loadedMonth != null) {
        loadedMonth = mapped.loadedMonth!;
        calendarMonth = mapped.loadedMonth!;
      }
      if (mapped.checkedIn != null) checkedIn = mapped.checkedIn!;
      if (mapped.clockInLabel != null && mapped.clockInLabel!.isNotEmpty) clockInLabel = mapped.clockInLabel!;
      if (mapped.clockOutLabel != null && mapped.clockOutLabel!.isNotEmpty && mapped.clockOutLabel != '--') {
        clockOutLabel = mapped.clockOutLabel;
      }
    });
    await pull('team', () async {
      final mapped = mapTeam(await api.get('/attendance/team-attendance'));
      if (mapped.isNotEmpty) {
        team
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('live attendance', () async {
      final mapped = mapLive(await api.get('/attendance/live-stream'));
      if (mapped.isNotEmpty) {
        org
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('requests', () async {
      final mapped = mapRegularisations(await api.get('/exceptions/regularisations'));
      if (mapped.isNotEmpty) {
        requests
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('exceptions', () async {
      final mapped = mapExceptions(await api.get('/exceptions'));
      if (mapped.isNotEmpty) {
        exceptions
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('approvals', () async {
      final mapped = mapApprovals(await api.get('/approvals/inbox'));
      approvals
        ..clear()
        ..addAll(mapped.where((item) => item.status == 'Pending'));
    });
    await pull('approval history', () async {
      final mapped = mapHistory(await api.get('/approvals/history'));
      if (mapped.isNotEmpty) {
        approvalHistory
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('shifts', () async {
      final mapped = mapShifts(await api.get('/shifts'));
      if (mapped.isNotEmpty) {
        shifts
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('shift groups', () async {
      final mapped = mapGroups(await api.get('/shifts/groups'));
      if (mapped.isNotEmpty) {
        groups
          ..clear()
          ..addAll(mapped);
      }
    });
    await pull('shift swaps', () async {
      final mapped = mapSwaps(await api.get('/shifts/swaps'));
      if (mapped.isNotEmpty) {
        swaps
          ..clear()
          ..addAll(mapped);
      }
    });

    syncing = false;
    workspaceLinked = loadedAny;
    connectionError = missed.isEmpty ? null : 'Could not load ${missed.join(', ')} from the workspace.';
    notifyListeners();
  }

  Future<String> clockIn() async {
    locating = true;
    notifyListeners();
    try {
      final geo = await capturePunchLocation();
      final result = await _sendPunch('IN', geo);
      locating = false;
      checkedIn = true;
      onBreak = false;
      clockOutLabel = null;
      clockInLabel = _clockLabel(TimeOfDay.now());
      workedMinutes = 0;
      locationLabel = geo.label;
      locationMock = geo.mockFlag;
      insideFence = geo.insideFence;
      locationSource = geo.source;
      notifyListeners();
      await _persist();
      final serverMessage = result is Map ? result['message']?.toString() : null;
      if (serverMessage != null && serverMessage.isNotEmpty) return serverMessage;
      return 'Clock-in recorded by the workspace at ${geo.label}.';
    } on ApiException catch (error) {
      locating = false;
      notifyListeners();
      return error.message;
    }
  }

  Future<dynamic> _sendPunch(String eventType, GeoCapture geo) {
    return api.post('/punches/ingest', {
      'employeeId': employeeId,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
      'eventType': eventType,
      'source': 'mobile_app',
      'deviceIdentifier': 'infitimepro-mobile',
      'isMockLocation': geo.mockFlag,
      if (geo.latitude != null) 'latitude': geo.latitude,
      if (geo.longitude != null) 'longitude': geo.longitude,
      if (geo.accuracyMeters != null) 'accuracyMeters': geo.accuracyMeters,
    });
  }

  Future<void> clockOut() async {
    if (!checkedIn) return;
    locating = true;
    notifyListeners();
    try {
      await _sendPunch('OUT', await capturePunchLocation());
    } on ApiException catch (error) {
      connectionError = error.message;
      notifyListeners();
      return;
    }
    locating = false;
    onBreak = false;
    checkedIn = false;
    clockOutLabel = _clockLabel(TimeOfDay.now());
    if (workedMinutes < 30) workedMinutes = 547;
    notifyListeners();
    _persist();
  }

  Future<void> startBreak() async {
    if (!checkedIn || onBreak) return;
    await _sendPunch('BREAK_OUT', await capturePunchLocation());
    onBreak = true;
    breakLabel = 'Started ${_clockLabel(TimeOfDay.now())}';
    notifyListeners();
    _persist();
  }

  Future<void> endBreak() async {
    if (!onBreak) return;
    await _sendPunch('BREAK_IN', await capturePunchLocation());
    onBreak = false;
    breakLabel = 'Ended ${_clockLabel(TimeOfDay.now())}';
    notifyListeners();
    _persist();
  }

  void markNotificationsRead() {
    for (final item in notifications) {
      item.read = true;
    }
    notifyListeners();
  }

  Future<RegularisationRequest> saveRequest({
    String? id,
    required String type,
    required String dateLabel,
    required String issue,
    required String actualTime,
    required String correctedTime,
    required String location,
    required String reason,
    required String status,
    String? attachment,
  }) async {
    if (status == 'Pending') {
      final created = await api.post('/exceptions/regularisations', {
        'attendanceDate': dateLabel,
        'requestType': requestTypeForApi(type),
        'requestedIn': correctedTime,
        'reasonCategory': issue,
        'reasonText': reason,
        if (attachment != null) 'attachmentUrl': attachment,
      });
      final request = created is Map ? mapRegularisations([created]).firstOrNull : null;
      if (request != null) {
        requests.removeWhere((item) => item.id == request.id);
        requests.insert(0, request);
        notifyListeners();
        return request;
      }
    }
    if (id != null) {
      final existing = requests.where((r) => r.id == id).firstOrNull;
      if (existing != null) {
        existing
          ..type = type
          ..dateLabel = dateLabel
          ..issue = issue
          ..actualTime = actualTime
          ..correctedTime = correctedTime
          ..location = location
          ..reason = reason
          ..status = status
          ..attachment = attachment;
        notifyListeners();
        return existing;
      }
    }
    _requestSeq += 1;
    final created = RegularisationRequest(
      id: 'REG-$_requestSeq',
      type: type,
      dateLabel: dateLabel,
      issue: issue,
      actualTime: actualTime,
      correctedTime: correctedTime,
      location: location,
      reason: reason,
      status: status,
      createdLabel: 'Today',
      attachment: attachment,
    );
    requests.insert(0, created);
    notifyListeners();
    return created;
  }

  void withdrawRequest(String id) {
    final item = requests.where((r) => r.id == id).firstOrNull;
    if (item == null || item.status != 'Pending') return;
    item.status = 'Withdrawn';
    notifyListeners();
  }

  Future<RegularisationRequest?> duplicateRequest(String id) async {
    final item = requests.where((r) => r.id == id).firstOrNull;
    if (item == null) return null;
    return saveRequest(
      type: item.type,
      dateLabel: item.dateLabel,
      issue: item.issue,
      actualTime: item.actualTime,
      correctedTime: item.correctedTime,
      location: item.location,
      reason: item.reason,
      status: 'Draft',
      attachment: item.attachment,
    );
  }

  Future<void> decideApproval(String id, String decision, String comment) async {
    final index = approvals.indexWhere((a) => a.id == id);
    if (index < 0) return;
    final item = approvals[index];
    await api.post('/approvals/decision', {
      'approvalId': id,
      'category': categoryForApi(item.kind),
      'decision': decisionForApi(decision),
      'comments': comment,
    });
    approvals.removeAt(index);
    item.status = decision;
    item.comment = comment;
    item.turnaround = 'Just now';
    approvalHistory.insert(0, item);
    notifyListeners();
  }

  Future<void> decideSwap(String id, bool approve) async {
    final item = swaps.where((s) => s.id == id).firstOrNull;
    if (item == null || item.status != 'Pending') return;
    await api.patch('/shifts/swaps/$id/${approve ? 'approve' : 'reject'}');
    item.status = approve ? 'Approved' : 'Rejected';
    notifyListeners();
  }

  Future<void> addShift(ShiftTemplate shift) async {
    await api.post('/shifts', {
      'name': shift.name,
      'code': shift.code,
      'startTime': shift.start,
      'endTime': shift.end,
      'shiftType': 'fixed',
    });
    final existing = shifts.indexWhere((s) => s.id == shift.id);
    if (existing >= 0) {
      shifts[existing] = shift;
    } else {
      shifts.add(shift);
    }
    notifyListeners();
  }

  void assignShift({
    required List<String> employeeIds,
    required String shiftName,
  }) {
    for (final id in employeeIds) {
      assignments[id] = shiftName;
    }
    notifyListeners();
  }

  String shiftFor(TeamMember member) => assignments[member.id] ?? member.shift;

  void copyLastWeek() {
    for (final member in team) {
      assignments[member.id] = member.shift;
    }
    scheduleNote = 'Copied from last week';
    notifyListeners();
  }

  void publishSchedule() {
    schedulePublished = true;
    scheduleNote = 'Published just now';
    notifyListeners();
  }

  void reviewException(String id) {
    final item = exceptions.where((e) => e.id == id).firstOrNull;
    if (item == null) return;
    item.reviewed = true;
    notifyListeners();
  }

  void selectDay(int day) {
    selectedDay = day;
    notifyListeners();
  }

  void shiftMonth(int delta) {
    calendarMonth = DateTime(calendarMonth.year, calendarMonth.month + delta, 1);
    notifyListeners();
  }
}

String formatDuration(int minutes) {
  final safe = minutes < 0 ? 0 : minutes;
  final hours = safe ~/ 60;
  final mins = safe % 60;
  return '${hours}h ${mins.toString().padLeft(2, '0')}m';
}

String _clockLabel(TimeOfDay time) {
  final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
  final minute = time.minute.toString().padLeft(2, '0');
  final suffix = time.period == DayPeriod.am ? 'AM' : 'PM';
  return '$hour:$minute $suffix';
}

String greetingForNow() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
