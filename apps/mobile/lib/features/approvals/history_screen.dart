import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../shared/widgets.dart';

class ApprovalHistoryScreen extends StatefulWidget {
  const ApprovalHistoryScreen({super.key});

  @override
  State<ApprovalHistoryScreen> createState() => _ApprovalHistoryScreenState();
}

class _ApprovalHistoryScreenState extends State<ApprovalHistoryScreen> {
  String _filter = 'All';
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final history = context.watch<AppState>().approvalHistory.where((item) {
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty || item.employee.toLowerCase().contains(query) || item.id.toLowerCase().contains(query);
      final filterOk = _filter == 'All' || item.kind == _filter || item.status == _filter;
      return queryOk && filterOk;
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Approval History')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search employee or ID'),
            onChanged: (value) => setState(() => _query = value),
          ),
          const SizedBox(height: 10),
          FilterChips(
            labels: const ['All', 'Regularisation', 'Overtime', 'Shift Swap', 'Approved', 'Rejected'],
            selected: _filter,
            onSelected: (value) => setState(() => _filter = value),
          ),
          const SizedBox(height: 12),
          if (history.isEmpty)
            const AppCard(color: AppColors.white, child: Text('No history matches this filter.'))
          else
            for (final item in history)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  color: AppColors.white,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 4,
                        height: 48,
                        decoration: BoxDecoration(color: colorForRequestStatus(item.status), borderRadius: BorderRadius.circular(4)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.employee, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            Text('${item.kind} · ${item.summary}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                            const SizedBox(height: 2),
                            Text('Turnaround ${item.turnaround}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      StatusPill(label: item.status, color: colorForRequestStatus(item.status)),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }
}
