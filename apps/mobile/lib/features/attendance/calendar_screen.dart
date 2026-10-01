import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import 'day_detail_screen.dart';

bool _sameMonth(DateTime month, DateTime loaded) => month.year == loaded.year && month.month == loaded.month;

class CalendarScreen extends StatelessWidget {
  const CalendarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final month = state.calendarMonth;
    final counts = _counts(state, month);
    final selected = _sameMonth(month, state.loadedMonth) ? state.day(state.selectedDay) : null;

    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Calendar')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          const Text('View your daily attendance and schedule.', style: TextStyle(color: AppColors.slate500)),
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton(onPressed: () => context.read<AppState>().shiftMonth(-1), icon: const Icon(Icons.chevron_left)),
              Expanded(
                child: Text(monthTitle(month), textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
              ),
              IconButton(onPressed: () => context.read<AppState>().shiftMonth(1), icon: const Icon(Icons.chevron_right)),
            ],
          ),
          const SizedBox(height: 8),
          AppCard(
            child: Column(
              children: [
                Row(
                  children: [
                    for (final label in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
                      Expanded(
                        child: Center(
                          child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.slate400)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                _MonthGrid(month: month, state: state),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Wrap(
            spacing: 10,
            runSpacing: 8,
            children: [
              _Legend(DayKind.present, 'Present'),
              _Legend(DayKind.late, 'Late'),
              _Legend(DayKind.leave, 'Leave'),
              _Legend(DayKind.wfh, 'WFH'),
              _Legend(DayKind.holiday, 'Holiday'),
              _Legend(DayKind.weeklyOff, 'Weekly Off'),
              _Legend(DayKind.halfDay, 'Half Day'),
            ],
          ),
          const SizedBox(height: 14),
          if (_sameMonth(month, state.loadedMonth))
            Row(
              children: [
                for (final entry in counts.entries)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 3),
                      child: MetricTile(
                        value: '${entry.value}',
                        label: dayKindLabel(entry.key),
                        color: colorForKind(entry.key),
                      ),
                    ),
                  ),
              ],
            )
          else
            const AppCard(child: Text('No attendance has been recorded for this month on this device.')),
          const SizedBox(height: 14),
          if (selected != null) _SelectedDay(day: selected),
        ],
      ),
    );
  }

  Map<DayKind, int> _counts(AppState state, DateTime month) {
    if (!_sameMonth(month, state.loadedMonth)) return {};
    final map = <DayKind, int>{};
    for (final day in state.september.values) {
      if (day.kind == DayKind.weeklyOff || day.kind == DayKind.holiday || day.kind == DayKind.halfDay) continue;
      map[day.kind] = (map[day.kind] ?? 0) + 1;
    }
    return {
      DayKind.present: map[DayKind.present] ?? 0,
      DayKind.late: map[DayKind.late] ?? 0,
      DayKind.wfh: map[DayKind.wfh] ?? 0,
      DayKind.leave: map[DayKind.leave] ?? 0,
    };
  }
}

class _MonthGrid extends StatelessWidget {
  const _MonthGrid({required this.month, required this.state});
  final DateTime month;
  final AppState state;

  @override
  Widget build(BuildContext context) {
    final firstWeekday = DateTime(month.year, month.month, 1).weekday;
    final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
    final leading = firstWeekday - 1;
    final total = leading + daysInMonth;
    final cells = total + ((7 - total % 7) % 7);
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: cells,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7, mainAxisSpacing: 6, crossAxisSpacing: 6),
      itemBuilder: (context, index) {
        final dayNumber = index - leading + 1;
        if (dayNumber < 1 || dayNumber > daysInMonth) return const SizedBox.shrink();
        final known = _sameMonth(month, state.loadedMonth);
        final kind = known ? state.september[dayNumber]?.kind ?? DayKind.present : DayKind.weeklyOff;
        final color = known ? colorForKind(kind) : AppColors.slate400;
        final selected = known && state.selectedDay == dayNumber;
        return InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: known
              ? () => context.read<AppState>().selectDay(dayNumber)
              : null,
          child: Container(
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: selected ? color : Colors.transparent, width: 1.4),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('$dayNumber', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color)),
                Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _Legend extends StatelessWidget {
  const _Legend(this.kind, this.label);
  final DayKind kind;
  final String label;

  @override
  Widget build(BuildContext context) => legendDot(colorForKind(kind), label);
}

class _SelectedDay extends StatelessWidget {
  const _SelectedDay({required this.day});
  final DayAttendance day;

  @override
  Widget build(BuildContext context) {
    final color = colorForKind(day.kind);
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(prettyDay(day.day), style: const TextStyle(fontWeight: FontWeight.w800))),
              StatusPill(label: dayKindLabel(day.kind), color: color),
            ],
          ),
          const SizedBox(height: 8),
          Text(day.shift, style: const TextStyle(fontSize: 13, color: AppColors.slate700)),
          const SizedBox(height: 6),
          Text(
            'In ${day.inTime ?? '—'}  ·  Out ${day.outTime ?? '—'}  ·  ${day.hours ?? '—'}',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          if (day.reason != null) ...[
            const SizedBox(height: 6),
            Text(day.reason!, style: const TextStyle(fontSize: 13, color: AppColors.slate500, height: 1.35)),
          ],
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: () => openPage(context, DayDetailScreen(day: day.day)),
              child: const Text('Open day detail'),
            ),
          ),
        ],
      ),
    );
  }
}
