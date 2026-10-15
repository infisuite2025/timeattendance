import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../shared/feedback.dart';
import '../../shared/widgets.dart';
import '../approvals/history_screen.dart';
import '../approvals/inbox_screen.dart';
import '../attendance/exceptions_screen.dart';
import '../shifts/shift_screens.dart';
import '../team/locations_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final pending = state.approvals.length;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          const PageIntro(title: 'More', subtitle: 'Approvals, shifts, sites, and your session.'),
          const SizedBox(height: 16),
          AppCard(
            color: AppColors.white,
            child: Row(
              children: [
                AvatarBadge(initials: state.initials, size: 48),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(state.displayName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(state.email, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate700)),
                      const SizedBox(height: 2),
                      Text(
                        [
                          if (state.role.isNotEmpty) state.role,
                          if (state.employeeCode.isNotEmpty) state.employeeCode else if (state.employeeId.isNotEmpty) state.employeeId,
                          if (state.organization.isNotEmpty) state.organization,
                        ].join(' · '),
                        style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (state.canManageTeam) ...[
            const _Label('Approvals'),
            const SizedBox(height: 8),
            _Menu(
              children: [
                _Row(
                  icon: Icons.fact_check_outlined,
                  title: 'My Approvals',
                  subtitle: pending == 0 ? 'Inbox is clear' : '$pending waiting',
                  badge: pending == 0 ? null : '$pending',
                  onTap: () => openPage(context, const ApprovalsInboxScreen()),
                ),
                _Row(
                  icon: Icons.history,
                  title: 'Approval History',
                  subtitle: 'Closed requests and turnaround',
                  onTap: () => openPage(context, const ApprovalHistoryScreen()),
                ),
                _Row(
                  icon: Icons.report_gmailerrorred_outlined,
                  title: 'Exceptions',
                  subtitle: 'Anomalies that need a review',
                  onTap: () => openPage(context, const ExceptionsScreen()),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
          const _Label('Shifts'),
          const SizedBox(height: 8),
          _Menu(
            children: [
              if (state.canManageTeam) _Row(icon: Icons.swap_horiz, title: 'Shift Swaps', subtitle: 'Pending and approved swaps', onTap: () => openPage(context, const ShiftSwapsScreen())),
              _Row(icon: Icons.library_books_outlined, title: 'Shift Library', subtitle: 'Configured shifts and grace rules', onTap: () => openPage(context, const ShiftLibraryScreen())),
              if (state.canAdminister) _Row(icon: Icons.groups_2_outlined, title: 'Shift Groups', subtitle: 'Fixed and rotational patterns', onTap: () => openPage(context, const ShiftGroupsScreen())),
              _Row(icon: Icons.calendar_view_week, title: state.canManageTeam ? 'Team Schedule' : 'My Schedule', subtitle: 'This week’s roster', onTap: () => openPage(context, const TeamScheduleScreen())),
              if (state.canAdminister) _Row(icon: Icons.person_add_alt_1_outlined, title: 'Assign Shift', subtitle: 'Apply a shift to people', onTap: () => openPage(context, const ShiftAssignmentScreen())),
              if (state.canAdminister) _Row(icon: Icons.add_circle_outline, title: 'Create Shift', subtitle: 'Add a shift to the library', onTap: () => openPage(context, const CreateShiftScreen())),
            ],
          ),
          const SizedBox(height: 16),
          if (state.canManageTeam) ...[
            const _Label('Sites'),
            const SizedBox(height: 8),
            _Menu(
              children: [
                _Row(icon: Icons.map_outlined, title: 'Locations', subtitle: 'Sites, headcount, and geofence alerts', onTap: () => openPage(context, const LocationsScreen())),
              ],
            ),
          ],
          const SizedBox(height: 16),
          const _Label('Account'),
          const SizedBox(height: 8),
          _Menu(
            children: [
              _Row(
                icon: Icons.person_remove_outlined,
                title: 'Delete account',
                subtitle: 'Permanently remove this account',
                tone: AppColors.rose,
                onTap: () => _deleteAccount(context),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose, side: const BorderSide(color: AppColors.rose)),
              onPressed: () async {
                final confirmed = await showAppConfirm(
                  context,
                  title: 'Sign out?',
                  message: 'Are you sure you want to sign out? You will need to sign in again to open this workspace.',
                  confirmLabel: 'Sign out',
                  danger: true,
                  icon: Icons.logout_rounded,
                );
                if (!confirmed || !context.mounted) return;
                context.read<AppState>().signOut();
              },
              icon: const Icon(Icons.logout),
              label: const Text('Sign out'),
            ),
          ),
        ],
      ),
    );
  }
}

Future<void> _deleteAccount(BuildContext context) async {
  final confirmed = await showAppConfirm(
    context,
    title: 'Delete account?',
    message: 'This permanently deletes your InfiTimePro account. You will be signed out of this device.',
    confirmLabel: 'Delete account',
    danger: true,
    icon: Icons.person_remove_outlined,
  );
  if (!confirmed || !context.mounted) return;
  await context.read<AppState>().signOut(
        notice: 'Your request has been received. We will delete this account shortly.',
      );
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500, letterSpacing: 0.2));
  }
}

class _Menu extends StatelessWidget {
  const _Menu({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      color: AppColors.white,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const Divider(height: 1, color: AppColors.line),
            children[i],
          ],
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.title, required this.subtitle, required this.onTap, this.badge, this.tone = AppColors.primary});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final String? badge;
  final Color tone;

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
              decoration: BoxDecoration(color: tone.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, size: 18, color: tone),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                ],
              ),
            ),
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: const Color(0xFFE8F0FE), borderRadius: BorderRadius.circular(999)),
                child: Text(badge!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ),
              const SizedBox(width: 4),
            ],
            const Icon(Icons.chevron_right, color: AppColors.slate400, size: 20),
          ],
        ),
      ),
    );
  }
}
