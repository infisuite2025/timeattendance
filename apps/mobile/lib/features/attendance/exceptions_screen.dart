import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';
import '../regularisation/raise_screen.dart';

class ExceptionsScreen extends StatefulWidget {
  const ExceptionsScreen({super.key});

  @override
  State<ExceptionsScreen> createState() => _ExceptionsScreenState();
}

class _ExceptionsScreenState extends State<ExceptionsScreen> {
  String _query = '';
  String _type = 'All types';
  String _status = 'Open';
  String _month = 'Sep 2024';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final openCount = state.exceptions.where((e) => !e.reviewed).length;
    final items = state.exceptions.where((item) {
      final monthOk = _month == 'Sep 2024';
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty || item.employee.toLowerCase().contains(query) || item.code.toLowerCase().contains(query);
      final typeOk = _type == 'All types' || item.type == _type;
      final statusOk = _status == 'All' || (_status == 'Open' ? !item.reviewed : item.reviewed);
      return monthOk && queryOk && typeOk && statusOk;
    }).toList()
      ..sort((a, b) => _rank(a.priority).compareTo(_rank(b.priority)));

    final types = ['All types', ...{for (final item in state.exceptions) item.type}];

    return Scaffold(
      appBar: AppBar(title: const Text('Exceptions')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          const Text('Identify and resolve attendance anomalies.', style: TextStyle(color: AppColors.slate500)),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.amberSoft,
            child: Text(
              '$openCount exceptions require action today',
              style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.amber),
            ),
          ),
          const SizedBox(height: 12),
          EqualGrid(
            columns: 2,
            rowHeight: 84,
            children: [
              for (final type in ['Missing Punch', 'Late Arrival', 'Early Departure', 'Short Hours', 'Unscheduled Attendance'])
                MetricTile(
                  value: '${state.exceptions.where((e) => e.type == type).length}',
                  label: type,
                  color: AppColors.slate700,
                ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search employee or ID'),
            onChanged: (value) => setState(() => _query = value),
          ),
          const SizedBox(height: 8),
          EqualGrid(
            columns: 2,
            rowHeight: 84,
            children: [
              AppDropdown<String>(
                value: _month,
                label: 'Month',
                items: const [
                  DropdownMenuItem(value: 'Sep 2024', child: Text('Sep 2024')),
                  DropdownMenuItem(value: 'Oct 2024', child: Text('Oct 2024')),
                ],
                onChanged: (value) => setState(() => _month = value ?? _month),
              ),
              AppDropdown<String>(
                value: _status,
                label: 'Status',
                items: const [
                  DropdownMenuItem(value: 'Open', child: Text('Open')),
                  DropdownMenuItem(value: 'Reviewed', child: Text('Reviewed')),
                  DropdownMenuItem(value: 'All', child: Text('All')),
                ],
                onChanged: (value) => setState(() => _status = value ?? _status),
              ),
            ],
          ),
          const SizedBox(height: 8),
          AppDropdown<String>(
            value: types.contains(_type) ? _type : 'All types',
            label: 'Exception type',
            items: [for (final type in types) DropdownMenuItem(value: type, child: Text(type))],
            onChanged: (value) => setState(() => _type = value ?? 'All types'),
          ),
          const SizedBox(height: 12),
          if (items.isEmpty)
            const AppCard(child: Text('No exceptions match these filters.'))
          else
            for (final item in items) ...[
              _ExceptionCard(item: item),
              const SizedBox(height: 8),
            ],
        ],
      ),
    );
  }

  int _rank(String priority) {
    switch (priority) {
      case 'High':
        return 0;
      case 'Medium':
        return 1;
      default:
        return 2;
    }
  }
}

class _ExceptionCard extends StatelessWidget {
  const _ExceptionCard({required this.item});
  final AttendanceException item;

  @override
  Widget build(BuildContext context) {
    final color = item.priority == 'High'
        ? AppColors.rose
        : item.priority == 'Medium'
            ? AppColors.amber
            : AppColors.slate500;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(item.employee, style: const TextStyle(fontWeight: FontWeight.w800))),
              StatusPill(label: item.priority, color: color),
            ],
          ),
          const SizedBox(height: 4),
          Text('${item.code} · ${item.type}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
          const SizedBox(height: 4),
          Text(item.detail, style: const TextStyle(fontSize: 13)),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: item.reviewed
                ? const Text('Reviewed', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.emerald))
                : FilledButton(
                    onPressed: () => _review(context),
                    child: const Text('Review'),
                  ),
          ),
        ],
      ),
    );
  }

  void _review(BuildContext context) {
    showInfoSheet(
      context,
      title: item.employee,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${item.type} · ${item.priority} priority', style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text(item.detail),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () {
              context.read<AppState>().reviewException(item.id);
              Navigator.pop(context);
              openPage(context, const RaiseRegularisationScreen());
            },
            child: const Text('Raise regularisation'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () {
              context.read<AppState>().reviewException(item.id);
              Navigator.pop(context);
            },
            child: const Text('Mark reviewed'),
          ),
        ],
      ),
    );
  }
}
