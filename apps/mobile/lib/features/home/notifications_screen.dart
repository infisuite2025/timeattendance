import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final notes = state.notifications;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (state.unreadNotifications > 0)
            TextButton(
              onPressed: () => context.read<AppState>().markNotificationsRead(),
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: notes.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: Text(
                  'You are all caught up. New approvals, exceptions, and shift updates will show up here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, height: 1.4, color: AppColors.slate500),
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              itemCount: notes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final note = notes[index];
                return _NotificationCard(
                  note: note,
                  onTap: () => context.read<AppState>().markNotificationRead(index),
                );
              },
            ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.note, required this.onTap});

  final AppNotification note;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final style = _styleFor(note.title);
    return Material(
      color: note.read ? AppColors.white : const Color(0xFFF8FBFF),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: note.read ? AppColors.line : AppColors.primary.withValues(alpha: 0.35)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: style.soft, borderRadius: BorderRadius.circular(12)),
                  child: Icon(style.icon, color: style.color, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(note.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                          ),
                          const SizedBox(width: 8),
                          Text(note.timeLabel, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.slate500)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(note.body, style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate700)),
                      if (!note.read) ...[
                        const SizedBox(height: 8),
                        const Text('Unread', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NoteStyle {
  const _NoteStyle(this.icon, this.color, this.soft);
  final IconData icon;
  final Color color;
  final Color soft;
}

_NoteStyle _styleFor(String title) {
  final text = title.toLowerCase();
  if (text.contains('regular')) {
    return const _NoteStyle(Icons.edit_note_rounded, AppColors.indigo, AppColors.purpleSoft);
  }
  if (text.contains('exception') || text.contains('attention')) {
    return const _NoteStyle(Icons.warning_amber_rounded, AppColors.amber, AppColors.amberSoft);
  }
  if (text.contains('shift')) {
    return const _NoteStyle(Icons.calendar_month_outlined, AppColors.primary, Color(0xFFEFF6FF));
  }
  return const _NoteStyle(Icons.notifications_none_rounded, AppColors.slate700, AppColors.slate100);
}
