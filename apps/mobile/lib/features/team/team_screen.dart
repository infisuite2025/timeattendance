import 'package:flutter/material.dart';

import '../../app/theme.dart';
import 'live_attendance_screen.dart';
import 'team_attendance_screen.dart';

class TeamScreen extends StatefulWidget {
  const TeamScreen({super.key});

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
  int _segment = 0;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('Live'), icon: Icon(Icons.podcasts_outlined)),
                ButtonSegment(value: 1, label: Text('My team'), icon: Icon(Icons.groups_outlined)),
              ],
              selected: {_segment},
              onSelectionChanged: (value) => setState(() => _segment = value.first),
            ),
          ),
          const Divider(height: 1, color: AppColors.slate200),
          Expanded(child: _segment == 0 ? const LiveAttendanceScreen(embedded: true) : const TeamAttendanceScreen(embedded: true)),
        ],
      ),
    );
  }
}
