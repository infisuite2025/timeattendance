import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import 'detail_screen.dart';
import 'history_screen.dart';
import 'raise_screen.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({super.key, this.embedded = true});

  final bool embedded;

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  String _query = '';
  String _status = 'All';
  bool _latestFirst = true;

  @override
  Widget build(BuildContext context) {
    final requests = context.watch<AppState>().requests;
    int count(String status) => requests.where((r) => r.status == status).length;
    final visible = requests.where((request) {
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty ||
          request.type.toLowerCase().contains(query) ||
          request.reason.toLowerCase().contains(query) ||
          request.id.toLowerCase().contains(query);
      final statusOk = _status == 'All' || request.status == _status;
      return queryOk && statusOk;
    }).toList();
    if (!_latestFirst) {
      visible.sort((a, b) => a.dateLabel.compareTo(b.dateLabel));
    }

    final body = ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        if (widget.embedded) ...[
          const PageIntro(title: 'Requests', subtitle: 'Correct a punch, then follow it until a manager decides.'),
          const SizedBox(height: 16),
        ],
        SizedBox(
          width: double.infinity,
          height: 48,
          child: FilledButton.icon(
            onPressed: () => openPage(context, const RaiseRegularisationScreen()),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Raise Request'),
          ),
        ),
        const SizedBox(height: 16),
        AppCard(
          color: AppColors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Column(
            children: [
              Row(
                children: [
                  _Count(value: '${count('Pending')}', label: 'Pending', color: AppColors.primary),
                  _Count(value: '${count('Approved')}', label: 'Approved', color: AppColors.emerald),
                  _Count(value: '${count('Sent Back')}', label: 'Sent back', color: AppColors.amber),
                  _Count(value: '${requests.length}', label: 'Total', color: AppColors.slate900),
                ],
              ),
              if (count('Draft') > 0 || count('Rejected') > 0) ...[
                const Divider(height: 22, color: AppColors.line),
                Row(
                  children: [
                    _Count(value: '${count('Draft')}', label: 'Draft', color: AppColors.slate500),
                    _Count(value: '${count('Rejected')}', label: 'Rejected', color: AppColors.rose),
                    _Count(value: '${count('Withdrawn')}', label: 'Withdrawn', color: AppColors.slate500),
                    const Expanded(child: SizedBox.shrink()),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search type, reason, or ID'),
          onChanged: (value) => setState(() => _query = value),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: AppDropdown<String>(
                value: _status,
                label: 'Status',
                items: const [
                  DropdownMenuItem(value: 'All', child: Text('All')),
                  DropdownMenuItem(value: 'Draft', child: Text('Draft')),
                  DropdownMenuItem(value: 'Pending', child: Text('Pending')),
                  DropdownMenuItem(value: 'Approved', child: Text('Approved')),
                  DropdownMenuItem(value: 'Rejected', child: Text('Rejected')),
                  DropdownMenuItem(value: 'Sent Back', child: Text('Sent Back')),
                  DropdownMenuItem(value: 'Withdrawn', child: Text('Withdrawn')),
                ],
                onChanged: (value) => setState(() => _status = value ?? 'All'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: AppDropdown<bool>(
                value: _latestFirst,
                label: 'Sort',
                items: const [
                  DropdownMenuItem(value: true, child: Text('Latest first')),
                  DropdownMenuItem(value: false, child: Text('Oldest first')),
                ],
                onChanged: (value) => setState(() => _latestFirst = value ?? true),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        AppCard(
          color: AppColors.white,
          onTap: () => openPage(context, const RegularisationHistoryScreen()),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: const Row(
            children: [
              Icon(Icons.insights_outlined, color: AppColors.primary, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('History and trends', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    Text('How many requests were approved over recent months', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: AppColors.slate400, size: 20),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          visible.isEmpty ? 'No matches' : '${visible.length} ${visible.length == 1 ? 'request' : 'requests'}',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500),
        ),
        const SizedBox(height: 8),
        if (visible.isEmpty)
          const AppCard(color: AppColors.white, child: Text('Nothing matches this search or status.'))
        else
          for (final request in visible) ...[
            _RequestTile(request: request),
            const SizedBox(height: 8),
          ],
      ],
    );

    if (widget.embedded) return SafeArea(child: body);
    return Scaffold(appBar: AppBar(title: const Text('Requests')), body: body);
  }
}

class _RequestTile extends StatelessWidget {
  const _RequestTile({required this.request});
  final RegularisationRequest request;

  @override
  Widget build(BuildContext context) {
    final color = colorForRequestStatus(request.status);
    return AppCard(
      color: AppColors.white,
      onTap: () => _actions(context),
      padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, height: 52, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(request.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(request.type, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('${request.location} · ${request.timings}', style: const TextStyle(fontSize: 12, color: AppColors.slate700)),
                const SizedBox(height: 2),
                Text(request.reason, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, height: 1.3, color: AppColors.slate500)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusPill(label: request.status, color: color),
              const Icon(Icons.chevron_right, color: AppColors.slate400),
            ],
          ),
        ],
      ),
    );
  }

  void _actions(BuildContext context) {
    final canEdit = request.status == 'Draft' || request.status == 'Sent Back';
    showAppSheet<void>(
      context,
      title: request.type,
      message: '${request.id} · ${request.dateLabel}',
      builder: (sheetContext) => OptionGroup(
        children: [
          SheetChoiceTile(
            icon: Icons.visibility_outlined,
            title: 'View details',
            subtitle: 'Reason, times, and where it sits in approval',
            onTap: () {
              Navigator.pop(sheetContext);
              openPage(context, RegularisationDetailScreen(requestId: request.id));
            },
          ),
          SheetChoiceTile(
            icon: Icons.copy_rounded,
            title: 'Duplicate',
            subtitle: 'Start a new request from this one',
            onTap: () async {
              final copy = await context.read<AppState>().duplicateRequest(request.id);
              if (!sheetContext.mounted) return;
              Navigator.pop(sheetContext);
              if (copy != null && context.mounted) openPage(context, RaiseRegularisationScreen(requestId: copy.id));
            },
          ),
          if (canEdit)
            SheetChoiceTile(
              icon: Icons.edit_outlined,
              title: 'Edit request',
              subtitle: 'Change it before a manager decides',
              onTap: () {
                Navigator.pop(sheetContext);
                openPage(context, RaiseRegularisationScreen(requestId: request.id));
              },
            ),
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
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
