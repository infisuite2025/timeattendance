import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../app/navigation.dart';
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
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          const PageIntro(title: 'More', subtitle: 'Approvals, rostering, sites, and your session.'),
          const SizedBox(height: 16),
          AppCard(
            child: Row(
              children: [
                AvatarBadge(initials: state.initials, size: 44),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(state.displayName, style: const TextStyle(fontWeight: FontWeight.w800)),
                      Text(
                        '${DemoData.currentUserCode} · ${state.organization}',
                        style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _group(context, 'Approvals', [
            _item(context, Icons.fact_check_outlined, 'My Approvals', pending == 0 ? 'Inbox is clear' : '$pending waiting', const ApprovalsInboxScreen()),
            _item(context, Icons.history, 'Approval History', 'Closed requests and turnaround', const ApprovalHistoryScreen()),
            _item(context, Icons.report_gmailerrorred_outlined, 'Exceptions', 'Anomalies that need a review', const ExceptionsScreen()),
          ]),
          const SizedBox(height: 12),
          _group(context, 'Shifts', [
            _item(context, Icons.swap_horiz, 'Shift Swaps', 'Pending and approved swaps', const ShiftSwapsScreen()),
            _item(context, Icons.library_books_outlined, 'Shift Library', 'Configured shifts and grace rules', const ShiftLibraryScreen()),
            _item(context, Icons.groups_2_outlined, 'Shift Groups', 'Fixed and rotational patterns', const ShiftGroupsScreen()),
            _item(context, Icons.calendar_view_week, 'Team Schedule', 'This week’s roster', const TeamScheduleScreen()),
            _item(context, Icons.person_add_alt_1_outlined, 'Assign Shift', 'Apply a shift to people', const ShiftAssignmentScreen()),
            _item(context, Icons.add_circle_outline, 'Create Shift', 'Add a shift to the library', const CreateShiftScreen()),
          ]),
          const SizedBox(height: 12),
          _group(context, 'Sites', [
            _item(context, Icons.map_outlined, 'Locations', 'Sites, headcount, and geofence alerts', const LocationsScreen()),
          ]),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () => context.read<AppState>().signOut(),
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
          ),
        ],
      ),
    );
  }

  Widget _group(BuildContext context, String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionLabel(title),
        const SizedBox(height: 8),
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(children: children),
        ),
      ],
    );
  }

  Widget _item(BuildContext context, IconData icon, String title, String subtitle, Widget page) {
    return ListTile(
      leading: Icon(icon, color: AppColors.primary),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => openPage(context, page),
    );
  }
}
