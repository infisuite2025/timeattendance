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
            const AppCard(child: Text('No history matches this filter.'))
          else
            for (final item in history)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(child: Text('${item.id} · ${item.kind}', style: const TextStyle(fontWeight: FontWeight.w800))),
                          StatusPill(label: item.status, color: colorForRequestStatus(item.status)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(item.employee, style: const TextStyle(fontSize: 13)),
                      Text(item.summary, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                      const SizedBox(height: 4),
                      Text('Turnaround ${item.turnaround} · You', style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }
}
