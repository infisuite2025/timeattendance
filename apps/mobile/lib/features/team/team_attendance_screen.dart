import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';

class TeamAttendanceScreen extends StatefulWidget {
  const TeamAttendanceScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<TeamAttendanceScreen> createState() => _TeamAttendanceScreenState();
}

class _TeamAttendanceScreenState extends State<TeamAttendanceScreen> {
  String _query = '';
  String _department = 'All departments';
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final people = state.team;
    final departments = ['All departments', ...{for (final person in people) person.department}];
    int count(AttendanceStatus status) => people.where((p) => p.status == status).length;
    final attention = count(AttendanceStatus.late) + count(AttendanceStatus.missingPunch);

    final visible = people.where((person) {
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty || person.name.toLowerCase().contains(query) || person.code.toLowerCase().contains(query);
      final deptOk = _department == 'All departments' || person.department == _department;
      final filterOk = switch (_filter.split(' ').first) {
        'Present' => person.status == AttendanceStatus.present,
        'Absent' => person.status == AttendanceStatus.absent,
        'Late' => person.status == AttendanceStatus.late,
        'Leave' => person.status == AttendanceStatus.onLeave,
        'WFH' => person.status == AttendanceStatus.wfh,
        _ => true,
      };
      return queryOk && deptOk && filterOk;
    }).toList();

    final content = ListView(
      padding: EdgeInsets.fromLTRB(16, widget.embedded ? 8 : 12, 16, 28),
      children: [
        Text(formatToday(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
        const SizedBox(height: 8),
        AppCard(
          color: AppColors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Column(
            children: [
              Row(
                children: [
                  _Count(value: '${count(AttendanceStatus.present)}', label: 'Present', color: AppColors.emerald),
                  _Count(value: '${count(AttendanceStatus.absent)}', label: 'Absent', color: AppColors.rose),
                  _Count(value: '${count(AttendanceStatus.late)}', label: 'Late', color: AppColors.amber),
                ],
              ),
              const Divider(height: 22, color: AppColors.line),
              Row(
                children: [
                  _Count(value: '${count(AttendanceStatus.onLeave)}', label: 'On leave', color: AppColors.purple),
                  _Count(value: '${count(AttendanceStatus.wfh)}', label: 'WFH', color: AppColors.primary),
                  _Count(value: '${people.length}', label: 'Team', color: AppColors.slate900),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search name or ID'),
          onChanged: (value) => setState(() => _query = value),
        ),
        const SizedBox(height: 8),
        AppDropdown<String>(
          value: departments.contains(_department) ? _department : 'All departments',
          label: 'Department',
          items: [for (final dept in departments) DropdownMenuItem(value: dept, child: Text(dept))],
          onChanged: (value) => setState(() => _department = value ?? 'All departments'),
        ),
        const SizedBox(height: 10),
        FilterChips(
          labels: [
            'All ${people.length}',
            'Present ${count(AttendanceStatus.present)}',
            'Absent ${count(AttendanceStatus.absent)}',
            'Late ${count(AttendanceStatus.late)}',
            'Leave ${count(AttendanceStatus.onLeave)}',
            'WFH ${count(AttendanceStatus.wfh)}',
          ],
          selected: _chip(people.length, count),
          onSelected: (value) => setState(() => _filter = value),
        ),
        if (attention > 0) ...[
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(width: 4, height: 36, decoration: BoxDecoration(color: AppColors.amber, borderRadius: BorderRadius.circular(4))),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '$attention ${attention == 1 ? 'person needs' : 'people need'} a look. Late arrivals and missing punches are in the list below.',
                    style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
                  ),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
        Text(
          visible.isEmpty ? 'No matches' : '${visible.length} ${visible.length == 1 ? 'person' : 'people'}',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500),
        ),
        const SizedBox(height: 8),
        if (visible.isEmpty)
          const AppCard(color: AppColors.white, child: Text('Nobody matches this filter.'))
        else
          for (final person in visible) ...[
            _TeamCard(person: person, shift: state.shiftFor(person)),
            const SizedBox(height: 8),
          ],
      ],
    );

    if (widget.embedded) return content;
    return Scaffold(appBar: AppBar(title: const Text('My team')), body: content);
  }

  String _chip(int all, int Function(AttendanceStatus) count) {
    final key = _filter.split(' ').first;
    switch (key) {
      case 'Present':
        return 'Present ${count(AttendanceStatus.present)}';
      case 'Absent':
        return 'Absent ${count(AttendanceStatus.absent)}';
      case 'Late':
        return 'Late ${count(AttendanceStatus.late)}';
      case 'Leave':
        return 'Leave ${count(AttendanceStatus.onLeave)}';
      case 'WFH':
        return 'WFH ${count(AttendanceStatus.wfh)}';
      default:
        return 'All $all';
    }
  }
}

class _TeamCard extends StatelessWidget {
  const _TeamCard({required this.person, required this.shift});
  final TeamMember person;
  final String shift;

  @override
  Widget build(BuildContext context) {
    final color = colorForStatus(person.status);
    return AppCard(
      color: AppColors.white,
      onTap: () => _details(context),
      padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, height: 52, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          AvatarBadge(initials: person.initials),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(person.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('${person.code} · ${person.department}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                const SizedBox(height: 2),
                Text('$shift · ${person.checkIn ?? 'No check-in'}', style: const TextStyle(fontSize: 12, color: AppColors.slate700)),
                if (person.delay != null) ...[
                  const SizedBox(height: 6),
                  StatusPill(label: person.delay!, color: AppColors.amber),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusPill(label: statusLabel(person.status), color: color),
              const Icon(Icons.chevron_right, color: AppColors.slate400),
            ],
          ),
        ],
      ),
    );
  }

  void _details(BuildContext context) {
    showAppSheet<void>(
      context,
      title: person.name,
      message: '${person.code} · ${person.department}',
      builder: (_) => AppCard(
        color: AppColors.white,
        child: Column(
          children: [
            _Fact(label: 'Status', value: statusLabel(person.status)),
            _Fact(label: 'Shift', value: shift),
            _Fact(label: 'Site', value: person.location),
            _Fact(label: 'Check-in', value: person.checkIn ?? 'Not recorded'),
            _Fact(label: 'Note', value: person.note ?? person.delay ?? 'Nothing extra today', last: true),
          ],
        ),
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.label, required this.value, this.last = false});
  final String label;
  final String value;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: last ? 0 : 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 72, child: Text(label, style: const TextStyle(fontSize: 13, color: AppColors.slate500))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }
}

class _Count extends StatelessWidget {
  const _Count({required this.value, required this.label, required this.color});
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: color, height: 1)),
          const SizedBox(height: 4),
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
