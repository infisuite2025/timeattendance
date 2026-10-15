import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import 'detail_screen.dart';

class RegularisationHistoryScreen extends StatefulWidget {
  const RegularisationHistoryScreen({super.key});

  @override
  State<RegularisationHistoryScreen> createState() => _RegularisationHistoryScreenState();
}

class _RegularisationHistoryScreenState extends State<RegularisationHistoryScreen> {
  String _filter = 'All';
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final requests = context.watch<AppState>().requests.where((r) => r.status != 'Draft').toList();
    int count(String status) => requests.where((r) => r.status == status).length;
    final visible = requests.where((request) {
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty || request.type.toLowerCase().contains(query) || request.reason.toLowerCase().contains(query);
      final filterOk = _filter == 'All' ||
          request.type.toLowerCase().contains(_filter.toLowerCase()) ||
          (_filter == 'Late In' && request.type == 'Late Coming') ||
          (_filter == 'Early Out' && request.type == 'Short Working Hours') ||
          (_filter == 'WFH' && request.type == 'Work From Home');
      return queryOk && filterOk;
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          const Text('From your workspace requests', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '${requests.length}', label: 'Total', color: AppColors.slate900),
                _Count(value: '${count('Approved')}', label: 'Approved', color: AppColors.emerald),
                _Count(value: '${count('Rejected')}', label: 'Rejected', color: AppColors.rose),
                _Count(value: '${count('Pending')}', label: 'Pending', color: AppColors.primary),
              ],
            ),
          ),
          const SizedBox(height: 16),
          FilterChips(
            labels: const ['All', 'Missing Punch', 'Late In', 'Early Out', 'WFH'],
            selected: _filter,
            onSelected: (value) => setState(() => _filter = value),
          ),
          const SizedBox(height: 10),
          TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search type or reason'),
            onChanged: (value) => setState(() => _query = value),
          ),
          const SizedBox(height: 16),
          Text(
            visible.isEmpty ? 'No matches' : '${visible.length} ${visible.length == 1 ? 'request' : 'requests'}',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500),
          ),
          const SizedBox(height: 8),
          if (visible.isEmpty)
            const AppCard(color: AppColors.white, child: Text('Nothing in history matches this filter.'))
          else
            for (final request in visible) ...[
              _HistoryTile(request: request),
              const SizedBox(height: 8),
            ],
        ],
      ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.request});
  final RegularisationRequest request;

  @override
  Widget build(BuildContext context) {
    final color = colorForRequestStatus(request.status);
    return AppCard(
      color: AppColors.white,
      onTap: () => openPage(context, RegularisationDetailScreen(requestId: request.id)),
      padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, height: 48, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(request.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(request.type, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(request.reason, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                const SizedBox(height: 2),
                Text(request.status, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
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
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
