import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../shared/feedback.dart';
import '../../shared/widgets.dart';
import 'raise_screen.dart';

class RegularisationDetailScreen extends StatelessWidget {
  const RegularisationDetailScreen({super.key, required this.requestId});

  final String requestId;

  @override
  Widget build(BuildContext context) {
    final request = context.watch<AppState>().requests.where((r) => r.id == requestId).firstOrNull;
    if (request == null) {
      return Scaffold(appBar: AppBar(title: const Text('Request')), body: const Center(child: Text('This request is no longer on the device.')));
    }
    final color = colorForRequestStatus(request.status);
    final canEdit = request.status == 'Draft' || request.status == 'Sent Back';
    final pending = request.status == 'Pending';
    final parts = request.employeeName.trim().split(RegExp(r'\s+'));
    final initials = parts.take(2).map((part) => part.isEmpty ? '' : part[0]).join().toUpperCase();

    return Scaffold(
      appBar: AppBar(title: const Text('Request')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          AppCard(
            color: AppColors.white,
            child: Row(
              children: [
                AvatarBadge(initials: initials.isEmpty ? '—' : initials),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.employeeName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text('${request.employeeCode} · ${request.department}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                      const SizedBox(height: 2),
                      Text(request.id, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                StatusPill(label: request.status, color: color),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Label('What was asked'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: Column(
              children: [
                _Fact(label: 'Type', value: request.type),
                _Fact(label: 'Date', value: request.dateLabel),
                _Fact(label: 'Issue', value: request.issue),
                _Fact(label: 'Location', value: request.location, last: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Label('Times'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: Row(
              children: [
                _TimeBit(label: 'Recorded', value: request.actualTime),
                Container(width: 1, height: 36, color: AppColors.line),
                _TimeBit(label: 'Requested', value: request.correctedTime, emphasize: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Label('Reason'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: Text(request.reason, style: const TextStyle(fontSize: 14, height: 1.45, color: AppColors.slate700)),
          ),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Icon(
                  request.attachment == null ? Icons.attach_file_rounded : Icons.description_outlined,
                  size: 20,
                  color: request.attachment == null ? AppColors.slate400 : AppColors.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.attachment ?? 'No file attached', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      Text(
                        request.attachment == null ? 'This request was sent without a document' : 'Attached with the request',
                        style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Label('Approval'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: Column(
              children: [
                _Step(done: true, title: 'Submitted', detail: request.createdLabel, color: AppColors.emerald),
                _Step(
                  done: request.status == 'Approved' || request.status == 'Rejected',
                  current: pending || request.status == 'Sent Back',
                  title: 'Manager review',
                  detail: request.status == 'Approved'
                      ? 'Approved'
                      : request.status == 'Rejected'
                          ? 'Rejected'
                          : request.status == 'Sent Back'
                              ? 'Sent back to you'
                              : 'Waiting for a manager',
                  color: color,
                ),
                _Step(
                  done: request.status == 'Approved',
                  title: 'HR review',
                  detail: request.status == 'Approved' ? 'Completed' : 'Starts after the manager decides',
                  color: AppColors.slate400,
                  last: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (canEdit)
            SizedBox(
              width: double.infinity,
              height: 48,
              child: FilledButton.icon(
                onPressed: () => openPage(context, RaiseRegularisationScreen(requestId: request.id)),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit request'),
              ),
            ),
          if (pending) ...[
            if (canEdit) const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose, side: const BorderSide(color: AppColors.rose)),
                onPressed: () async {
                  final confirmed = await showAppConfirm(
                    context,
                    title: 'Withdraw request?',
                    message: 'This removes ${request.id} from the approval queue. You can raise it again later.',
                    confirmLabel: 'Withdraw',
                    danger: true,
                    icon: Icons.undo_rounded,
                  );
                  if (!confirmed || !context.mounted) return;
                  context.read<AppState>().withdrawRequest(request.id);
                  showAppToast(context, 'Request withdrawn.', success: true);
                },
                icon: const Icon(Icons.undo_rounded),
                label: const Text('Withdraw request'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500, letterSpacing: 0.2));
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.label, required this.value, this.last = false});
  final String label;
  final String value;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: last ? 0 : 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 88, child: Text(label, style: const TextStyle(fontSize: 13, color: AppColors.slate500))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
        ],
      ),
    );
  }
}

class _TimeBit extends StatelessWidget {
  const _TimeBit({required this.label, required this.value, this.emphasize = false});
  final String label;
  final String value;
  final bool emphasize;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: emphasize ? AppColors.primary : AppColors.slate900)),
        ],
      ),
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.title, required this.detail, required this.color, this.done = false, this.current = false, this.last = false});
  final String title;
  final String detail;
  final Color color;
  final bool done;
  final bool current;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final dot = done || current ? color : AppColors.slate400;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 22,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  margin: const EdgeInsets.only(top: 3),
                  decoration: BoxDecoration(color: done || current ? dot : AppColors.white, shape: BoxShape.circle, border: Border.all(color: dot, width: 2)),
                ),
                if (!last) Expanded(child: Container(width: 2, color: AppColors.line)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: last ? 0 : 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: current ? color : AppColors.slate900)),
                  const SizedBox(height: 2),
                  Text(detail, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
