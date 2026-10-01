import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

import '../app/theme.dart';

void showAppToast(String message, {bool error = false}) {
  Fluttertoast.showToast(
    msg: message,
    toastLength: Toast.LENGTH_SHORT,
    gravity: ToastGravity.BOTTOM,
    backgroundColor: error ? AppColors.rose : AppColors.slate900,
    textColor: Colors.white,
    fontSize: 14,
  );
}

Future<bool> showAppConfirm(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Confirm',
  bool danger = false,
  IconData icon = Icons.help_outline,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) {
      return Dialog(
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.symmetric(horizontal: 28),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(22, 22, 22, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: (danger ? AppColors.rose : AppColors.primary).withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: danger ? AppColors.rose : AppColors.primary),
              ),
              const SizedBox(height: 14),
              Text(title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(message, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, height: 1.4, color: AppColors.slate500)),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel'))),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      style: danger ? FilledButton.styleFrom(backgroundColor: AppColors.rose) : null,
                      onPressed: () => Navigator.pop(context, true),
                      child: Text(confirmLabel),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
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
        backgroundColor: Colors.white,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(8, 16, 8, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Select a date', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              CalendarDatePicker(
                initialDate: initialDate,
                firstDate: firstDate,
                lastDate: lastDate,
                onDateChanged: (value) => selected = value,
              ),
              Row(
                children: [
                  Expanded(child: TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel'))),
                  Expanded(child: FilledButton(onPressed: () => Navigator.pop(context, selected), child: const Text('Done'))),
                ],
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
          return Dialog(
            backgroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Select a time', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _Step(
                        label: hour.toString().padLeft(2, '0'),
                        onUp: () => setLocal(() => hour = hour == 12 ? 1 : hour + 1),
                        onDown: () => setLocal(() => hour = hour == 1 ? 12 : hour - 1),
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text(':', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
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
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(child: OutlinedButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel'))),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton(
                          onPressed: () {
                            var h = hour % 12;
                            if (!isAm) h += 12;
                            Navigator.pop(context, TimeOfDay(hour: h, minute: minute));
                          },
                          child: const Text('Done'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
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
        IconButton(onPressed: onUp, icon: const Icon(Icons.keyboard_arrow_up_rounded)),
        Container(
          width: 72,
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.slate50,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.slate200),
          ),
          child: Text(label, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
        ),
        IconButton(onPressed: onDown, icon: const Icon(Icons.keyboard_arrow_down_rounded)),
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
      color: selected ? AppColors.primary : AppColors.slate100,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Text(label, style: TextStyle(fontWeight: FontWeight.w800, color: selected ? Colors.white : AppColors.slate700)),
        ),
      ),
    );
  }
}
