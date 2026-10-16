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
          const Text('Each colour is a kind of day. Tap a date to read it.', style: TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate500)),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              children: [
                IconButton(onPressed: () => context.read<AppState>().shiftMonth(-1), icon: const Icon(Icons.chevron_left)),
                Expanded(
                  child: Text(monthTitle(month), textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                ),
                IconButton(onPressed: () => context.read<AppState>().shiftMonth(1), icon: const Icon(Icons.chevron_right)),
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
          const AppCard(
            color: AppColors.white,
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Wrap(
              spacing: 12,
              runSpacing: 8,
              children: [
                _Legend(DayKind.present, 'Present'),
                _Legend(DayKind.late, 'Late'),
                _Legend(DayKind.leave, 'Leave'),
                _Legend(DayKind.wfh, 'WFH'),
                _Legend(DayKind.holiday, 'Holiday'),
                _Legend(DayKind.weeklyOff, 'Off'),
                _Legend(DayKind.halfDay, 'Half day'),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (_sameMonth(month, state.loadedMonth))
            AppCard(
              color: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              child: Row(
                children: [
                  for (final entry in counts.entries)
                    Expanded(
                      child: Column(
                        children: [
                          Text('${entry.value}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: colorForKind(entry.key), height: 1)),
                          const SizedBox(height: 4),
                          Text(dayKindLabel(entry.key), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
                        ],
                      ),
                    ),
                ],
              ),
            )
          else
            const AppCard(color: AppColors.white, child: Text('No attendance has been recorded for this month on this device.')),
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
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected ? color : AppColors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: selected ? color : AppColors.line),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('$dayNumber', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: selected ? AppColors.white : AppColors.slate900)),
                const SizedBox(height: 3),
                Container(width: 5, height: 5, decoration: BoxDecoration(color: selected ? AppColors.white : color, shape: BoxShape.circle)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _TimeBit extends StatelessWidget {
  const _TimeBit({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.slate500)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
        ],
      ),
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
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(day.displayDate ?? prettyDay(day.day, month: context.watch<AppState>().loadedMonth), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700))),
              StatusPill(label: dayKindLabel(day.kind), color: color),
            ],
          ),
          const SizedBox(height: 6),
          Text(day.shift, style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
          const SizedBox(height: 12),
          Row(
            children: [
              _TimeBit(label: 'In', value: day.inTime ?? '—'),
              _TimeBit(label: 'Out', value: day.outTime ?? '—'),
              _TimeBit(label: 'Hours', value: day.hours ?? '—'),
            ],
          ),
          if (day.reason != null) ...[
            const SizedBox(height: 10),
            Text(day.reason!, style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate700)),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => openPage(context, DayDetailScreen(day: day.day)),
              child: const Text('Open this day'),
            ),
          ),
        ],
      ),
    );
  }
}
