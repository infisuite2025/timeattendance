import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import '../regularisation/raise_screen.dart';
import '../shifts/shift_screens.dart';

class DayDetailScreen extends StatelessWidget {
  const DayDetailScreen({super.key, required this.day});

  final int day;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final record = state.day(day.clamp(1, 30));
    final punches = [
      if ((record.inTime ?? '').isNotEmpty && record.inTime != '—')
        PunchEvent(timeLabel: record.inTime!, type: 'Check-in', source: 'Workspace', place: record.shift, validity: 'Valid'),
      if ((record.outTime ?? '').isNotEmpty && record.outTime != '—' && record.outTime != '--')
        PunchEvent(timeLabel: record.outTime!, type: 'Check-out', source: 'Workspace', place: record.shift, validity: 'Valid'),
    ];
    final color = colorForKind(record.kind);
    final problem = record.kind == DayKind.late || record.kind == DayKind.missing || record.kind == DayKind.halfDay;
    return Scaffold(
      appBar: AppBar(title: const Text('Day detail')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              children: [
                IconButton(onPressed: day > 1 ? () => _go(context, day - 1) : null, icon: const Icon(Icons.chevron_left)),
                Expanded(child: Text(record.displayDate ?? prettyDay(day, month: state.loadedMonth), textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16))),
                IconButton(onPressed: day < 30 ? () => _go(context, day + 1) : null, icon: const Icon(Icons.chevron_right)),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            color: AppColors.white,
            child: Row(
              children: [
                AvatarBadge(initials: state.initials, size: 42),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(state.displayName, style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text(state.employeeId, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                    ],
                  ),
                ),
                StatusPill(label: kindLabel(record.kind), color: color),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            color: AppColors.white,
            child: Column(
              children: [
                Row(
                  children: [
                    _Bit(label: 'In', value: record.inTime ?? '—', color: AppColors.primary),
                    _Bit(label: 'Out', value: record.outTime ?? '—', color: AppColors.indigo),
                    _Bit(label: 'Hours', value: record.hours ?? '—', color: AppColors.emerald),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            color: AppColors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Shift', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
                const SizedBox(height: 4),
                Text(record.shift, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(onPressed: () => openPage(context, const ShiftLibraryScreen()), child: const Text('View shift library')),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('Timeline', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 8),
          if (punches.isEmpty)
            const AppCard(color: AppColors.white, child: Text('No punches were recorded for this day.'))
          else
            AppCard(
              color: AppColors.white,
              child: Column(
                children: [
                  for (var i = 0; i < punches.length; i++)
                    _Step(time: punches[i].timeLabel, title: punches[i].type, subtitle: '${punches[i].place} · ${punches[i].source}', last: i == punches.length - 1),
                ],
              ),
            ),
          const SizedBox(height: 10),
          AppCard(
            color: AppColors.white,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(width: 4, height: 36, decoration: BoxDecoration(color: problem ? AppColors.amber : AppColors.emerald, borderRadius: BorderRadius.circular(4))),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    problem
                        ? (record.reason ?? 'This day is outside the grace window.')
                        : 'No policy issue. Marked ${kindLabel(record.kind).toLowerCase()}${record.hours == null ? '' : ' · ${record.hours} worked'}.',
                    style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => openPage(context, RaiseRegularisationScreen(dateLabel: (record.displayDate ?? prettyDay(day, month: state.loadedMonth)).replaceAll(',', ''))),
            icon: const Icon(Icons.edit_note_rounded),
            label: const Text('Regularise this day'),
          ),
        ],
      ),
    );
  }

  void _go(BuildContext context, int next) {
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => DayDetailScreen(day: next)));
  }
}

class _Bit extends StatelessWidget {
  const _Bit({required this.label, required this.value, required this.color});
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.time, required this.title, required this.subtitle, required this.last});
  final String time;
  final String title;
  final String subtitle;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
              if (!last) Expanded(child: Container(width: 2, color: AppColors.slate200)),
            ],
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(time, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
