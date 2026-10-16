import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../shared/widgets.dart';
import 'day_detail_screen.dart';

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

class PunchTimelineScreen extends StatefulWidget {
  const PunchTimelineScreen({super.key, this.day});

  final int? day;

  int get shownDay => day ?? DateTime.now().day;

  @override
  State<PunchTimelineScreen> createState() => _PunchTimelineScreenState();
}

class _PunchTimelineScreenState extends State<PunchTimelineScreen> {
  String _filter = 'All';
  String _source = 'All sources';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final all = state.punches;
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
          Text(prettyDay(widget.shownDay, month: state.loadedMonth), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 4),
          const Text('Raw punches before they are turned into a day record.', style: TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate500)),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '${all.length}', label: 'Total', color: AppColors.slate900),
                _Count(value: '${all.length - flagged}', label: 'Valid', color: AppColors.emerald),
                _Count(value: '$flagged', label: 'Flagged', color: AppColors.amber),
                _Count(value: '$biometric', label: 'Biometric', color: AppColors.primary),
              ],
            ),
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
            const AppCard(color: AppColors.white, child: Text('No punches match this filter.'))
          else
            for (final event in visible) ...[
              AppCard(
                color: AppColors.white,
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(event.timeLabel, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                          const SizedBox(height: 2),
                          Text(event.type, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 2),
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
          const SizedBox(height: 4),
          AppCard(
            color: AppColors.white,
            onTap: () => openPage(context, DayDetailScreen(day: widget.shownDay)),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    all.isEmpty ? 'Nothing to summarise yet.' : '${all.length} raw events · ${all.length - flagged} processed.',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ),
                const Text('Day detail', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
