import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';

class LocationsScreen extends StatefulWidget {
  const LocationsScreen({super.key});

  @override
  State<LocationsScreen> createState() => _LocationsScreenState();
}

class _LocationsScreenState extends State<LocationsScreen> {
  String? _open;

  @override
  Widget build(BuildContext context) {
    final sites = context.watch<AppState>().sites;
    final checkedIn = sites.fold<int>(0, (sum, site) => sum + site.present);
    final delayed = sites.where((s) => s.health != 'On Track').fold<int>(0, (sum, site) => sum + site.absent);
    return Scaffold(
      appBar: AppBar(title: const Text('Locations')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          SizedBox(
            height: 220,
            child: AppCard(
              padding: EdgeInsets.zero,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(
                  children: [
                    const Positioned.fill(child: _MapBackdrop()),
                    for (final site in sites)
                      Align(
                        alignment: Alignment(site.pinX * 2 - 1, site.pinY * 2 - 1),
                        child: _Pin(
                          label: site.name,
                          selected: _open == site.name,
                          onTap: () => setState(() => _open = _open == site.name ? null : site.name),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          EqualGrid(
            columns: 3,
            rowHeight: 84,
            children: [
              MetricTile(value: '${sites.length}', label: 'Sites', color: AppColors.slate700),
              MetricTile(value: '$checkedIn', label: 'Checked in', color: AppColors.emerald),
              MetricTile(value: '$delayed', label: 'Needs attention', color: AppColors.amber),
            ],
          ),
          const SizedBox(height: 14),
          const SectionLabel('Sites'),
          const SizedBox(height: 8),
          for (final site in sites) ...[
            _SiteTile(
              site: site,
              open: _open == site.name,
              onTap: () => setState(() => _open = _open == site.name ? null : site.name),
            ),
            const SizedBox(height: 8),
          ],
          const SizedBox(height: 8),
          const SectionLabel('Location exceptions'),
          const SizedBox(height: 8),
          for (final row in DemoData.locationExceptions)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(row.$1, style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    StatusPill(label: row.$2, color: AppColors.rose, soft: AppColors.roseSoft),
                    const SizedBox(height: 6),
                    Text(row.$3, style: const TextStyle(fontSize: 13, color: AppColors.slate700)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _MapBackdrop extends StatelessWidget {
  const _MapBackdrop();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _MapPainter(),
      child: const SizedBox.expand(),
    );
  }
}

class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFFE0F2FE);
    canvas.drawRect(Offset.zero & size, paint);
    final land = Paint()..color = const Color(0xFFBFDBFE);
    final path = Path()
      ..moveTo(size.width * 0.28, size.height * 0.18)
      ..quadraticBezierTo(size.width * 0.55, size.height * 0.08, size.width * 0.72, size.height * 0.28)
      ..quadraticBezierTo(size.width * 0.8, size.height * 0.55, size.width * 0.62, size.height * 0.82)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.92, size.width * 0.32, size.height * 0.7)
      ..quadraticBezierTo(size.width * 0.18, size.height * 0.48, size.width * 0.28, size.height * 0.18);
    canvas.drawPath(path, land);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _Pin extends StatelessWidget {
  const _Pin({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.location_on, color: selected ? AppColors.primary : AppColors.rose, size: selected ? 28 : 22),
          if (selected)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(8)),
              child: Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
    );
  }
}

class _SiteTile extends StatelessWidget {
  const _SiteTile({required this.site, required this.open, required this.onTap});
  final SiteOffice site;
  final bool open;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final healthy = site.health == 'On Track';
    return AppCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(site.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                    Text(site.kind, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                  ],
                ),
              ),
              StatusPill(label: site.health, color: healthy ? AppColors.emerald : AppColors.amber),
              Icon(open ? Icons.expand_less : Icons.expand_more, color: AppColors.slate400),
            ],
          ),
          if (open) ...[
            const SizedBox(height: 8),
            Text('Present ${site.present} · Absent ${site.absent} · Headcount ${site.headcount}', style: const TextStyle(fontSize: 13)),
          ],
        ],
      ),
    );
  }
}
