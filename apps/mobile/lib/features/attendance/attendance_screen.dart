import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import '../regularisation/raise_screen.dart';
import 'calendar_screen.dart';
import 'day_detail_screen.dart';
import 'punch_timeline_screen.dart';

class MyAttendanceScreen extends StatelessWidget {
  const MyAttendanceScreen({super.key, this.showBack = false});

  final bool showBack;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final recent = [16, 13, 12, 11, 10];
    final body = ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        PageIntro(
          title: 'My Attendance',
          subtitle: prettyDay(17),
        ),
        const SizedBox(height: 14),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Text("Today's status", style: TextStyle(fontWeight: FontWeight.w800)),
                  const Spacer(),
                  StatusPill(
                    label: state.checkedIn ? 'Present' : (state.clockOutLabel != null ? 'Checked out' : 'Not in'),
                    color: state.checkedIn ? AppColors.emerald : AppColors.slate500,
                    soft: state.checkedIn ? AppColors.emeraldSoft : AppColors.slate100,
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                state.checkedIn ? 'You are checked in' : 'You are not checked in',
                style: const TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              const SizedBox(height: 4),
              const Text('General Shift  09:00 AM – 06:00 PM', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            ],
          ),
        ),
        const SizedBox(height: 10),
        EqualGrid(
          columns: 2,
          rowHeight: 104,
          children: [
            _InfoBox(title: 'Check-in', value: state.checkedIn || state.clockOutLabel != null ? state.clockInLabel : '—', hint: 'Today'),
            _InfoBox(title: 'Check-out', value: state.clockOutLabel ?? 'Yet to check out', hint: 'Today'),
            _InfoBox(title: 'Working hours', value: formatDuration(state.workedMinutes), hint: 'As of now'),
            _InfoBox(title: 'Break', value: state.breakLabel, hint: state.onBreak ? 'In progress' : 'Logged'),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: FilledButton(
                onPressed: state.checkedIn ? () => context.read<AppState>().clockOut() : (state.locating ? null : () => context.read<AppState>().clockIn()),
                child: Text(state.checkedIn ? 'Check Out' : 'Check In'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton(
                onPressed: state.onBreak ? () => context.read<AppState>().endBreak() : null,
                child: const Text('End Break'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const SectionLabel('Quick hub'),
        const SizedBox(height: 8),
        EqualGrid(
          columns: 2,
          rowHeight: 96,
          children: [
            _hub(context, Icons.calendar_month_outlined, 'My Calendar', 'View calendar', const CalendarScreen()),
            _hub(context, Icons.timeline, 'Day Detail', 'In, out, hours, breaks', const DayDetailScreen(day: 12)),
            _hub(context, Icons.list_alt, 'Punch Timeline', 'All punch activity', const PunchTimelineScreen(day: 12)),
            _hub(context, Icons.edit_note_outlined, 'Raise Regularisation', 'Missed punch or correction', const RaiseRegularisationScreen()),
          ],
        ),
        const SizedBox(height: 16),
        const AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Weekly summary', style: TextStyle(fontWeight: FontWeight.w800)),
              SizedBox(height: 4),
              Text('Hours recorded this week', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
              SizedBox(height: 12),
              SizedBox(
                height: 110,
                child: MiniBars(
                  values: [8.1, 9.0, 8.2, 7.5, 2.6],
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const SectionLabel('Recent attendance'),
        const SizedBox(height: 8),
        for (final day in recent) ...[
          _RecentRow(day: state.day(day)),
          const SizedBox(height: 8),
        ],
      ],
    );

    if (!showBack) return SafeArea(child: body);
    return Scaffold(
      appBar: AppBar(title: const Text('My Attendance')),
      body: body,
    );
  }
}

class _RecentRow extends StatelessWidget {
  const _RecentRow({required this.day});
  final DayAttendance day;

  @override
  Widget build(BuildContext context) {
    final color = colorForKind(day.kind);
    return AppCard(
      onTap: () => openPage(context, DayDetailScreen(day: day.day)),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Icon(Icons.schedule, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(prettyDay(day.day), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                Text(
                  day.hours ?? day.reason ?? day.shift,
                  style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                ),
              ],
            ),
          ),
          StatusPill(label: dayKindLabel(day.kind), color: color),
        ],
      ),
    );
  }
}

class _InfoBox extends StatelessWidget {
  const _InfoBox({required this.title, required this.value, required this.hint});

  final String title;
  final String value;
  final String hint;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.slate500, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(value, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
          Text(hint, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
        ],
      ),
    );
  }
}

Widget _hub(BuildContext context, IconData icon, String title, String subtitle, Widget page) {
  return AppCard(
    onTap: () => openPage(context, page),
    padding: const EdgeInsets.all(12),
    child: Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
              Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
            ],
          ),
        ),
      ],
    ),
  );
}
