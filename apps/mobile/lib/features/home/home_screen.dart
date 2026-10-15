import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/feedback.dart';
import '../../shared/widgets.dart';
import '../approvals/inbox_screen.dart';
import '../attendance/attendance_screen.dart';
import '../attendance/exceptions_screen.dart';
import '../regularisation/raise_screen.dart';
import '../regularisation/requests_screen.dart';
import '../team/live_attendance_screen.dart';
import 'notifications_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final worked = formatDuration(state.workedMinutes);
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          _Header(state: state),
          if (state.connectionError != null) ...[
            const SizedBox(height: 12),
            AppCard(
              color: AppColors.amberSoft,
              child: Text(state.connectionError!, style: const TextStyle(fontSize: 13, height: 1.35)),
            ),
          ],
          if (state.syncing) ...[
            const SizedBox(height: 12),
            const LinearProgressIndicator(minHeight: 3),
          ],
          const SizedBox(height: 16),
          _PunchCard(state: state, worked: worked),
          const SizedBox(height: 20),
          const _SectionTitle('Today'),
          const SizedBox(height: 8),
          _TodayCard(state: state, worked: worked),
          const SizedBox(height: 20),
          const _SectionTitle('This month'),
          const SizedBox(height: 8),
          const _MonthCard(),
          const SizedBox(height: 20),
          const _SectionTitle('Needs attention'),
          const SizedBox(height: 8),
          const _AttentionCard(),
          if (state.canManageTeam) ...[
            const SizedBox(height: 20),
            const _SectionTitle('My team today'),
            const SizedBox(height: 8),
            const _TeamCard(),
          ],
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.state});
  final AppState state;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${greetingForNow()}, ${state.firstName}',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: AppColors.slate900),
              ),
              const SizedBox(height: 2),
              Text(
                formatToday(),
                style: const TextStyle(fontSize: 13, color: AppColors.slate500, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
        _Bell(count: state.unreadNotifications),
        const SizedBox(width: 4),
        AvatarBadge(initials: state.initials, size: 40),
      ],
    );
  }
}

class _PunchCard extends StatelessWidget {
  const _PunchCard({required this.state, required this.worked});
  final AppState state;
  final String worked;

  @override
  Widget build(BuildContext context) {
    final checked = state.checkedIn;
    final onBreak = state.onBreak;
    final outside = !state.insideFence || state.locationLabel.toLowerCase().startsWith('outside');
    final accent = !checked ? AppColors.emerald : (onBreak ? AppColors.amber : AppColors.primary);
    final status = !checked ? 'Not clocked in' : (onBreak ? 'On a break' : 'Clocked in');
    final detail = !checked
        ? 'You have not started yet. Clock in to begin today.'
        : onBreak
            ? 'Paused since your break. End the break when you are back.'
            : 'Started at ${state.clockInLabel}. Clock out when the day is done.';

    return AppCard(
      color: AppColors.white,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(height: 5, decoration: BoxDecoration(color: accent, borderRadius: const BorderRadius.vertical(top: Radius.circular(16)))),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
          Row(
            children: [
              Flexible(
                child: StatusPill(
                  label: status,
                  color: !checked ? AppColors.slate700 : (onBreak ? AppColors.amber : AppColors.emerald),
                  soft: !checked ? AppColors.slate100 : (onBreak ? AppColors.amberSoft : AppColors.emeraldSoft),
                ),
              ),
              TextButton(
                onPressed: () => openPage(context, const MyAttendanceScreen(showBack: true)),
                style: TextButton.styleFrom(visualDensity: VisualDensity.compact, padding: const EdgeInsets.symmetric(horizontal: 8)),
                child: const Text('Attendance'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text('WORKED TODAY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.8, color: AppColors.slate500)),
          const SizedBox(height: 4),
          Text(worked, style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w700, height: 1, letterSpacing: -1, color: AppColors.slate900)),
          const SizedBox(height: 8),
          Text(detail, style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate700)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (state.assignedShift.isNotEmpty)
                _MetaChip(
                  icon: Icons.schedule_rounded,
                  label: state.assignedShift,
                  color: AppColors.primary,
                  soft: const Color(0xFFEFF6FF),
                ),
              if (state.locationLabel.isNotEmpty)
              _MetaChip(
                icon: Icons.place_outlined,
                label: state.locationLabel,
                color: outside ? AppColors.amber : AppColors.emerald,
                soft: outside ? AppColors.amberSoft : AppColors.emeraldSoft,
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton.icon(
              onPressed: state.locating
                  ? null
                  : () {
                      if (checked) {
                        _clockOut(context);
                      } else {
                        _clockIn(context);
                      }
                    },
              style: FilledButton.styleFrom(
                backgroundColor: checked ? AppColors.slate900 : AppColors.emerald,
                disabledBackgroundColor: AppColors.slate200,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              icon: Icon(checked ? Icons.logout_rounded : Icons.login_rounded, size: 20),
              label: Text(state.locating ? 'Finding location…' : (checked ? 'Clock out' : 'Clock in')),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: !checked
                      ? null
                      : () {
                          final app = context.read<AppState>();
                          if (app.onBreak) {
                            app.endBreak();
                          } else {
                            app.startBreak();
                          }
                        },
                  icon: Icon(onBreak ? Icons.play_arrow_rounded : Icons.free_breakfast_outlined, size: 18),
                  label: Text(onBreak ? 'End break' : 'Break'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => openPage(context, const RaiseRegularisationScreen()),
                  icon: const Icon(Icons.edit_note_rounded, size: 18),
                  label: const Text('Regularise'),
                ),
              ),
            ],
          ),
          if (!checked) ...[
            const SizedBox(height: 8),
            const Text('Break opens after clock in. Regularise fixes a missing or wrong punch.', style: TextStyle(fontSize: 12, height: 1.35, color: AppColors.slate500)),
          ],
          if (state.locating) ...[
            const SizedBox(height: 10),
            const LinearProgressIndicator(minHeight: 3),
          ],
              ],
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

  void _clockOut(BuildContext context) {
    context.read<AppState>().clockOut();
    showAppToast(context, 'Checked out. The punch is saved for this employee.', success: true);
  }
}

class _TodayCard extends StatelessWidget {
  const _TodayCard({required this.state, required this.worked});
  final AppState state;
  final String worked;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.white,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      child: Row(
        children: [
          _Fact(label: 'Clock-in', value: state.clockInLabel == '—' || state.clockInLabel.isEmpty ? 'Not yet' : state.clockInLabel),
          _rule(),
          _Fact(label: 'Shift', value: state.assignedShift.isEmpty ? '—' : state.assignedShift),
          _rule(),
          _Fact(label: 'Worked', value: worked),
        ],
      ),
    );
  }

  Widget _rule() => Container(width: 1, height: 36, color: AppColors.line);
}

class _MonthCard extends StatelessWidget {
  const _MonthCard();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return AppCard(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Attendance', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              const Spacer(),
              Text('${state.monthRate}%', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.emerald)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _Count(value: '${state.monthPresent}', label: 'Present', color: AppColors.emerald),
              _Count(value: '${state.monthAbsent}', label: 'Absent', color: AppColors.rose),
              _Count(value: '${state.monthLate}', label: 'Late', color: AppColors.amber),
              _Count(value: '${state.monthLeave}', label: 'Leave', color: AppColors.primary),
            ],
          ),
        ],
      ),
    );
  }
}

