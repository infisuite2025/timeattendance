import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
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
          const Text('Review and take action on attendance requests from your team.', style: TextStyle(color: AppColors.slate500)),
          const SizedBox(height: 12),
          EqualGrid(
            columns: 2,
            rowHeight: 84,
            children: [
              MetricTile(value: '${pending.length}', label: 'Pending', color: AppColors.primary),
              MetricTile(value: '$high', label: 'High priority', color: AppColors.rose),
              MetricTile(value: '$approvedToday', label: 'Approved today', color: AppColors.emerald),
              MetricTile(value: '$sentBack', label: 'Sent back', color: AppColors.amber),
            ],
          ),
          if (pending.isNotEmpty) ...[
            const SizedBox(height: 12),
            AppCard(
              color: const Color(0xFFEFF6FF),
              child: Text(
                '${pending.length} approvals need your action. $high high priority requests are waiting.',
                style: const TextStyle(fontSize: 13, height: 1.35),
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
              TextButton(onPressed: () => openPage(context, const ApprovalHistoryScreen()), child: const Text('Open full history')),
            ]
          else if (visible.isEmpty)
            const AppCard(child: Text('Nothing is waiting in this tab.'))
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
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(item.id, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.indigo, fontSize: 12)),
              const SizedBox(width: 8),
              StatusPill(label: item.priority, color: item.priority == 'High' ? AppColors.rose : AppColors.slate500),
              const Spacer(),
              Text(item.dateLabel, style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
            ],
          ),
          const SizedBox(height: 6),
          Text(item.employee, style: const TextStyle(fontWeight: FontWeight.w800)),
          Text('${item.kind} · ${item.summary}', style: const TextStyle(fontSize: 13, color: AppColors.slate700)),
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
              Expanded(child: FilledButton(onPressed: () => _quick(context, 'Approved'), child: const Text('Approve'))),
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
        builder: (context) => AlertDialog(
          title: const Text('Reject request'),
          content: TextField(controller: controller, maxLength: 500, decoration: const InputDecoration(labelText: 'Comment')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim().isNotEmpty), child: const Text('Reject')),
          ],
        ),
      );
      comment = controller.text.trim();
      controller.dispose();
      if (ok != true) return;
    }
    if (!context.mounted) return;
    context.read<AppState>().decideApproval(item.id, decision, comment);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${item.id} marked $decision.')));
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
        child: Row(
          children: [
            Expanded(child: Text('${item.id} · ${item.employee}', style: const TextStyle(fontWeight: FontWeight.w700))),
            StatusPill(label: item.status, color: colorForRequestStatus(item.status)),
          ],
        ),
      ),
    );
  }
}
