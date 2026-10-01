import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../shared/widgets.dart';
import 'day_detail_screen.dart';

class PunchTimelineScreen extends StatefulWidget {
  const PunchTimelineScreen({super.key, this.day = 12});

  final int day;

  @override
  State<PunchTimelineScreen> createState() => _PunchTimelineScreenState();
}

class _PunchTimelineScreenState extends State<PunchTimelineScreen> {
  String _filter = 'All';
  String _source = 'All sources';

  @override
  Widget build(BuildContext context) {
    final record = context.watch<AppState>().day(widget.day);
    final all = DemoData.punchesFor(record);
    final visible = all.where((event) {
      final filterOk = switch (_filter) {
        'Valid' => !event.flagged,
        'Flagged' => event.flagged,
        _ => true,
      };
      final sourceOk = _source == 'All sources' || event.source == _source;
      return filterOk && sourceOk;
    }).toList();
    final flagged = all.where((e) => e.flagged).length;
    final biometric = all.where((e) => e.source == 'Biometric').length;

    return Scaffold(
      appBar: AppBar(title: const Text('Punch Timeline')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Text(prettyDay(widget.day), style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 12),
          EqualGrid(
            columns: 2,
            rowHeight: 88,
            children: [
              MetricTile(value: '${all.length}', label: 'Total punches', color: AppColors.slate700),
              MetricTile(value: '${all.length - flagged}', label: 'Valid punches', color: AppColors.emerald),
              MetricTile(value: '$flagged', label: 'Unprocessed', color: AppColors.amber),
              MetricTile(value: '$biometric', label: 'Biometric', color: AppColors.primary),
            ],
          ),
          const SizedBox(height: 12),
          FilterChips(
            labels: ['All ${all.length}', 'Valid ${all.length - flagged}', 'Flagged $flagged'].map((e) => e.split(' ').first).toList(),
            selected: _filter,
            onSelected: (value) => setState(() => _filter = value),
          ),
          const SizedBox(height: 8),
          AppDropdown<String>(
            value: _source,
            label: 'By source',
            items: const [
              DropdownMenuItem(value: 'All sources', child: Text('All sources')),
              DropdownMenuItem(value: 'Biometric', child: Text('Biometric')),
              DropdownMenuItem(value: 'Mobile App', child: Text('Mobile App')),
            ],
            onChanged: (value) => setState(() => _source = value ?? _source),
          ),
          const SizedBox(height: 12),
          if (visible.isEmpty)
            const AppCard(child: Text('No punches match this filter.'))
          else
            for (final event in visible) ...[
              AppCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${event.timeLabel}  ${event.type}', style: const TextStyle(fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text('${event.source} · ${event.place}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                        ],
                      ),
                    ),
                    StatusPill(
                      label: event.validity,
                      color: event.flagged ? AppColors.amber : AppColors.emerald,
                      soft: event.flagged ? AppColors.amberSoft : AppColors.emeraldSoft,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          const SizedBox(height: 8),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  all.isEmpty ? 'Nothing to summarise.' : '${all.length} raw events · ${all.length - flagged} processed successfully.',
                  style: const TextStyle(fontSize: 13),
                ),
                TextButton(
                  onPressed: () => openPage(context, DayDetailScreen(day: widget.day)),
                  child: const Text('View processed attendance'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
