import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import 'locations_screen.dart';

class LiveAttendanceScreen extends StatefulWidget {
  const LiveAttendanceScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<LiveAttendanceScreen> createState() => _LiveAttendanceScreenState();
}

class _LiveAttendanceScreenState extends State<LiveAttendanceScreen> {
  String _query = '';
  String _filter = 'All';

  @override
  Widget build(BuildContext context) {
    final people = context.watch<AppState>().org;
    final present = people.where((p) => p.status == AttendanceStatus.present).length;
    final absent = people.where((p) => p.status == AttendanceStatus.absent).length;
    final late = people.where((p) => p.status == AttendanceStatus.late).length;
    final wfh = people.where((p) => p.status == AttendanceStatus.wfh).length;
    final onLeave = people.where((p) => p.status == AttendanceStatus.onLeave).length;
    final missing = people.where((p) => p.status == AttendanceStatus.missingPunch).length;
    final inCount = present + wfh;
    final outCount = absent + onLeave + missing;

    final visible = people.where((person) {
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty ||
          person.name.toLowerCase().contains(query) ||
          person.department.toLowerCase().contains(query) ||
          person.code.toLowerCase().contains(query);
      final filterOk = switch (_filter) {
        'In' => person.status == AttendanceStatus.present || person.status == AttendanceStatus.wfh,
        'Out' => person.status == AttendanceStatus.absent || person.status == AttendanceStatus.onLeave || person.status == AttendanceStatus.missingPunch,
        'Late' => person.status == AttendanceStatus.late,
        _ => true,
      };
      return queryOk && filterOk;
    }).toList();

    final content = ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        if (!widget.embedded)
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Text('Live Attendance', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ),
        const Text("Who's in, who's out — a real-time view of your organisation.", style: TextStyle(color: AppColors.slate500, fontSize: 13)),
        const SizedBox(height: 4),
        const Text('Thu, 12 Sep 2024', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.slate700)),
        const SizedBox(height: 12),
        EqualGrid(
          columns: 3,
          rowHeight: 84,
          children: [
            MetricTile(value: '$present', label: 'Present', color: AppColors.emerald),
            MetricTile(value: '$absent', label: 'Absent', color: AppColors.rose),
            MetricTile(value: '$late', label: 'Late', color: AppColors.amber),
            MetricTile(value: '$wfh', label: 'WFH', color: AppColors.primary),
            MetricTile(value: '$onLeave', label: 'On leave', color: AppColors.purple),
            MetricTile(value: '$missing', label: 'Missing punch', color: AppColors.missing),
          ],
        ),
        const SizedBox(height: 12),
        FilterChips(
          labels: ['All ${people.length}', 'In $inCount', 'Out $outCount', 'Late $late'],
          selected: _selectedLabel(people.length, inCount, outCount, late),
          onSelected: (value) => setState(() => _filter = value.split(' ').first),
        ),
        const SizedBox(height: 10),
        TextField(
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Search by name, department, or employee ID',
          ),
          onChanged: (value) => setState(() => _query = value),
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton.icon(
            onPressed: () => openPage(context, const LocationsScreen()),
            icon: const Icon(Icons.map_outlined, size: 18),
            label: const Text('Site map'),
          ),
        ),
        Text('${visible.length} people', style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        for (final person in visible) ...[
          _PersonRow(person: person),
          const SizedBox(height: 8),
        ],
        const SizedBox(height: 4),
        const Text('Updated from the workspace sample on this device.', style: TextStyle(fontSize: 11, color: AppColors.slate400)),
      ],
    );

    if (widget.embedded) return content;
    return Scaffold(appBar: AppBar(title: const Text('Live Attendance')), body: content);
  }

  String _selectedLabel(int all, int inCount, int outCount, int late) {
    switch (_filter) {
      case 'In':
        return 'In $inCount';
      case 'Out':
        return 'Out $outCount';
      case 'Late':
        return 'Late $late';
      default:
        return 'All $all';
    }
  }
}

class _PersonRow extends StatelessWidget {
  const _PersonRow({required this.person});
  final TeamMember person;

  @override
  Widget build(BuildContext context) {
    final color = colorForStatus(person.status);
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          AvatarBadge(initials: person.initials),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(person.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                Text(
                  '${person.checkIn ?? '—'} · ${person.location}',
                  style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                ),
                if (person.note != null)
                  Text(person.note!, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
              ],
            ),
          ),
          StatusPill(label: statusLabel(person.status), color: color),
        ],
      ),
    );
  }
}
