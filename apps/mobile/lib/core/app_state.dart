import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'geofence.dart';
import 'models.dart';
import 'push_messaging.dart';
import 'workspace_accounts.dart';
import 'workspace_mapper.dart';

class AppState extends ChangeNotifier {
  AppState({WorkspaceApi? api}) : api = api ?? WorkspaceApi() {
    this.api.onSessionRefreshed = () {
      _persist();
    };
    PushMessaging.listen(addPushNotice);
    restore();
  }

  final WorkspaceApi api;

  static const _prefsKey = 'infitimepro.mobile.session';

  bool ready = false;
  bool signedIn = false;
  bool rememberMe = true;
  bool syncing = false;
  String email = '';
  String organization = '';
  String firstName = '';
  String lastName = '';
  String employeeId = '';
  String employeeCode = '';
  String role = '';
  String? connectionError;
  bool workspaceLinked = false;
  DateTime loadedMonth = DateTime(DateTime.now().year, DateTime.now().month, 1);

  bool actionBusy = false;
  String? sessionNotice;

  bool get isBusy => syncing || locating || actionBusy;
  bool get canManageTeam => role == 'ADMIN' || role == 'MANAGER';
  bool get canAdminister => role == 'ADMIN';
  String get displayName => '$firstName $lastName'.trim();
  String get initials {
    final parts = displayName.split(RegExp(r'\s+')).where((part) => part.isNotEmpty).toList();
    if (parts.isEmpty) return 'NA';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  bool checkedIn = false;
  bool onBreak = false;
  String clockInLabel = '—';
  String? clockOutLabel;
  String breakLabel = '';
  int workedMinutes = 0;
  String assignedShift = '';
  String locationLabel = '';
  bool locationMock = false;
  bool insideFence = true;
  String locationSource = 'assigned_site';
  bool locating = false;

  DateTime calendarMonth = DateTime(DateTime.now().year, DateTime.now().month, 1);
  int selectedDay = DateTime.now().day;

  final List<RegularisationRequest> requests = [];
  final List<ApprovalItem> approvals = [];
  final List<ApprovalItem> approvalHistory = [];
  final List<ShiftTemplate> shifts = [];
  final List<ShiftGroup> groups = [];
  final List<SwapRequest> swaps = [];
  final List<TeamMember> org = [];
  final List<TeamMember> team = [];
  final List<SiteOffice> sites = [];
  final List<PunchFence> fences = [];
  final List<AttendanceException> exceptions = [];
  final Map<int, DayAttendance> september = {};
  final List<AppNotification> notifications = [];
  final List<PunchEvent> punches = [];
  final List<RosterPerson> roster = [];

  final Map<String, String> assignments = {};
  bool schedulePublished = false;
  String scheduleNote = '';

  int monthPresent = 0;
  int monthAbsent = 0;
  int monthLate = 0;
  int monthLeave = 0;
  int monthRate = 0;

  int get unreadNotifications => notifications.where((n) => !n.read).length;

  int _requestSeq = 9000;

  DayAttendance day(int value) {
    return september[value] ??
        DayAttendance(
          day: value,
          kind: DayKind.absent,
          shift: '',
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
          api.refreshToken = data['refreshToken'] as String?;
          api.tenantId = (data['tenantId'] as String?) ?? api.tenantId;
          firstName = (data['firstName'] as String?) ?? firstName;
          lastName = (data['lastName'] as String?) ?? lastName;
          employeeId = (data['employeeId'] as String?) ?? employeeId;
          role = (data['role'] as String?) ?? role;
        }
      }
      if (!signedIn) {
        api.token = null;
        api.refreshToken = null;
      } else if (api.token != null || (api.refreshToken != null && api.refreshToken!.isNotEmpty)) {
        await loadWorkspace();
        await PushMessaging.register(api);
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
          'refreshToken': api.refreshToken,
          'tenantId': api.tenantId,
          'firstName': firstName,
          'lastName': lastName,
          'employeeId': employeeId,
          'role': role,
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
    connectionError = null;
    notifyListeners();
    try {
    final typedLogin = nextEmail.trim();
    api.token = null;
    final session = await api.login(email: typedLogin, password: password);
    final user = session['user'];
    api.token = session['token']?.toString();
    api.refreshToken = session['refreshToken']?.toString();
    if (api.token == null || api.token!.isEmpty) {
      throw ApiException('The workspace did not return a session.');
    }
    if (user is Map) {
      api.tenantId = user['tenantId']?.toString() ?? api.tenantId;
      firstName = user['firstName']?.toString() ?? firstName;
      lastName = user['lastName']?.toString() ?? lastName;
      employeeId = user['employeeId']?.toString() ?? employeeId;
      employeeCode = user['employeeCode']?.toString() ?? employeeCode;
      role = user['role']?.toString() ?? role;
      email = user['email']?.toString() ?? typedLogin;
      if (serverReturnedPlaceholderAdmin(Map<String, dynamic>.from(user), typedLogin)) {
        final account = accountForLogin(typedLogin);
        firstName = account.firstName;
        lastName = account.lastName;
        role = account.role;
        if (account.employeeId.isNotEmpty) employeeId = account.employeeId;
        if (account.employeeCode.isNotEmpty) employeeCode = account.employeeCode;
        email = account.email.contains('@') ? account.email : typedLogin;
      }
    } else {
      final account = accountForLogin(typedLogin);
      firstName = account.firstName;
      lastName = account.lastName;
      role = account.role;
      email = account.email.contains('@') ? account.email : typedLogin;
    }
    appLog('session ready for $email');
    checkedIn = false;
    onBreak = false;
    clockInLabel = '—';
    clockOutLabel = null;
    workedMinutes = 0;
    september.clear();
    team.clear();
    org.clear();
    requests.clear();
    approvals.clear();
    approvalHistory.clear();
    exceptions.clear();
    punches.clear();
    organization = nextOrganization;
    rememberMe = remember;
    signedIn = true;
    notifyListeners();
    await loadWorkspace();
    await PushMessaging.register(api);
    await _persist();
    } finally {
      if (syncing) {
        syncing = false;
        notifyListeners();
      }
    }
  }

  void clearSessionNotice() {
    sessionNotice = null;
  }

  Future<void> signOut({String? notice}) async {
    signedIn = false;
    api.token = null;
    api.refreshToken = null;
    connectionError = null;
    sessionNotice = notice;
    notifyListeners();
    await _persist();
  }

  Future<void> loadWorkspace() async {
    syncing = true;
    connectionError = null;
    notifyListeners();
    final missed = <String>[];
    var loadedAny = false;

    var sessionRejected = false;

    Future<void> pull(String label, Future<void> Function() action) async {
      if (sessionRejected) return;
      try {
        await action();
        loadedAny = true;
        appLog('workspace loaded $label');
      } on ApiException catch (error) {
        if (error.message.contains('Sign in again')) {
          sessionRejected = true;
          return;
        }
        missed.add(label);
        appLog('workspace $label FAILED $error');
      } catch (error) {
        missed.add(label);
        appLog('workspace $label FAILED $error');
      }
    }

    await pull('attendance', () async {
      final now = DateTime.now();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      final data = await api.get('/attendance/my-attendance', query: {'month': monthNames[now.month - 1], 'year': '${now.year}'});
      final mapped = mapMyAttendance(data);
      september
        ..clear()
        ..addAll(mapped.days);
      if (mapped.loadedMonth != null) {
        loadedMonth = mapped.loadedMonth!;
        calendarMonth = mapped.loadedMonth!;
      }
      checkedIn = mapped.checkedIn ?? false;
      onBreak = false;
      clockInLabel = (mapped.clockInLabel != null && mapped.clockInLabel!.isNotEmpty) ? mapped.clockInLabel! : '—';
      clockOutLabel = (mapped.clockOutLabel != null && mapped.clockOutLabel!.isNotEmpty && mapped.clockOutLabel != '--') ? mapped.clockOutLabel : null;
      monthPresent = mapped.presentDays;
      monthAbsent = mapped.absentDays;
      monthLate = mapped.lateDays;
      monthLeave = mapped.leaveDays;
      monthRate = mapped.attendancePercentage;
      workedMinutes = mapped.workedMinutes;
      assignedShift = mapped.assignedShift;
    });
    await pull('team', () async {
      final mapped = mapTeam(await api.get('/attendance/team-attendance'));
      team
        ..clear()
        ..addAll(mapped);
    });
    await pull('live attendance', () async {
      final mapped = mapLive(await api.get('/attendance/live-stream'));
      org
        ..clear()
        ..addAll(mapped);
    });
    await pull('requests', () async {
      final mapped = mapRegularisations(await api.get('/exceptions/regularisations'));
      requests
        ..clear()
        ..addAll(mapped);
    });
    await pull('exceptions', () async {
      final mapped = mapExceptions(await api.get('/exceptions'));
      exceptions
        ..clear()
        ..addAll(mapped);
    });
    await pull('approvals', () async {
      final mapped = mapApprovals(await api.get('/approvals/inbox'));
      approvals
        ..clear()
        ..addAll(mapped.where((item) => item.status == 'Pending'));
    });
    await pull('approval history', () async {
      final mapped = mapHistory(await api.get('/approvals/history'));
      approvalHistory
        ..clear()
        ..addAll(mapped);
    });
    await pull('shifts', () async {
      final mapped = mapShifts(await api.get('/shifts'));
      shifts
        ..clear()
        ..addAll(mapped);
    });
    await pull('shift groups', () async {
      final mapped = mapGroups(await api.get('/shifts/groups'));
      groups
        ..clear()
        ..addAll(mapped);
    });
    await pull('shift swaps', () async {
      final mapped = mapSwaps(await api.get('/shifts/swaps'));
      swaps
        ..clear()
        ..addAll(mapped);
    });
    await pull('locations', () async {
      final data = await api.get('/organization/locations');
      sites
        ..clear()
        ..addAll(mapLocations(data));
      fences
        ..clear()
        ..addAll(mapFences(data));
    });
    await pull('punches', () async {
      final mapped = mapPunches(await api.get('/attendance/recent-punches'));
      punches
        ..clear()
        ..addAll(mapped);
    });
    await pull('schedule', () async {
      final data = await api.get('/shifts/schedule-matrix');
      final mapped = mapSchedule(data);
      final week = scheduleWeek(data);
      roster
        ..clear()
        ..addAll(mapped);
      if (week.isNotEmpty) scheduleNote = week;
      schedulePublished = mapped.isNotEmpty;
    });

    syncing = false;
    if (sessionRejected) {
      signedIn = false;
      api.token = null;
      api.refreshToken = null;
      workspaceLinked = false;
      connectionError = 'Your workspace session expired. Sign in again.';
      sessionNotice = connectionError;
      await _persist();
      notifyListeners();
      return;
    }
    workspaceLinked = loadedAny;
    connectionError = missed.isEmpty ? null : 'Could not load ${missed.join(', ')} from the workspace.';
    notifyListeners();
  }

  Future<String> clockIn() async {
    locating = true;
    notifyListeners();
    try {
      final geo = await capturePunchLocation(fences);
      final result = await _sendPunch('IN', geo);
      locating = false;
      checkedIn = true;
      onBreak = false;
      clockOutLabel = null;
      clockInLabel = _clockLabel(TimeOfDay.now());
      locationLabel = geo.label;
      locationMock = geo.mockFlag;
      insideFence = geo.insideFence;
      locationSource = geo.source;
      notifyListeners();
      await _persist();
      await loadWorkspace();
      final serverMessage = result is Map ? result['message']?.toString() : null;
      if (serverMessage != null && serverMessage.isNotEmpty) return serverMessage;
      return 'Clock-in saved. It will show on the web for ${displayName}.';
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
      await _sendPunch('OUT', await capturePunchLocation(fences));
    } on ApiException catch (error) {
      connectionError = error.message;
      notifyListeners();
      return;
    }
    locating = false;
    onBreak = false;
    checkedIn = false;
    clockOutLabel = _clockLabel(TimeOfDay.now());
    notifyListeners();
    await _persist();
    await loadWorkspace();
  }

  void refreshClock() {
    notifyListeners();
  }

  Future<void> startBreak() async {
    if (!checkedIn || onBreak) return;
    await _sendPunch('BREAK_OUT', await capturePunchLocation(fences));
    onBreak = true;
    breakLabel = 'Started ${_clockLabel(TimeOfDay.now())}';
    notifyListeners();
    _persist();
  }

  Future<void> endBreak() async {
    if (!onBreak) return;
    await _sendPunch('BREAK_IN', await capturePunchLocation(fences));
    onBreak = false;
    breakLabel = 'Ended ${_clockLabel(TimeOfDay.now())}';
    notifyListeners();
    _persist();
  }

  void addPushNotice(String title, String body) {
    notifications.insert(0, AppNotification(title: title, body: body, timeLabel: 'Now'));
    notifyListeners();
  }

  void markNotificationsRead() {
    for (final item in notifications) {
      item.read = true;
    }
    notifyListeners();
  }

  void markNotificationRead(int index) {
    if (index < 0 || index >= notifications.length || notifications[index].read) return;
    notifications[index].read = true;
    notifyListeners();
  }

  Future<RegularisationRequest> saveRequest({
    String? id,
    required String type,
    required String dateLabel,
    String? attendanceDate,
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
        'attendanceDate': attendanceDate ?? dateLabel,
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

  Future<void> assignShift({
    required List<String> employeeIds,
    required String shiftName,
  }) async {
    for (final id in employeeIds) {
      await api.post('/shifts/assignments', {
        'employeeId': id,
        'currentShift': shiftName,
      });
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

  Future<void> reviewException(String id) async {
    final item = exceptions.where((e) => e.id == id).firstOrNull;
    if (item == null) return;
    await api.post('/exceptions/resolve', {
      'exceptionId': id,
      'action': 'waive',
      'reason': 'Reviewed from the mobile app',
    });
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
