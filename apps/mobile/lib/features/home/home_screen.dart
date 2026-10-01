import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../shared/widgets.dart';
import '../approvals/inbox_screen.dart';
import '../attendance/attendance_screen.dart';
import '../attendance/exceptions_screen.dart';
import '../regularisation/raise_screen.dart';
import '../regularisation/requests_screen.dart';
import '../team/live_attendance_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final worked = formatDuration(state.workedMinutes);
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '${DemoData.demoDateLabel} · ${DemoData.demoLocation}',
                      style: TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${greetingForNow()}, ${state.firstName}',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.3),
                    ),
                  ],
                ),
              ),
              _Bell(count: state.unreadNotifications),
              const SizedBox(width: 8),
              AvatarBadge(initials: state.initials, size: 40),
            ],
          ),
          const SizedBox(height: 12),
          if (state.connectionError != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppCard(
                color: AppColors.amberSoft,
                child: Text(state.connectionError!, style: const TextStyle(fontSize: 13, height: 1.35)),
              ),
            )
          else if (!state.syncing && state.workspaceLinked)
            const Padding(
              padding: EdgeInsets.only(bottom: 12),
              child: Text('Connected to the workspace', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.emerald)),
            ),
          if (state.syncing) const LinearProgressIndicator(minHeight: 3),
          _StatusBanner(state: state, worked: worked),
          const SizedBox(height: 14),
          EqualGrid(
            columns: 3,
            rowHeight: 104,
            children: [
              _InfoBox(title: 'Clock-in', value: state.checkedIn ? state.clockInLabel : 'Not yet', hint: 'Today'),
              const _InfoBox(title: 'Shift', value: 'General', hint: '09:00 AM – 06:00 PM'),
              _InfoBox(title: 'Worked', value: worked, hint: 'of 8h 00m'),
            ],
          ),
          const SizedBox(height: 14),
          EqualGrid(
            columns: 4,
            rowHeight: 118,
            spacing: 6,
            children: [
              _action(
                context,
                icon: state.checkedIn ? Icons.check_circle : Icons.login,
                tint: AppColors.emerald,
                label: 'Clock In',
                caption: state.checkedIn ? 'Done' : 'Start work',
                onTap: state.checkedIn || state.locating ? null : () => _clockIn(context),
              ),
              _action(
                context,
                icon: Icons.logout,
                tint: AppColors.primary,
                label: 'Clock Out',
                caption: 'End your work',
                onTap: state.checkedIn ? () => _clockOut(context) : null,
              ),
              _action(
                context,
                icon: Icons.free_breakfast_outlined,
                tint: AppColors.amber,
                label: state.onBreak ? 'End Break' : 'Break',
                caption: state.onBreak ? 'On break' : 'Start break',
                onTap: !state.checkedIn
                    ? null
                    : () {
                        final app = context.read<AppState>();
                        if (app.onBreak) {
                          app.endBreak();
                        } else {
                          app.startBreak();
                        }
                      },
              ),
              _action(
                context,
                icon: Icons.edit_note_outlined,
                tint: AppColors.indigo,
                label: 'Regularise',
                caption: 'Request change',
                onTap: () => openPage(context, const RaiseRegularisationScreen()),
              ),
            ],
          ),
          if (state.locating) ...[
            const SizedBox(height: 10),
            const LinearProgressIndicator(minHeight: 3),
          ],
          const SizedBox(height: 16),
          const _SummaryCard(),
          const SizedBox(height: 12),
          AppCard(
            onTap: () => openPage(context, const RequestsScreen(embedded: false)),
            child: const _AlertRow(
              icon: Icons.pending_actions_outlined,
              color: AppColors.primary,
              title: 'Pending requests',
              body: 'Regularisation drafts and items waiting on a manager.',
            ),
          ),
          const SizedBox(height: 8),
          AppCard(
            onTap: () => openPage(context, const ExceptionsScreen()),
            child: const _AlertRow(
              icon: Icons.warning_amber_rounded,
              color: AppColors.amber,
              title: 'Attendance exceptions',
              body: '8 exceptions need a look today.',
            ),
          ),
          const SizedBox(height: 8),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(child: Text('My Team Today', style: TextStyle(fontWeight: FontWeight.w800))),
                    TextButton(
                      onPressed: () => openPage(context, const LiveAttendanceScreen()),
                      child: const Text('View team'),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Row(
                  children: [
                    Expanded(child: _TinyStat('12', 'Present')),
                    Expanded(child: _TinyStat('2', 'Absent')),
                    Expanded(child: _TinyStat('3', 'Late')),
                    Expanded(child: _TinyStat('4', 'Pending approval')),
                  ],
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () => openPage(context, const ApprovalsInboxScreen()),
                    child: const Text('Open approvals'),
                  ),
                ),
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
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  void _clockOut(BuildContext context) {
    context.read<AppState>().clockOut();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Checked out. The punch is saved on this device.')),
    );
  }
}

