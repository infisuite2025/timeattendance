import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/feedback.dart';
import '../../shared/widgets.dart';
import 'decision_screen.dart';
import 'history_screen.dart';

class ApprovalsInboxScreen extends StatefulWidget {
  const ApprovalsInboxScreen({super.key});

  @override
  State<ApprovalsInboxScreen> createState() => _ApprovalsInboxScreenState();
}

class _ApprovalsInboxScreenState extends State<ApprovalsInboxScreen> {
  String _tab = 'All';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final pending = state.approvals;
    final high = pending.where((a) => a.priority == 'High').length;
    final approvedToday = state.approvalHistory.where((a) => a.status == 'Approved' && a.turnaround == 'Just now').length;
    final sentBack = state.approvalHistory.where((a) => a.status == 'Sent Back').length;

    final visible = pending.where((item) => _tab == 'All' || _tab == 'History' || item.kind == _kindFor(_tab)).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Approvals')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          const Text('Decide the attendance requests waiting from your team.', style: TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate500)),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '${pending.length}', label: 'Pending', color: AppColors.primary),
                _Count(value: '$high', label: 'High', color: AppColors.rose),
                _Count(value: '$approvedToday', label: 'Today', color: AppColors.emerald),
                _Count(value: '$sentBack', label: 'Sent back', color: AppColors.amber),
              ],
            ),
          ),
          if (pending.isNotEmpty) ...[
            const SizedBox(height: 12),
            AppCard(
              color: AppColors.white,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 4, height: 36, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '${pending.length} ${pending.length == 1 ? 'request needs' : 'requests need'} a decision. $high ${high == 1 ? 'is' : 'are'} high priority.',
                      style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          FilterChips(
            labels: const [
              'All',
              'Regularisation',
              'Overtime',
              'Shift Swap',
              'History',
            ],
            selected: _tab,
            onSelected: (value) => setState(() => _tab = value),
          ),
          const SizedBox(height: 12),
          if (_tab == 'History')
            ...[
              for (final item in state.approvalHistory) _HistoryPeek(item: item),
              const SizedBox(height: 4),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  onPressed: () => openPage(context, const ApprovalHistoryScreen()),
                  child: const Text('Open full history'),
                ),
              ),
            ]
          else if (visible.isEmpty)
            const AppCard(color: AppColors.white, child: Text('Nothing is waiting in this tab.'))
          else
            for (final item in visible) ...[
              _ApprovalCard(item: item),
              const SizedBox(height: 8),
            ],
        ],
      ),
    );
  }

  String _kindFor(String tab) {
    if (tab == 'Overtime') return 'Overtime';
    if (tab == 'Shift Swap') return 'Shift Swap';
    return 'Regularisation';
  }
}

class _ApprovalCard extends StatelessWidget {
  const _ApprovalCard({required this.item});
  final ApprovalItem item;

  @override
  Widget build(BuildContext context) {
    final accent = item.priority == 'High' ? AppColors.rose : AppColors.primary;
    return AppCard(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(width: 4, height: 42, decoration: BoxDecoration(color: accent, borderRadius: BorderRadius.circular(4))),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(item.employee, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text('${item.kind} · ${item.summary}', style: const TextStyle(fontSize: 12, height: 1.3, color: AppColors.slate500)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              StatusPill(label: item.priority, color: accent),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: OutlinedButton(onPressed: () => openPage(context, ApprovalDecisionScreen(approvalId: item.id)), child: const Text('View'))),
              const SizedBox(width: 6),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose, side: const BorderSide(color: AppColors.rose)),
                  onPressed: () => _quick(context, 'Rejected'),
                  child: const Text('Reject'),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: FilledButton(
                  onPressed: () async {
                    final confirmed = await showAppConfirm(
                      context,
                      title: 'Approve request?',
                      message: 'Approve ${item.id} for ${item.employee}? This records an approval.',
                      confirmLabel: 'Approve',
                      icon: Icons.check_circle_outline,
                    );
                    if (!confirmed || !context.mounted) return;
                    _quick(context, 'Approved');
                  },
                  child: const Text('Approve'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _quick(BuildContext context, String decision) async {
    var comment = decision == 'Approved' ? 'Approved from the inbox.' : '';
    if (decision == 'Rejected') {
      final controller = TextEditingController();
      final ok = await showDialog<bool>(
        context: context,
        builder: (context) => AppDialog(
          title: 'Reject request?',
          message: 'A comment is required before this request is rejected.',
          icon: Icons.cancel_outlined,
          accent: AppColors.rose,
          alignCenter: false,
          body: TextField(controller: controller, maxLength: 500, decoration: const InputDecoration(labelText: 'Comment')),
          actions: [
            OutlinedButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppColors.rose),
              onPressed: () => Navigator.pop(context, controller.text.trim().isNotEmpty),
              child: const Text('Reject'),
            ),
          ],
        ),
      );
      comment = controller.text.trim();
      controller.dispose();
      if (ok != true) return;
    }
    if (!context.mounted) return;
    context.read<AppState>().decideApproval(item.id, decision, comment);
    showAppToast(context, '${item.id} marked $decision.', success: true);
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
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}

class _HistoryPeek extends StatelessWidget {
  const _HistoryPeek({required this.item});
  final ApprovalItem item;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        color: AppColors.white,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.employee, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  Text('${item.kind} · ${item.id}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                ],
              ),
            ),
            StatusPill(label: item.status, color: colorForRequestStatus(item.status)),
          ],
        ),
      ),
    );
  }
}
