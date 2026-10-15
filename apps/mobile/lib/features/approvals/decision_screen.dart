import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/feedback.dart';
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
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          AppCard(
            color: AppColors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: Text(item.employee, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, height: 1.2))),
                    const SizedBox(width: 8),
                    StatusPill(label: item.status, color: colorForRequestStatus(item.status)),
                  ],
                ),
                const SizedBox(height: 4),
                Text('${item.employeeCode} · ${item.department}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                const SizedBox(height: 10),
                Text(item.summary, style: const TextStyle(fontSize: 14, height: 1.4, color: AppColors.slate700)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Label('What would change'),
          const SizedBox(height: 8),
          if (item.kind == 'Shift Swap') _SwapCompare(item: item) else _Snapshot(item: item),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 4,
                  height: 40,
                  decoration: BoxDecoration(color: item.kind == 'Overtime' ? AppColors.amber : AppColors.emerald, borderRadius: BorderRadius.circular(4)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.kind == 'Overtime'
                        ? 'Overtime above 1 hour needs a manager. The claimed time is above the calculated balance.'
                        : item.kind == 'Shift Swap'
                            ? 'Both shifts stay covered. Staffing remains within the minimum.'
                            : 'This correction stays inside the shift and does not overlap another approved leave.',
                    style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
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
                const _Step(done: true, title: 'Submitted', detail: 'The employee sent this request', color: AppColors.emerald),
                _Step(
                  current: !closed,
                  done: closed,
                  title: 'Your decision',
                  detail: closed ? item.status : 'Waiting on you',
                  color: closed ? colorForRequestStatus(item.status) : AppColors.primary,
                ),
                _Step(
                  done: item.status == 'Approved',
                  title: 'HR review',
                  detail: item.status == 'Approved' ? 'Completed' : 'Starts after you approve',
                  color: AppColors.slate400,
                  last: true,
                ),
              ],
            ),
          ),
          if (item.kind == 'Regularisation') ...[
            const SizedBox(height: 12),
            const AppCard(
              color: AppColors.white,
              padding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                children: [
                  Icon(Icons.attach_file_rounded, size: 18, color: AppColors.primary),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('File attached', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                        Text('Sent with this request', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          const _Label('Your comment'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: TextField(
              controller: _comment,
              enabled: !closed,
              maxLength: 500,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Comment for the employee',
                alignLabelWithHint: true,
                border: InputBorder.none,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    onPressed: closed ? null : () => _decide(context, item, 'Sent Back'),
                    child: const Text('Send back', maxLines: 1, softWrap: false),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose, side: const BorderSide(color: AppColors.rose)),
                    onPressed: closed ? null : () => _decide(context, item, 'Rejected'),
                    child: const Text('Reject', maxLines: 1, softWrap: false),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(
              onPressed: closed ? null : () => _decide(context, item, 'Approved'),
              child: const Text('Approve'),
            ),
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

  Future<void> _decide(BuildContext context, ApprovalItem item, String decision) async {
    final comment = _comment.text.trim();
    if (decision != 'Approved' && comment.length < 3) {
      showAppToast(context, 'Add a short comment before sending this back or rejecting it.', error: true);
      return;
    }
    final rejecting = decision == 'Rejected';
    final sendingBack = decision == 'Sent Back';
    final confirmed = await showAppConfirm(
      context,
      title: rejecting ? 'Reject this request?' : sendingBack ? 'Send this back?' : 'Approve this request?',
      message: rejecting
          ? 'This marks ${item.id} as rejected.'
          : sendingBack
              ? 'This sends ${item.id} back to the requester.'
              : 'This records an approval for ${item.id}.',
      confirmLabel: rejecting ? 'Reject' : sendingBack ? 'Send back' : 'Approve',
      danger: rejecting,
      icon: rejecting ? Icons.cancel_outlined : sendingBack ? Icons.undo_rounded : Icons.check_circle_outline,
    );
    if (!confirmed || !context.mounted) return;
    context.read<AppState>().decideApproval(item.id, decision, comment.isEmpty ? 'Approved.' : comment);
    showAppToast(context, '${item.id} marked $decision.', success: true);
    Navigator.pop(context);
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

class _Snapshot extends StatelessWidget {
  const _Snapshot({required this.item});
  final ApprovalItem item;

  @override
  Widget build(BuildContext context) {
    final sameKeys = item.original.isNotEmpty && item.original.keys.length == item.requested.keys.length && item.original.keys.every(item.requested.containsKey);
    final long = [...item.original.values, ...item.requested.values].any((value) => value.length > 24);
    return AppCard(
      color: AppColors.white,
      child: sameKeys && !long
          ? Column(
              children: [
                for (final key in item.original.keys) ...[
                  if (key != item.original.keys.first) const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider(height: 1, color: AppColors.line)),
                  Text(key, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _Value(label: 'Recorded', value: item.original[key] ?? '—'),
                      Container(width: 1, height: 36, color: AppColors.line),
                      _Value(label: 'Requested', value: item.requested[key] ?? '—', emphasize: true),
                    ],
                  ),
                ],
              ],
            )
          : Column(
              children: [
                for (final entry in item.original.entries) _Block(label: _plain(entry.key, recorded: true), value: entry.value),
                for (final entry in item.requested.entries)
                  _Block(label: _plain(entry.key, recorded: false), value: entry.value, emphasize: true, last: entry.key == item.requested.keys.last),
              ],
            ),
    );
  }

  String _plain(String key, {required bool recorded}) {
    final lower = key.toLowerCase();
    if (lower == 'original' || lower == 'record' || lower == 'recorded') return 'Recorded';
    if (lower == 'requested' || lower == 'request') return 'Requested';
    return recorded ? 'Recorded · $key' : 'Requested · $key';
  }
}

class _Value extends StatelessWidget {
  const _Value({required this.label, required this.value, this.emphasize = false});
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
          Text(value, textAlign: TextAlign.center, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: emphasize ? AppColors.primary : AppColors.slate900)),
        ],
      ),
    );
  }
}

class _Block extends StatelessWidget {
  const _Block({required this.label, required this.value, this.emphasize = false, this.last = false});
  final String label;
  final String value;
  final bool emphasize;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: last ? 0 : 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 4,
            height: 36,
            decoration: BoxDecoration(color: emphasize ? AppColors.primary : AppColors.slate400, borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
                const SizedBox(height: 2),
                Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, height: 1.3, color: emphasize ? AppColors.primary : AppColors.slate900)),
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
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
          const SizedBox(height: 8),
          for (final entry in item.original.entries) _SwapLine(name: entry.key, shift: entry.value),
          const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: AppColors.line)),
          const Text('After the swap', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
          const SizedBox(height: 8),
          for (final entry in item.requested.entries) _SwapLine(name: entry.key, shift: entry.value, emphasize: true),
        ],
      ),
    );
  }
}

class _SwapLine extends StatelessWidget {
  const _SwapLine({required this.name, required this.shift, this.emphasize = false});
  final String name;
  final String shift;
  final bool emphasize;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w700))),
          Text(shift, style: TextStyle(fontWeight: FontWeight.w700, color: emphasize ? AppColors.primary : AppColors.slate700)),
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
