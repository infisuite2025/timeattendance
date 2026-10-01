import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
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
    final total = requests.length;
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
      appBar: AppBar(title: const Text('Regularisation History')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          const Text('Q3 2024  ·  Jul – Sep', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 12),
          EqualGrid(
            columns: 2,
            rowHeight: 84,
            children: [
              MetricTile(value: '$total', label: 'Total', color: AppColors.slate700),
              MetricTile(value: '${count('Approved')}', label: 'Approved', color: AppColors.emerald),
              MetricTile(value: '${count('Rejected')}', label: 'Rejected', color: AppColors.rose),
              MetricTile(value: '${count('Pending')}', label: 'Pending', color: AppColors.primary),
            ],
          ),
          const SizedBox(height: 14),
          const AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Request trend', style: TextStyle(fontWeight: FontWeight.w800)),
                SizedBox(height: 4),
                Text('Last 6 months', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                SizedBox(height: 12),
                SizedBox(
                  height: 110,
                  child: MiniBars(
                    values: [4, 6, 5, 8, 7, 9],
                    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    color: AppColors.indigo,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          FilterChips(
            labels: const ['All', 'Missing Punch', 'Late In', 'Early Out', 'WFH'],
            selected: _filter,
            onSelected: (value) => setState(() => _filter = value),
          ),
          const SizedBox(height: 10),
          TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search history'),
            onChanged: (value) => setState(() => _query = value),
          ),
          const SizedBox(height: 12),
          for (final request in visible)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                onTap: () => openPage(context, RegularisationDetailScreen(requestId: request.id)),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(request.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                          Text(request.type, style: const TextStyle(fontWeight: FontWeight.w800)),
                          Text(request.reason, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
                          const Text('Approver: Naresh Andukoori', style: TextStyle(fontSize: 11, color: AppColors.slate400)),
                        ],
                      ),
                    ),
                    StatusPill(label: request.status, color: colorForRequestStatus(request.status)),
                    const Icon(Icons.chevron_right, color: AppColors.slate400),
                  ],
                ),
              ),
            ),
          if (visible.isEmpty) const AppCard(child: Text('No history for this filter.')),
        ],
      ),
    );
  }
}
