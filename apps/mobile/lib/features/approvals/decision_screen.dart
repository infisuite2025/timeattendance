import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';

class ApprovalDecisionScreen extends StatefulWidget {
  const ApprovalDecisionScreen({super.key, required this.approvalId});

  final String approvalId;

  @override
  State<ApprovalDecisionScreen> createState() => _ApprovalDecisionScreenState();
}

class _ApprovalDecisionScreenState extends State<ApprovalDecisionScreen> {
  final _comment = TextEditingController();

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final item = state.approvals.where((a) => a.id == widget.approvalId).firstOrNull ??
        state.approvalHistory.where((a) => a.id == widget.approvalId).firstOrNull;
    if (item == null) {
      return Scaffold(appBar: AppBar(title: const Text('Approval')), body: const Center(child: Text('This approval is no longer open.')));
    }
    final closed = item.status != 'Pending';
    return Scaffold(
      appBar: AppBar(title: Text(_title(item.kind))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.employee, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                Text('${item.employeeCode} · ${item.department}', style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                const SizedBox(height: 8),
                Text(item.summary, style: const TextStyle(height: 1.35)),
                const SizedBox(height: 8),
                StatusPill(label: item.status, color: colorForRequestStatus(item.status)),
              ],
            ),
          ),
          const SizedBox(height: 10),
          if (item.kind == 'Shift Swap') _SwapCompare(item: item) else _Snapshot(item: item),
          const SizedBox(height: 10),
          AppCard(
            color: item.kind == 'Overtime' ? AppColors.amberSoft : AppColors.emeraldSoft,
            child: Text(
              item.kind == 'Overtime'
                  ? 'Policy threshold: overtime above 1h 00m needs manager approval. Claimed time is above the calculated balance.'
                  : 'Policy check: the requested correction stays inside the shift window and does not overlap another approved leave.',
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
          ),
          const SizedBox(height: 10),
          const AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Approval trail', style: TextStyle(fontWeight: FontWeight.w800)),
                SizedBox(height: 6),
                Text('Submitted by the employee'),
                Text('Waiting on you'),
                Text('HR review follows an approval'),
              ],
            ),
          ),
          if (item.kind == 'Regularisation') ...[
            const SizedBox(height: 10),
            const AppCard(child: Text('Attachment available with the request.')),
          ],
          const SizedBox(height: 12),
          TextField(
            controller: _comment,
            enabled: !closed,
            maxLength: 500,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Comment', alignLabelWithHint: true),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: OutlinedButton(onPressed: closed ? null : () => _decide(context, item, 'Sent Back'), child: const Text('Send Back'))),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose),
                  onPressed: closed ? null : () => _decide(context, item, 'Rejected'),
                  child: const Text('Reject'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(child: FilledButton(onPressed: closed ? null : () => _decide(context, item, 'Approved'), child: const Text('Approve'))),
            ],
          ),
        ],
      ),
    );
  }

  String _title(String kind) {
    switch (kind) {
      case 'Overtime':
        return 'Overtime Approval';
      case 'Shift Swap':
        return 'Shift Swap Approval';
      default:
        return 'Regularisation Approval';
    }
  }

  void _decide(BuildContext context, ApprovalItem item, String decision) {
    final comment = _comment.text.trim();
    if (decision != 'Approved' && comment.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Add a short comment before sending this back or rejecting it.')));
      return;
    }
    context.read<AppState>().decideApproval(item.id, decision, comment.isEmpty ? 'Approved.' : comment);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${item.id} marked $decision.')));
    Navigator.pop(context);
  }
}

class _Snapshot extends StatelessWidget {
  const _Snapshot({required this.item});
  final ApprovalItem item;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Original vs requested', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          const Row(
            children: [
              Expanded(child: Text('Original', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.slate500))),
              Expanded(child: Text('Requested', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.slate500))),
            ],
          ),
          const SizedBox(height: 6),
          for (final key in item.original.keys)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Expanded(child: Text('${item.original[key]}', style: const TextStyle(fontSize: 13))),
                  Expanded(child: Text(item.requested[key] ?? '—', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700))),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _SwapCompare extends StatelessWidget {
  const _SwapCompare({required this.item});
  final ApprovalItem item;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Before and after', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text('Requester: ${item.employee}'),
          for (final entry in item.original.entries) Text('Before ${entry.key}: ${entry.value}'),
          for (final entry in item.requested.entries) Text('After ${entry.key}: ${entry.value}', style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          const Text('Coverage stays filled. Staffing on both shifts remains within the minimum.', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
