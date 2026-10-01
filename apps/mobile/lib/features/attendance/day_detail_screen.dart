import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import '../regularisation/raise_screen.dart';
import '../shifts/shift_screens.dart';

class DayDetailScreen extends StatelessWidget {
  const DayDetailScreen({super.key, required this.day});

  final int day;

  @override
  Widget build(BuildContext context) {
    final record = context.watch<AppState>().day(day.clamp(1, 30));
    final punches = DemoData.punchesFor(record);
    final color = colorForKind(record.kind);
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Day Detail')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          const Text('View your attendance, shift and timeline for the selected date.', style: TextStyle(color: AppColors.slate500)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: day > 1 ? () => _go(context, day - 1) : null,
                icon: const Icon(Icons.chevron_left),
              ),
              Text(prettyDay(day), style: const TextStyle(fontWeight: FontWeight.w800)),
              IconButton(
                onPressed: day < 30 ? () => _go(context, day + 1) : null,
                icon: const Icon(Icons.chevron_right),
              ),
            ],
          ),
          AppCard(
            child: Row(
              children: [
                const AvatarBadge(initials: 'PN', size: 42),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(DemoData.currentUserName, style: TextStyle(fontWeight: FontWeight.w800)),
                      Text('${DemoData.currentUserCode} · HR Bangalore', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                    ],
                  ),
                ),
                StatusPill(label: dayKindLabel(record.kind), color: color),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Shift information', style: TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text(record.shift, style: const TextStyle(fontSize: 13)),
                const Text('Break 01h 00m · Late grace 15 mins · Early exit grace 15 mins', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                TextButton(onPressed: () => openPage(context, const ShiftLibraryScreen()), child: const Text('View shift')),
              ],
            ),
          ),
          const SizedBox(height: 10),
          EqualGrid(
            columns: 3,
            rowHeight: 88,
            children: [
              MetricTile(value: record.inTime ?? '—', label: 'In time', color: AppColors.primary),
              MetricTile(value: record.outTime ?? '—', label: 'Out time', color: AppColors.indigo),
              MetricTile(value: record.hours ?? '—', label: 'Total hours', color: AppColors.emerald),
              const MetricTile(value: '8h 00m', label: 'Regular hours', color: AppColors.slate700),
              MetricTile(value: record.kind == DayKind.present ? '1h 07m' : '0h 00m', label: 'Overtime', color: AppColors.amber),
              const MetricTile(value: '1h 00m', label: 'Break', color: AppColors.purple),
            ],
          ),
          const SizedBox(height: 14),
          const SectionLabel('Day timeline'),
          const SizedBox(height: 8),
          if (punches.isEmpty)
            const AppCard(child: Text('No punches were recorded for this day.'))
          else
            AppCard(
              child: Column(
                children: [
                  for (var i = 0; i < punches.length; i++)
                    _Step(title: '${punches[i].timeLabel}  ${punches[i].type}', subtitle: '${punches[i].place} · ${punches[i].source}', last: i == punches.length - 1),
                ],
              ),
            ),
          const SizedBox(height: 10),
          AppCard(
            color: AppColors.emeraldSoft,
            child: Text(
              record.kind == DayKind.late || record.kind == DayKind.missing || record.kind == DayKind.halfDay
                  ? 'Policy note: ${record.reason ?? 'This day is outside the grace window.'}'
                  : 'No policy violation detected. Attendance is marked ${dayKindLabel(record.kind).toLowerCase()}${record.hours == null ? '' : '. You worked ${record.hours}'}.' ,
              style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            onPressed: () => openPage(context, RaiseRegularisationScreen(dateLabel: prettyDay(day).replaceAll(',', ''))),
            icon: const Icon(Icons.add),
            label: const Text('Raise Regularisation'),
          ),
        ],
      ),
    );
  }

  void _go(BuildContext context, int next) {
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => DayDetailScreen(day: next)));
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.title, required this.subtitle, required this.last});
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
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
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
