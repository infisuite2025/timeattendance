import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../app/theme.dart';

void showAppToast(
  BuildContext context,
  String message, {
  bool error = false,
  bool success = false,
  bool warning = false,
  Duration? duration,
}) {
  final tone = error
      ? AppColors.rose
      : warning
          ? AppColors.amber
          : success
              ? AppColors.emerald
              : AppColors.primary;
  final icon = error
      ? Icons.error_outline_rounded
      : warning
          ? Icons.warning_amber_rounded
          : success
              ? Icons.check_circle_outline_rounded
              : Icons.info_outline_rounded;
  final toast = FToast()..init(context);
  toast.removeQueuedCustomToasts();
  toast.showToast(
    gravity: ToastGravity.BOTTOM,
    toastDuration: duration ?? const Duration(seconds: 3),
    ignorePointer: true,
    positionedToastBuilder: (context, child, gravity) {
      final bottom = MediaQuery.paddingOf(context).bottom + 84;
      return Positioned(left: 16, right: 16, bottom: bottom, child: child);
    },
    child: Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.line),
          boxShadow: const [BoxShadow(color: Color(0x1A0F172A), blurRadius: 18, offset: Offset(0, 8))],
        ),
        child: Row(
          children: [
            Icon(icon, color: tone, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontSize: 14, height: 1.35, fontWeight: FontWeight.w500, color: AppColors.slate900),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class AppDialog extends StatelessWidget {
  const AppDialog({
    super.key,
    required this.title,
    this.message,
    this.icon,
    this.accent,
    this.body,
    this.actions,
    this.alignCenter = true,
  });

  final String title;
  final String? message;
  final IconData? icon;
  final Color? accent;
  final Widget? body;
  final List<Widget>? actions;
  final bool alignCenter;

  @override
  Widget build(BuildContext context) {
    final tone = accent ?? AppColors.primary;
    final textAlign = alignCenter ? TextAlign.center : TextAlign.start;
    return Dialog(
      backgroundColor: AppColors.white,
      surfaceTintColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.line),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: alignCenter ? CrossAxisAlignment.center : CrossAxisAlignment.stretch,
          children: [
            if (icon != null) ...[
              Align(
                alignment: Alignment.center,
                child: Container(
                  width: 52,
                  height: 52,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: tone.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: tone, size: 26),
                ),
              ),
              const SizedBox(height: 14),
            ],
            Text(
              title,
              textAlign: textAlign,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: -0.2, color: AppColors.slate900),
            ),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(message!, textAlign: textAlign, style: const TextStyle(fontSize: 14, height: 1.45, color: AppColors.slate500)),
            ],
            if (body != null) ...[
              const SizedBox(height: 14),
              body!,
            ],
            if (actions != null && actions!.isNotEmpty) ...[
              const SizedBox(height: 18),
              Row(children: _spaced(actions!)),
            ],
          ],
        ),
      ),
    );
  }
}

List<Widget> _spaced(List<Widget> actions) {
  final children = <Widget>[];
  for (var i = 0; i < actions.length; i++) {
    if (i > 0) children.add(const SizedBox(width: 10));
    children.add(Expanded(child: actions[i]));
  }
  return children;
}

Future<bool> showAppConfirm(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Confirm',
  bool danger = false,
  IconData icon = Icons.help_outline,
}) async {
  final accent = danger ? AppColors.rose : AppColors.primary;
  final result = await showDialog<bool>(
    context: context,
    builder: (context) {
      return AppDialog(
        title: title,
        message: message,
        icon: icon,
        accent: accent,
        actions: [
          OutlinedButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: accent),
            onPressed: () => Navigator.pop(context, true),
            child: Text(confirmLabel),
          ),
        ],
      );
    },
  );
  return result == true;
}

Future<DateTime?> showAppDatePicker(
  BuildContext context, {
  required DateTime initialDate,
  required DateTime firstDate,
  required DateTime lastDate,
}) {
  var selected = initialDate;
  return showDialog<DateTime>(
    context: context,
    builder: (context) {
      return Dialog(
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.line),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 18, 8, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Select a date', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: -0.2)),
              const SizedBox(height: 4),
              const Text('Tap a day, then confirm.', style: TextStyle(fontSize: 13, color: AppColors.slate500)),
              CalendarDatePicker(
                initialDate: initialDate,
                firstDate: firstDate,
                lastDate: lastDate,
                onDateChanged: (value) => selected = value,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  children: [
                    Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel'))),
                    const SizedBox(width: 10),
                    Expanded(child: FilledButton(onPressed: () => Navigator.pop(context, selected), child: const Text('Done'))),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

Future<TimeOfDay?> showAppTimePicker(BuildContext context, {required TimeOfDay initialTime}) {
  var hour = initialTime.hourOfPeriod == 0 ? 12 : initialTime.hourOfPeriod;
  var minute = initialTime.minute;
  var isAm = initialTime.period == DayPeriod.am;
  return showDialog<TimeOfDay>(
    context: context,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setLocal) {
          return AppDialog(
            title: 'Select a time',
            message: 'Adjust hours and minutes, then confirm.',
            icon: Icons.schedule_rounded,
            body: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _Step(
                  label: hour.toString().padLeft(2, '0'),
                  onUp: () => setLocal(() => hour = hour == 12 ? 1 : hour + 1),
                  onDown: () => setLocal(() => hour = hour == 1 ? 12 : hour - 1),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8),
                  child: Text(':', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w600, color: AppColors.slate700)),
                ),
                _Step(
                  label: minute.toString().padLeft(2, '0'),
                  onUp: () => setLocal(() => minute = (minute + 1) % 60),
                  onDown: () => setLocal(() => minute = (minute + 59) % 60),
                ),
                const SizedBox(width: 12),
                Column(
                  children: [
                    _PeriodChip(label: 'AM', selected: isAm, onTap: () => setLocal(() => isAm = true)),
                    const SizedBox(height: 8),
                    _PeriodChip(label: 'PM', selected: !isAm, onTap: () => setLocal(() => isAm = false)),
                  ],
                ),
              ],
            ),
            actions: [
              OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              FilledButton(
                onPressed: () {
                  var h = hour % 12;
                  if (!isAm) h += 12;
                  Navigator.pop(context, TimeOfDay(hour: h, minute: minute));
                },
                child: const Text('Done'),
              ),
            ],
          );
        },
      );
    },
  );
}

class _Step extends StatelessWidget {
  const _Step({required this.label, required this.onUp, required this.onDown});
  final String label;
  final VoidCallback onUp;
  final VoidCallback onDown;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        IconButton(onPressed: onUp, icon: const Icon(Icons.keyboard_arrow_up_rounded), color: AppColors.slate700),
        Container(
          width: 72,
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.slate50,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.line),
          ),
          child: Text(label, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w600, letterSpacing: -0.3)),
        ),
        IconButton(onPressed: onDown, icon: const Icon(Icons.keyboard_arrow_down_rounded), color: AppColors.slate700),
      ],
    );
  }
}

class _PeriodChip extends StatelessWidget {
  const _PeriodChip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.primary : AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: selected ? AppColors.primary : AppColors.line),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: selected ? Colors.white : AppColors.slate700)),
        ),
      ),
    );
  }
}
