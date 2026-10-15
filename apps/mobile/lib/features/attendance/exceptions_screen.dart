import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/feedback.dart';
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

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final openCount = state.exceptions.where((e) => !e.reviewed).length;
    final reviewedCount = state.exceptions.where((e) => e.reviewed).length;
    final highCount = state.exceptions.where((e) => e.priority == 'High' && !e.reviewed).length;
    final items = state.exceptions.where((item) {
      final query = _query.trim().toLowerCase();
      final queryOk = query.isEmpty || item.employee.toLowerCase().contains(query) || item.code.toLowerCase().contains(query);
      final typeOk = _type == 'All types' || item.type == _type;
      final statusOk = _status == 'All' || (_status == 'Open' ? !item.reviewed : item.reviewed);
      return queryOk && typeOk && statusOk;
    }).toList()
      ..sort((a, b) => _rank(a.priority).compareTo(_rank(b.priority)));

    final types = ['All types', ...{for (final item in state.exceptions) item.type}];

    return Scaffold(
      appBar: AppBar(title: const Text('Exceptions')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          const Text('Attendance problems that still need a decision.', style: TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate500)),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '$openCount', label: 'Open', color: AppColors.amber),
                _Count(value: '$highCount', label: 'High', color: AppColors.rose),
                _Count(value: '$reviewedCount', label: 'Reviewed', color: AppColors.emerald),
                _Count(value: '${state.exceptions.length}', label: 'Total', color: AppColors.slate900),
              ],
            ),
          ),
          if (openCount > 0) ...[
            const SizedBox(height: 12),
            AppCard(
              color: AppColors.white,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 4, height: 36, decoration: BoxDecoration(color: AppColors.amber, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '$openCount ${openCount == 1 ? 'exception still needs' : 'exceptions still need'} a review. High priority items are listed first.',
                      style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search employee or ID'),
            onChanged: (value) => setState(() => _query = value),
          ),
          const SizedBox(height: 8),
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
          const SizedBox(height: 8),
          AppDropdown<String>(
            value: types.contains(_type) ? _type : 'All types',
            label: 'Exception type',
            items: [for (final type in types) DropdownMenuItem(value: type, child: Text(type))],
            onChanged: (value) => setState(() => _type = value ?? 'All types'),
          ),
          const SizedBox(height: 16),
          Text(
            items.isEmpty ? 'No matches' : '${items.length} ${items.length == 1 ? 'exception' : 'exceptions'}',
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500),
          ),
          const SizedBox(height: 8),
          if (items.isEmpty)
            const AppCard(color: AppColors.white, child: Text('Nothing matches this month or filter.'))
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
      color: AppColors.white,
      onTap: item.reviewed ? null : () => _review(context),
      padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, height: 52, decoration: BoxDecoration(color: item.reviewed ? AppColors.emerald : color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.employee, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text('${item.code} · ${item.type}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                const SizedBox(height: 4),
                Text(item.detail, style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate700)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              StatusPill(label: item.reviewed ? 'Reviewed' : item.priority, color: item.reviewed ? AppColors.emerald : color),
              if (!item.reviewed) const Icon(Icons.chevron_right, color: AppColors.slate400),
            ],
          ),
        ],
      ),
    );
  }

  void _review(BuildContext context) {
    showAppSheet<void>(
      context,
      title: item.employee,
      message: '${item.type} · ${item.priority} priority',
      builder: (sheetContext) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppCard(
            color: AppColors.white,
            child: Text(item.detail, style: const TextStyle(fontSize: 14, height: 1.4, color: AppColors.slate700)),
          ),
          const SizedBox(height: 12),
          OptionGroup(
            children: [
              SheetChoiceTile(
                icon: Icons.edit_outlined,
                title: 'Raise regularisation',
                subtitle: 'Turn this exception into a request',
                onTap: () async {
                  await context.read<AppState>().reviewException(item.id);
                  if (!sheetContext.mounted || !context.mounted) return;
                  Navigator.pop(sheetContext);
                  openPage(context, const RaiseRegularisationScreen());
                },
              ),
              SheetChoiceTile(
                icon: Icons.task_alt_rounded,
                title: 'Mark reviewed',
                subtitle: 'Close it without a new request',
                onTap: () async {
                  final confirmed = await showAppConfirm(
                    sheetContext,
                    title: 'Mark as reviewed?',
                    message: 'This closes ${item.code} without raising a regularisation.',
                    confirmLabel: 'Mark reviewed',
                    icon: Icons.task_alt_rounded,
                  );
                  if (!confirmed || !context.mounted) return;
                  await context.read<AppState>().reviewException(item.id);
                  if (sheetContext.mounted) Navigator.pop(sheetContext);
                },
              ),
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
          Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