class _AttentionCard extends StatelessWidget {
  const _AttentionCard();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return AppCard(
      color: AppColors.white,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _LinkRow(
            icon: Icons.pending_actions_outlined,
            color: AppColors.primary,
            title: 'Pending requests',
            body: state.canManageTeam ? 'Requests waiting for your decision' : 'Your own corrections, waiting on a manager',
            onTap: () => openPage(context, const RequestsScreen(embedded: false)),
          ),
          if (state.canManageTeam) ...[
            const Divider(height: 1, thickness: 1, color: AppColors.line),
            _LinkRow(
              icon: Icons.warning_amber_rounded,
              color: AppColors.amber,
              title: 'Exceptions',
              body: state.exceptions.isEmpty ? 'No open exceptions' : '${state.exceptions.length} need a look',
              onTap: () => openPage(context, const ExceptionsScreen()),
            ),
          ],
        ],
      ),
    );
  }
}

class _TeamCard extends StatelessWidget {
  const _TeamCard();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final people = state.team.isNotEmpty ? state.team : state.org;
    final present = people.where((person) => person.status == AttendanceStatus.present || person.status == AttendanceStatus.wfh).length;
    final absent = people.where((person) => person.status == AttendanceStatus.absent).length;
    final late = people.where((person) => person.status == AttendanceStatus.late).length;
    final waiting = state.approvals.length;
    return AppCard(
      color: AppColors.white,
      padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
      child: Column(
        children: [
          Row(
            children: [
              const Expanded(child: Text('Who is in', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700))),
              TextButton(
                onPressed: () => openPage(context, const LiveAttendanceScreen()),
                child: const Text('See all'),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Row(
              children: [
                _Count(value: '$present', label: 'Present', color: AppColors.emerald),
                _Count(value: '$absent', label: 'Absent', color: AppColors.rose),
                _Count(value: '$late', label: 'Late', color: AppColors.amber),
              ],
            ),
          ),
          const Divider(height: 16, thickness: 1, color: AppColors.line),
          _LinkRow(
            icon: Icons.fact_check_outlined,
            color: AppColors.primary,
            title: waiting == 0 ? 'No approvals waiting' : '$waiting approvals waiting',
            body: 'Open the inbox to review them',
            onTap: () => openPage(context, const ApprovalsInboxScreen()),
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label, required this.color, required this.soft});

  final IconData icon;
  final String label;
  final Color color;
  final Color soft;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: soft, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 240),
            child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: color)),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500, letterSpacing: 0.2));
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
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w500)),
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
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}

class _LinkRow extends StatelessWidget {
  const _LinkRow({required this.icon, required this.color, required this.title, required this.body, required this.onTap});
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
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                  const SizedBox(height: 1),
                  Text(body, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
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

class _Bell extends StatelessWidget {
  const _Bell({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () => openPage(context, const NotificationsScreen()),
      icon: Badge(
        isLabelVisible: count > 0,
        label: Text('$count'),
        child: const Icon(Icons.notifications_none),
      ),
    );
  }
}
