import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/feedback.dart';
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
    final recent = state.september.values.toList()..sort((a, b) => b.day.compareTo(a.day));
    final worked = formatDuration(state.workedMinutes);
    final body = ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        if (!showBack) ...[
          const PageIntro(title: 'My Attendance', subtitle: 'Your days, hours, and punches.'),
          const SizedBox(height: 16),
        ],
        _TodayRecord(state: state, worked: worked),
        const SizedBox(height: 20),
        const _Section('Look closer'),
        const SizedBox(height: 8),
        const _Hub(),
        const SizedBox(height: 20),
        const _Section('This week'),
        const SizedBox(height: 8),
        const _WeekCard(),
        const SizedBox(height: 20),
        const _Section('Recent days'),
        const SizedBox(height: 8),
        for (final day in recent.take(5)) ...[
          _RecentRow(day: day),
          const SizedBox(height: 8),
        ],
      ],
    );

    if (!showBack) return SafeArea(child: body);
    return Scaffold(appBar: AppBar(title: const Text('My Attendance')), body: body);
  }
}

class _TodayRecord extends StatelessWidget {
  const _TodayRecord({required this.state, required this.worked});

  final AppState state;
  final String worked;

  @override
  Widget build(BuildContext context) {
    final checked = state.checkedIn;
    final status = !checked ? (state.clockOutLabel != null ? 'Checked out' : 'Not in') : (state.onBreak ? 'On a break' : 'Present');
    final statusColor = !checked ? AppColors.slate700 : (state.onBreak ? AppColors.amber : AppColors.emerald);
    final statusSoft = !checked ? AppColors.slate100 : (state.onBreak ? AppColors.amberSoft : AppColors.emeraldSoft);
    return AppCard(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Today', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const Spacer(),
              StatusPill(label: status, color: statusColor, soft: statusSoft),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            checked ? 'You are on the clock.' : 'You are not clocked in right now.',
            style: const TextStyle(fontSize: 13, color: AppColors.slate500),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _Fact(label: 'In', value: checked || state.clockOutLabel != null ? state.clockInLabel : '—'),
              _rule(),
              _Fact(label: 'Out', value: state.clockOutLabel ?? '—'),
              _rule(),
              _Fact(label: 'Worked', value: worked),
            ],
          ),
          const SizedBox(height: 12),
          Text('Break  ·  ${state.breakLabel}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate700)),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton.icon(
              onPressed: state.locating
                  ? null
                  : () {
                      if (checked) {
                        context.read<AppState>().clockOut();
                        showAppToast(context, 'Checked out. The punch is saved for this employee.', success: true);
                      } else {
                        _clockIn(context);
                      }
                    },
              style: FilledButton.styleFrom(
                backgroundColor: checked ? AppColors.slate900 : AppColors.emerald,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: Icon(checked ? Icons.logout_rounded : Icons.login_rounded, size: 18),
              label: Text(checked ? 'Clock out' : 'Clock in'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _clockIn(BuildContext context) async {
    final message = await context.read<AppState>().clockIn();
    if (!context.mounted) return;
    final checkedIn = context.read<AppState>().checkedIn;
    showAppToast(context, message, success: checkedIn, error: !checkedIn);
  }

  Widget _rule() => Container(width: 1, height: 32, color: AppColors.line);
}

class _Hub extends StatelessWidget {
  const _Hub();

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.white,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _NavRow(
            icon: Icons.calendar_month_outlined,
            color: AppColors.primary,
            title: 'Calendar',
            body: 'See present, late, leave, and weekly offs',
            onTap: () => openPage(context, const CalendarScreen()),
          ),
          const Divider(height: 1, color: AppColors.line),
          _NavRow(
            icon: Icons.today_outlined,
            color: AppColors.indigo,
            title: 'Day detail',
            body: 'Hours, shift, and the punch story for one day',
            onTap: () => openPage(context, DayDetailScreen(day: DateTime.now().day)),
          ),
          const Divider(height: 1, color: AppColors.line),
          _NavRow(
            icon: Icons.timeline,
            color: AppColors.emerald,
            title: 'Punch timeline',
            body: 'Every raw punch, including flagged ones',
            onTap: () => openPage(context, PunchTimelineScreen(day: DateTime.now().day)),
          ),
          const Divider(height: 1, color: AppColors.line),
          _NavRow(
            icon: Icons.edit_note_rounded,
            color: AppColors.amber,
            title: 'Regularise',
            body: 'Ask a manager to correct a missing or wrong punch',
            onTap: () => openPage(context, const RaiseRegularisationScreen()),
          ),
        ],
      ),
    );
  }
}

class _WeekCard extends StatelessWidget {
  const _WeekCard();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final now = DateTime.now();
    final monday = DateTime(now.year, now.month, now.day).subtract(Duration(days: now.weekday - 1));
    final values = <double>[];
    for (var i = 0; i < 5; i++) {
      final day = monday.add(Duration(days: i));
      final sameMonth = state.loadedMonth.year == day.year && state.loadedMonth.month == day.month;
      values.add(sameMonth ? state.day(day.day).minutes / 60 : 0);
    }
    final totalMinutes = values.fold<double>(0, (sum, hours) => sum + hours * 60).round();
    return AppCard(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Hours recorded', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              const Spacer(),
              Text(formatDuration(totalMinutes), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 4),
          const Text('Monday to Friday from saved punches', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
          const SizedBox(height: 12),
          SizedBox(
            height: 110,
            child: MiniBars(values: values, labels: const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
          ),
        ],
      ),
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
      color: AppColors.white,
      onTap: () => openPage(context, DayDetailScreen(day: day.day)),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
            child: Text('${day.day}', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(day.displayDate ?? prettyDay(day.day, month: context.watch<AppState>().loadedMonth), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                const SizedBox(height: 2),
                Text(day.hours ?? day.reason ?? day.shift, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          StatusPill(label: kindLabel(day.kind), color: color),
        ],
      ),
    );
  }
}

class _NavRow extends StatelessWidget {
  const _NavRow({required this.icon, required this.color, required this.title, required this.body, required this.onTap});

  final IconData icon;
  final Color color;
  final String title;
  final String body;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 1),
                  Text(body, style: const TextStyle(fontSize: 12, height: 1.3, color: AppColors.slate500)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.slate400, size: 20),
          ],
        ),
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500, letterSpacing: 0.2));
  }
}
