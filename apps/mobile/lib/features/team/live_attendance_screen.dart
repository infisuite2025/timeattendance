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
                  _Count(value: '$present', label: 'Present', color: AppColors.emerald),
                  _Count(value: '$absent', label: 'Absent', color: AppColors.rose),
                  _Count(value: '$late', label: 'Late', color: AppColors.amber),
                ],
              ),
              const Divider(height: 22, color: AppColors.line),
              Row(
                children: [
                  _Count(value: '$wfh', label: 'WFH', color: AppColors.primary),
                  _Count(value: '$onLeave', label: 'On leave', color: AppColors.purple),
                  _Count(value: '$missing', label: 'Missing', color: AppColors.missing),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        FilterChips(
          labels: ['All ${people.length}', 'In $inCount', 'Out $outCount', 'Late $late'],
          selected: _selectedLabel(people.length, inCount, outCount, late),
          onSelected: (value) => setState(() => _filter = value.split(' ').first),
        ),
        const SizedBox(height: 10),
        TextField(
          decoration: const InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Search name, department, or ID',
          ),
          onChanged: (value) => setState(() => _query = value),
        ),
        const SizedBox(height: 10),
        AppCard(
          color: AppColors.white,
          onTap: () => openPage(context, const LocationsScreen()),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: const Row(
            children: [
              Icon(Icons.map_outlined, color: AppColors.primary, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Site map', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    Text('Where people are checked in across offices', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: AppColors.slate400, size: 20),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          visible.isEmpty ? 'No matches' : '${visible.length} ${visible.length == 1 ? 'person' : 'people'}',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500),
        ),
        const SizedBox(height: 8),
        if (visible.isEmpty)
          const AppCard(color: AppColors.white, child: Text('Nobody matches this search or filter.'))
        else
          for (final person in visible) ...[
            _PersonRow(person: person),
            const SizedBox(height: 8),
          ],
      ],
    );

    if (widget.embedded) return content;
    return Scaffold(appBar: AppBar(title: const Text('Live')), body: content);
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
      color: AppColors.white,
      padding: const EdgeInsets.fromLTRB(14, 12, 12, 12),
      child: Row(
        children: [
          Container(width: 4, height: 48, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          AvatarBadge(initials: person.initials),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(person.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('${person.checkIn ?? 'No check-in'} · ${person.location}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                if (person.note != null) ...[
                  const SizedBox(height: 2),
                  Text(person.note!, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          StatusPill(label: statusLabel(person.status), color: color),
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
