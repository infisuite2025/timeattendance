import 'package:flutter/material.dart';

import '../../shared/widgets.dart';
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
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: PageIntro(title: 'Team', subtitle: 'Who is in right now, and how your own team looks today.'),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
            child: AppSegmentedControl(
              index: _segment,
              onChanged: (value) => setState(() => _segment = value),
              segments: const [
                AppSegment('Live', icon: Icons.podcasts_outlined),
                AppSegment('My team', icon: Icons.groups_outlined),
              ],
            ),
          ),
          Expanded(child: _segment == 0 ? const LiveAttendanceScreen(embedded: true) : const TeamAttendanceScreen(embedded: true)),
        ],
      ),
    );
  }
}
