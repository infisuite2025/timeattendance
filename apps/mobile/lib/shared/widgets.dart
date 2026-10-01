import 'package:flutter/material.dart';

import '../app/theme.dart';
import '../core/demo_data.dart';
import '../core/models.dart';

class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.padding = const EdgeInsets.all(16), this.onTap, this.color});

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: color ?? AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.slate200),
      ),
      child: child,
    );
    if (onTap == null) return card;
    return Material(
      color: Colors.transparent,
      child: InkWell(borderRadius: BorderRadius.circular(16), onTap: onTap, child: card),
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, required this.color, this.soft});

  final String label;
  final Color color;
  final Color? soft;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: soft ?? color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}

class MetricTile extends StatelessWidget {
  const MetricTile({super.key, required this.value, required this.label, required this.color, this.soft});

  final String value;
  final String label;
  final Color color;
  final Color? soft;

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: soft ?? color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: TextStyle(color: color, fontSize: 11, height: 1.2, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

/// A row or wrapped set of boxes that share one height, so labels that wrap do not make neighbours shorter.
class EqualGrid extends StatelessWidget {
  const EqualGrid({
    super.key,
    required this.columns,
    required this.children,
    this.rowHeight = 78,
    this.spacing = 8,
  });

  final int columns;
  final double rowHeight;
  final double spacing;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (var start = 0; start < children.length; start += columns) {
      final end = start + columns > children.length ? children.length : start + columns;
      final slice = children.sublist(start, end);
      rows.add(
        Padding(
          padding: EdgeInsets.only(bottom: end == children.length ? 0 : spacing),
          child: SizedBox(
            height: rowHeight,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var index = 0; index < columns; index++) ...[
                  if (index > 0) SizedBox(width: spacing),
                  Expanded(child: index < slice.length ? slice[index] : const SizedBox.shrink()),
                ],
              ],
            ),
          ),
        ),
      );
    }
    return Column(children: rows);
  }
}

class AppDropdown<T> extends StatelessWidget {
  const AppDropdown({
    super.key,
    required this.value,
    required this.label,
    required this.items,
    required this.onChanged,
    this.itemHeight = 48,
  });

  final T value;
  final String label;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;
  final double itemHeight;

  @override
  Widget build(BuildContext context) {
    final current = items.where((item) => item.value == value).firstOrNull;
    final text = current == null ? '' : _dropdownLabel(current.child);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () async {
        final picked = await showModalBottomSheet<T>(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.white,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
          builder: (context) {
            final bottom = MediaQuery.viewPaddingOf(context).bottom;
            return SafeArea(
              child: Padding(
                padding: EdgeInsets.fromLTRB(8, 8, 8, 8 + bottom),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 36, height: 4, decoration: BoxDecoration(color: AppColors.slate200, borderRadius: BorderRadius.circular(4))),
                    const SizedBox(height: 12),
                    Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Flexible(
                      child: ListView(
                        shrinkWrap: true,
                        children: [
                          for (final item in items)
                            ListTile(
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              selected: item.value == value,
                              selectedTileColor: const Color(0xFFEFF6FF),
                              title: DefaultTextStyle(
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.slate900),
                                child: item.child,
                              ),
                              trailing: item.value == value ? const Icon(Icons.check_rounded, color: AppColors.primary) : null,
                              onTap: () => Navigator.pop(context, item.value),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
        if (picked != null) onChanged(picked);
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          suffixIcon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.slate500),
        ),
        child: Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

String _dropdownLabel(Widget child) {
  if (child is Text) return child.data ?? child.textSpan?.toPlainText() ?? '';
  if (child is Column) {
    for (final nested in child.children) {
      if (nested is Text && (nested.data ?? '').isNotEmpty) return nested.data!;
    }
  }
  return '';
}

class AvatarBadge extends StatelessWidget {
  const AvatarBadge({super.key, required this.initials, this.size = 36});

  final String initials;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: const Color(0xFFDBEAFE), borderRadius: BorderRadius.circular(size)),
      child: Text(initials, style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: size * 0.34)),
    );
  }
}

class SectionLabel extends StatelessWidget {
  const SectionLabel(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate700));
  }
}

class FilterChips extends StatelessWidget {
  const FilterChips({super.key, required this.labels, required this.selected, required this.onSelected});

  final List<String> labels;
  final String selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final label in labels) ...[
            ChoiceChip(
              label: Text(label),
              selected: selected == label,
              onSelected: (_) => onSelected(label),
              selectedColor: const Color(0xFFDBEAFE),
              labelStyle: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: selected == label ? AppColors.primary : AppColors.slate700,
              ),
              side: BorderSide(color: selected == label ? AppColors.primary : AppColors.slate200),
              visualDensity: VisualDensity.compact,
            ),
            const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}

class DonutChart extends StatelessWidget {
  const DonutChart({super.key, required this.progress, required this.center, required this.caption});

