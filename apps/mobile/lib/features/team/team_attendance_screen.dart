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
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        const Text("View your team's attendance and status today.", style: TextStyle(color: AppColors.slate500, fontSize: 13)),
        const SizedBox(height: 4),
        const Text('12 Sep 2024 (Thu)', style: TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        EqualGrid(
          columns: 3,
          rowHeight: 84,
          children: [
            MetricTile(value: '${count(AttendanceStatus.present)}', label: 'Present', color: AppColors.emerald),
            MetricTile(value: '${count(AttendanceStatus.absent)}', label: 'Absent', color: AppColors.rose),
            MetricTile(value: '${count(AttendanceStatus.late)}', label: 'Late', color: AppColors.amber),
            MetricTile(value: '${count(AttendanceStatus.onLeave)}', label: 'On leave', color: AppColors.purple),
            MetricTile(value: '${count(AttendanceStatus.wfh)}', label: 'WFH', color: AppColors.primary),
            MetricTile(value: '${people.length}', label: 'Team size', color: AppColors.slate700),
          ],
        ),
        const SizedBox(height: 12),
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
            color: AppColors.amberSoft,
            child: Text(
              '$attention members need attention. Review late arrivals and missing punches.',
              style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate700),
            ),
          ),
        ],
        const SizedBox(height: 12),
        for (final person in visible) ...[
          _TeamCard(person: person, shift: state.shiftFor(person)),
          const SizedBox(height: 8),
        ],
        if (visible.isEmpty) const AppCard(child: Text('Nobody matches this filter.')),
      ],
    );

    if (widget.embedded) return content;
    return Scaffold(appBar: AppBar(title: const Text('Team Attendance')), body: content);
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
    return AppCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AvatarBadge(initials: person.initials),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(person.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                Text('${person.code} · ${person.department}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                Text('$shift · ${person.checkIn ?? 'No check-in'}', style: const TextStyle(fontSize: 12)),
                if (person.delay != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: StatusPill(label: person.delay!, color: AppColors.amber, soft: AppColors.amberSoft),
                  ),
              ],
            ),
          ),
          Column(
            children: [
              StatusPill(label: statusLabel(person.status), color: colorForStatus(person.status)),
              IconButton(
                onPressed: () {
                  showInfoSheet(
                    context,
                    title: person.name,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${person.code} · ${person.department}'),
                        const SizedBox(height: 6),
                        Text('Shift: $shift'),
                        Text('Site: ${person.location}'),
                        Text(person.note ?? 'No extra note.'),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.more_horiz),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
