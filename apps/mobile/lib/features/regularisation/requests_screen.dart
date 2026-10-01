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
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        const Row(
          children: [
            Expanded(
              child: PageIntro(
                title: 'Requests',
                subtitle: 'View and manage your attendance regularisation requests.',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: () => openPage(context, const RaiseRegularisationScreen()),
          icon: const Icon(Icons.add),
          label: const Text('Raise Request'),
        ),
        const SizedBox(height: 12),
        EqualGrid(
          columns: 3,
          rowHeight: 84,
          children: [
            MetricTile(value: '${count('Draft')}', label: 'Draft', color: AppColors.slate500),
            MetricTile(value: '${count('Pending')}', label: 'Pending', color: AppColors.primary),
            MetricTile(value: '${count('Approved')}', label: 'Approved', color: AppColors.emerald),
            MetricTile(value: '${count('Rejected')}', label: 'Rejected', color: AppColors.rose),
            MetricTile(value: '${count('Sent Back')}', label: 'Sent back', color: AppColors.amber),
            MetricTile(value: '${requests.length}', label: 'Total', color: AppColors.slate700),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search type, reason, or ID'),
          onChanged: (value) => setState(() => _query = value),
        ),
        const SizedBox(height: 8),
        EqualGrid(
          columns: 2,
          rowHeight: 84,
          children: [
            AppDropdown<String>(
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
            AppDropdown<bool>(
              value: _latestFirst,
              label: 'Sort',
              items: const [
                DropdownMenuItem(value: true, child: Text('Latest first')),
                DropdownMenuItem(value: false, child: Text('Oldest first')),
              ],
              onChanged: (value) => setState(() => _latestFirst = value ?? true),
            ),
          ],
        ),
        Align(
          alignment: Alignment.centerLeft,
          child: TextButton(onPressed: () => openPage(context, const RegularisationHistoryScreen()), child: const Text('History and trends')),
        ),
        if (visible.isEmpty)
          const AppCard(child: Text('No requests match this filter.'))
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
    return AppCard(
      onTap: () => _actions(context),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(request.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(request.type, style: const TextStyle(fontWeight: FontWeight.w800)),
                Text('${request.location} · ${request.timings}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                Text(request.reason, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            children: [
              StatusPill(label: request.status, color: colorForRequestStatus(request.status)),
              const Icon(Icons.chevron_right, color: AppColors.slate400),
            ],
          ),
        ],
      ),
    );
  }

  void _actions(BuildContext context) {
    showInfoSheet(
      context,
      title: request.id,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              openPage(context, RegularisationDetailScreen(requestId: request.id));
            },
            child: const Text('View details'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () async {
              final copy = await context.read<AppState>().duplicateRequest(request.id);
              if (!context.mounted) return;
              Navigator.pop(context);
              if (copy != null) openPage(context, RaiseRegularisationScreen(requestId: copy.id));
            },
            child: const Text('Duplicate'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: request.status == 'Draft' || request.status == 'Sent Back'
                ? () {
                    Navigator.pop(context);
                    openPage(context, RaiseRegularisationScreen(requestId: request.id));
                  }
                : null,
            child: const Text('Edit request'),
          ),
        ],
      ),
    );
  }
}