  final double progress;
  final String center;
  final String caption;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 92,
      height: 92,
      child: CustomPaint(
        painter: _DonutPainter(progress),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(center, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.slate900)),
              Text(caption, style: const TextStyle(fontSize: 10, color: AppColors.slate500)),
            ],
          ),
        ),
      ),
    );
  }
}

class _DonutPainter extends CustomPainter {
  _DonutPainter(this.progress);
  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;
    paint.color = AppColors.slate100;
    canvas.drawArc(rect.deflate(8), -1.2, 5.2, false, paint);
    paint.color = AppColors.emerald;
    canvas.drawArc(rect.deflate(8), -1.5708, 6.28318 * progress.clamp(0, 1), false, paint);
  }

  @override
  bool shouldRepaint(covariant _DonutPainter oldDelegate) => oldDelegate.progress != progress;
}

class MiniBars extends StatelessWidget {
  const MiniBars({super.key, required this.values, required this.labels, this.color = AppColors.primary});

  final List<double> values;
  final List<String> labels;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final maxValue = values.fold<double>(1, (prev, value) => value > prev ? value : prev);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        for (var i = 0; i < values.length; i++)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    height: 72 * (values[i] / maxValue),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.85), borderRadius: BorderRadius.circular(6)),
                  ),
                  const SizedBox(height: 6),
                  Text(labels[i], style: const TextStyle(fontSize: 10, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class PageIntro extends StatelessWidget {
  const PageIntro({super.key, required this.title, this.subtitle, this.trailing});

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.slate900, letterSpacing: -0.3)),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(subtitle!, style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate500)),
              ],
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

Color colorForStatus(AttendanceStatus status) {
  switch (status) {
    case AttendanceStatus.present:
      return AppColors.present;
    case AttendanceStatus.late:
      return AppColors.late;
    case AttendanceStatus.absent:
      return AppColors.absent;
    case AttendanceStatus.wfh:
      return AppColors.wfh;
    case AttendanceStatus.onLeave:
      return AppColors.purple;
    case AttendanceStatus.missingPunch:
      return AppColors.missing;
  }
}

Color colorForKind(DayKind kind) {
  switch (kind) {
    case DayKind.present:
      return AppColors.present;
    case DayKind.late:
      return AppColors.late;
    case DayKind.leave:
      return AppColors.leave;
    case DayKind.wfh:
      return AppColors.wfh;
    case DayKind.holiday:
      return AppColors.holiday;
    case DayKind.weeklyOff:
      return AppColors.weeklyOff;
    case DayKind.halfDay:
      return AppColors.halfDay;
    case DayKind.absent:
      return AppColors.absent;
    case DayKind.missing:
      return AppColors.missing;
  }
}

Color colorForRequestStatus(String status) {
  switch (status) {
    case 'Approved':
      return AppColors.emerald;
    case 'Rejected':
      return AppColors.rose;
    case 'Sent Back':
      return AppColors.amber;
    case 'Draft':
      return AppColors.slate500;
    case 'Withdrawn':
      return AppColors.slate500;
    default:
      return AppColors.primary;
  }
}

String weekdayShort(DateTime date) {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return names[date.weekday - 1];
}

String monthTitle(DateTime date) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return '${months[date.month - 1]} ${date.year}';
}

String prettyDay(int day, [int month = 9, int year = 2024]) {
  final date = DateTime(year, month, day);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return '${weekdayShort(date)}, $day ${months[month - 1]} $year';
}

class AppTabBar extends StatelessWidget {
  const AppTabBar({super.key, required this.labels, required this.index, required this.onChanged});

  final List<String> labels;
  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: labels.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final selected = i == index;
          return Material(
            color: selected ? const Color(0xFFDBEAFE) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              onTap: () => onChanged(i),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: selected ? AppColors.primary : AppColors.slate200),
                ),
                child: Text(
                  labels[i],
                  maxLines: 1,
                  softWrap: false,
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: selected ? AppColors.primary : AppColors.slate700),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

void showInfoSheet(BuildContext context, {required String title, required Widget child}) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (context) {
      final bottom = MediaQuery.viewPaddingOf(context).bottom + MediaQuery.viewInsetsOf(context).bottom;
      return ConstrainedBox(
        constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.72),
        child: Padding(
          padding: EdgeInsets.fromLTRB(20, 12, 20, 20 + bottom),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: AppColors.slate200, borderRadius: BorderRadius.circular(4)))),
              const SizedBox(height: 14),
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              const Divider(height: 1, color: AppColors.slate200),
              const SizedBox(height: 12),
              Flexible(child: SingleChildScrollView(child: child)),
            ],
          ),
        ),
      );
    },
  );
}

Widget legendDot(Color color, String label) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
      const SizedBox(width: 6),
      Text(label, style: const TextStyle(fontSize: 11, color: AppColors.slate700, fontWeight: FontWeight.w600)),
    ],
  );
}

String kindLabel(DayKind kind) => dayKindLabel(kind);