class _Bell extends StatelessWidget {
  const _Bell({required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: () {
        context.read<AppState>().markNotificationsRead();
        showInfoSheet(
          context,
          title: 'Notifications',
          child: Consumer<AppState>(
            builder: (context, state, _) {
              return Column(
                children: [
                  for (final note in state.notifications)
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: Text(note.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      subtitle: Text(note.body),
                      trailing: Text(note.timeLabel, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
                    ),
                ],
              );
            },
          ),
        );
      },
      icon: Badge(
        isLabelVisible: count > 0,
        label: Text('$count'),
        child: const Icon(Icons.notifications_none),
      ),
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({required this.state, required this.worked});
  final AppState state;
  final String worked;

  @override
  Widget build(BuildContext context) {
    final checked = state.checkedIn;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)]),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Flexible(
                child: StatusPill(
                  label: checked ? (state.onBreak ? 'On break' : 'Checked in') : 'Not checked in',
                  color: AppColors.white,
                  soft: Colors.white.withValues(alpha: 0.18),
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  checked && state.insideFence ? 'On time' : (checked ? 'Needs review' : 'Start of day'),
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12),
                ),
              ),
            ],
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: () => openPage(context, const MyAttendanceScreen(showBack: true)),
              style: TextButton.styleFrom(foregroundColor: Colors.white, visualDensity: VisualDensity.compact, padding: EdgeInsets.zero),
              child: const Text('View attendance'),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            checked ? "You're all set for today!" : 'Clock in when you are ready to start.',
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            '$worked worked · ${state.locationLabel}',
            style: const TextStyle(color: Color(0xFFDBEAFE), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard();

  @override
  Widget build(BuildContext context) {
    return const AppCard(
      child: Row(
        children: [
          DonutChart(progress: 18 / 22, center: '18/22', caption: 'Days'),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Attendance rate 82%', style: TextStyle(fontWeight: FontWeight.w800)),
                SizedBox(height: 2),
                Text('↑ 6% vs last month', style: TextStyle(color: AppColors.emerald, fontSize: 12, fontWeight: FontWeight.w700)),
                SizedBox(height: 10),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    StatusPill(label: 'Present 18', color: AppColors.emerald, soft: AppColors.emeraldSoft),
                    StatusPill(label: 'Absent 2', color: AppColors.rose, soft: AppColors.roseSoft),
                    StatusPill(label: 'Late 1', color: AppColors.amber, soft: AppColors.amberSoft),
                    StatusPill(label: 'On leave 1', color: AppColors.primary, soft: Color(0xFFEFF6FF)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AlertRow extends StatelessWidget {
  const _AlertRow({required this.icon, required this.color, required this.title, required this.body});
  final IconData icon;
  final Color color;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              Text(body, style: const TextStyle(fontSize: 12, color: AppColors.slate500, height: 1.3)),
            ],
          ),
        ),
        const Icon(Icons.chevron_right, color: AppColors.slate400),
      ],
    );
  }
}

class _TinyStat extends StatelessWidget {
  const _TinyStat(this.value, this.label);
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
        Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
      ],
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
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
          Text(hint, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 10, color: AppColors.slate500)),
        ],
      ),
    );
  }
}

Widget _action(
  BuildContext context, {
  required IconData icon,
  required Color tint,
  required String label,
  required String caption,
  required VoidCallback? onTap,
}) {
  final enabled = onTap != null;
    return Opacity(
      opacity: enabled ? 1 : 0.45,
      child: AppCard(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: tint, size: 22),
            const SizedBox(height: 6),
            Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
            Text(caption, maxLines: 2, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, color: AppColors.slate500)),
          ],
        ),
      ),
    );
}
