import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/app_state.dart';
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
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          const Text('Tap a pin or a site to see who is there.', style: TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate500)),
          const SizedBox(height: 12),
          SizedBox(
            height: 220,
            child: AppCard(
              color: AppColors.white,
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
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '${sites.length}', label: 'Sites', color: AppColors.slate900),
                _Count(value: '$checkedIn', label: 'Assigned', color: AppColors.emerald),
                _Count(value: '$delayed', label: 'Attention', color: AppColors.amber),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('Sites', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 8),
          for (final site in sites) ...[
            _SiteTile(
              site: site,
              open: _open == site.name,
              onTap: () => setState(() => _open = _open == site.name ? null : site.name),
            ),
            const SizedBox(height: 8),
          ],
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
    canvas.drawRect(Offset.zero & size, Paint()..color = const Color(0xFFF8FAFC));
    final land = Paint()..color = const Color(0xFFDBEAFE);
    final path = Path()
      ..moveTo(size.width * 0.28, size.height * 0.18)
      ..quadraticBezierTo(size.width * 0.55, size.height * 0.08, size.width * 0.72, size.height * 0.28)
      ..quadraticBezierTo(size.width * 0.8, size.height * 0.55, size.width * 0.62, size.height * 0.82)
      ..quadraticBezierTo(size.width * 0.4, size.height * 0.92, size.width * 0.32, size.height * 0.7)
      ..quadraticBezierTo(size.width * 0.18, size.height * 0.48, size.width * 0.28, size.height * 0.18);
    canvas.drawPath(path, land);
    final road = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(size.width * 0.1, size.height * 0.62), Offset(size.width * 0.9, size.height * 0.38), road);
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
          Icon(Icons.location_on, color: selected ? AppColors.primary : AppColors.rose, size: selected ? 30 : 22),
          if (selected)
            Container(
              margin: const EdgeInsets.only(top: 2),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.line)),
              child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
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
    final color = healthy ? AppColors.emerald : AppColors.amber;
    return AppCard(
      color: AppColors.white,
      onTap: onTap,
      padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 4, height: 40, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(site.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(site.kind, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                  ],
                ),
              ),
              StatusPill(label: site.health, color: color),
              Icon(open ? Icons.expand_less : Icons.expand_more, color: AppColors.slate400),
            ],
          ),
          if (open) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.line),
            const SizedBox(height: 12),
            Row(
              children: [
                _Mini(value: '${site.present}', label: 'Assigned', color: AppColors.emerald),
                _Mini(value: '${site.absent}', label: 'Absent', color: AppColors.rose),
                _Mini(value: '${site.headcount}', label: 'Headcount', color: AppColors.slate900),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _Mini extends StatelessWidget {
  const _Mini({required this.value, required this.label, required this.color});
  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
