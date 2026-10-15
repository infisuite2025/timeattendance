import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/api_client.dart';
import '../../core/app_state.dart';
import '../../shared/feedback.dart';
import '../../shared/widgets.dart';

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500, letterSpacing: 0.2));
  }
}

class _PickerRow extends StatelessWidget {
  const _PickerRow({required this.icon, required this.label, required this.value, required this.onTap, this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 12)});
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: padding,
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                  Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.slate400, size: 20),
          ],
        ),
      ),
    );
  }
}

class RaiseRegularisationScreen extends StatefulWidget {
  const RaiseRegularisationScreen({super.key, this.requestId, this.dateLabel});

  final String? requestId;
  final String? dateLabel;

  @override
  State<RaiseRegularisationScreen> createState() => _RaiseRegularisationScreenState();
}

class _RaiseRegularisationScreenState extends State<RaiseRegularisationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reason = TextEditingController();
  String _type = 'Missing Punch';
  String _issue = 'Missing Check-in';
  String _location = '';
  TimeOfDay _actual = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _corrected = const TimeOfDay(hour: 9, minute: 0);
  DateTime _date = DateTime.now();
  String? _attachment;
  late final bool _editing;

  static const _types = ['Missing Punch', 'Late Coming', 'Short Working Hours', 'Shift Change', 'Work From Home', 'Attendance Correction'];
  static const _issues = ['Missing Check-in', 'Missing Check-out', 'Wrong time', 'Wrong location'];

  @override
  void initState() {
    super.initState();
    final existing = widget.requestId == null
        ? null
        : context.read<AppState>().requests.where((r) => r.id == widget.requestId).firstOrNull;
    _editing = existing != null;
    if (existing != null) {
      _type = existing.type;
      _issue = _issues.contains(existing.issue) ? existing.issue : _issues.first;
      _location = existing.location;
      _reason.text = existing.reason;
      _attachment = existing.attachment;
    }
  }

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  String _fmt(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final suffix = time.period == DayPeriod.am ? 'AM' : 'PM';
    return '$hour:$minute $suffix';
  }

  String get _dateLabel {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${days[_date.weekday - 1]}, ${_date.day} ${months[_date.month - 1]} ${_date.year}';
  }

  Future<void> _pickDate() async {
    final picked = await showAppDatePicker(
      context,
      initialDate: _date,
      firstDate: DateTime(DateTime.now().year - 1),
      lastDate: DateTime(DateTime.now().year + 1, 12, 31),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _pickTime(bool actual) async {
    final picked = await showAppTimePicker(context, initialTime: actual ? _actual : _corrected);
    if (picked == null) return;
    setState(() {
      if (actual) {
        _actual = picked;
      } else {
        _corrected = picked;
      }
    });
  }

  Future<void> _save(String status) async {
    if (!_formKey.currentState!.validate()) return;
    if (status == 'Pending') {
      final confirmed = await showAppConfirm(
        context,
        title: 'Submit request?',
        message: 'This sends the regularisation to the workspace for approval.',
        confirmLabel: 'Submit',
        icon: Icons.send_rounded,
      );
      if (!confirmed || !mounted) return;
    }
    try {
      final places = context.read<AppState>().sites.map((site) => site.name).where((name) => name.isNotEmpty).toList();
      final location = places.contains(_location) ? _location : (places.isEmpty ? '' : places.first);
      await context.read<AppState>().saveRequest(
            id: _editing ? widget.requestId : null,
            type: _type,
            dateLabel: _dateLabel,
            attendanceDate: '${_date.year.toString().padLeft(4, '0')}-${_date.month.toString().padLeft(2, '0')}-${_date.day.toString().padLeft(2, '0')}',
            issue: _issue,
            actualTime: _fmt(_actual),
            correctedTime: _fmt(_corrected),
            location: location,
            reason: _reason.text.trim(),
            status: status,
            attachment: _attachment,
          );
      if (!mounted) return;
      showAppToast(
        context,
        status == 'Draft' ? 'Draft saved on this device.' : 'Request sent to the workspace.',
        success: true,
      );
      Navigator.pop(context);
    } on ApiException catch (error) {
      if (!mounted) return;
      showAppToast(context, error.message, error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final places = context.watch<AppState>().sites.map((site) => site.name).where((name) => name.isNotEmpty).toList();
    final location = places.contains(_location) ? _location : (places.isEmpty ? _location : places.first);
    return Scaffold(
      appBar: AppBar(title: Text(_editing ? 'Edit request' : 'Raise request')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            AppCard(
              color: AppColors.white,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 4, height: 40, decoration: BoxDecoration(color: AppColors.amber, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Correct $_dateLabel. Submit sends this request to the workspace.',
                      style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const _Label('What to correct'),
            const SizedBox(height: 8),
            AppCard(
              color: AppColors.white,
              child: Column(
                children: [
                  AppDropdown<String>(
                    value: _type,
                    label: 'Request type',
                    items: [for (final type in _types) DropdownMenuItem(value: type, child: Text(type))],
                    onChanged: (value) => setState(() => _type = value ?? _type),
                  ),
                  const SizedBox(height: 10),
                  _PickerRow(
                    icon: Icons.calendar_today_outlined,
                    label: 'Date',
                    value: _dateLabel,
                    onTap: _pickDate,
                    padding: const EdgeInsets.symmetric(vertical: 6),
                  ),
                  const SizedBox(height: 10),
                  AppDropdown<String>(
                    value: _issue,
                    label: 'Attendance issue',
                    items: [for (final issue in _issues) DropdownMenuItem(value: issue, child: Text(issue))],
                    onChanged: (value) => setState(() => _issue = value ?? _issue),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const _Label('Times'),
            const SizedBox(height: 8),
            AppCard(
              color: AppColors.white,
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _PickerRow(icon: Icons.schedule, label: 'Recorded time', value: _fmt(_actual), onTap: () => _pickTime(true)),
                  const Divider(height: 1, color: AppColors.line),
                  _PickerRow(icon: Icons.update, label: 'Time you want', value: _fmt(_corrected), onTap: () => _pickTime(false)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const _Label('Where you worked'),
            const SizedBox(height: 8),
            AppCard(
              color: AppColors.white,
              child: places.isEmpty
                  ? const Text('No locations are in the workspace yet.', style: TextStyle(fontSize: 13, color: AppColors.slate500))
                  : AppDropdown<String>(
                      value: location,
                      label: 'Location',
                      items: [for (final place in places) DropdownMenuItem(value: place, child: Text(place))],
                      onChanged: (value) => setState(() => _location = value ?? location),
                    ),
            ),
            const SizedBox(height: 16),
            const _Label('Why'),
            const SizedBox(height: 8),
            AppCard(
              color: AppColors.white,
              child: TextFormField(
                controller: _reason,
                maxLines: 4,
                maxLength: 500,
                decoration: const InputDecoration(alignLabelWithHint: true, labelText: 'Reason for the manager'),
                validator: (value) {
                  final text = value?.trim() ?? '';
                  if (text.length < 10) return 'Describe the correction in at least 10 characters';
                  return null;
                },
              ),
            ),
            const SizedBox(height: 12),
            InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () async {
                final choice = await showAppSheet<String>(
                  context,
                  title: 'Attachment',
                  message: 'PDF, JPG, or PNG · under 5 MB',
                  builder: (sheetContext) => OptionGroup(
                    children: [
                      for (final name in ['supporting-note.pdf', 'desk-pass.jpg', 'approval.png'])
                        SheetChoiceTile(
                          icon: Icons.attach_file_rounded,
                          title: name,
                          subtitle: 'Use this file with the request',
                          selected: _attachment == name,
                          onTap: () => Navigator.pop(sheetContext, name),
                        ),
                      SheetChoiceTile(
                        icon: Icons.delete_outline,
                        title: 'Remove attachment',
                        subtitle: 'Clear the file attached to this request',
                        destructive: true,
                        onTap: () async {
                          final confirmed = await showAppConfirm(
                            sheetContext,
                            title: 'Remove attachment?',
                            message: 'This clears the file attached to this request.',
                            confirmLabel: 'Remove',
                            danger: true,
                            icon: Icons.delete_outline,
                          );
                          if (!confirmed || !sheetContext.mounted) return;
                          Navigator.pop(sheetContext, '');
                        },
                      ),
                    ],
                  ),
                );
                if (!mounted || choice == null) return;
                setState(() => _attachment = choice.isEmpty ? null : choice);
              },
              child: AppCard(
                color: AppColors.white,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                child: Row(
                  children: [
                    Icon(_attachment == null ? Icons.attach_file_rounded : Icons.check_circle_outline, color: _attachment == null ? AppColors.slate500 : AppColors.emerald, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_attachment ?? 'Add a file', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                          Text(
                            _attachment == null ? 'PDF, JPG, or PNG · under 5 MB' : 'Tap to change or remove it',
                            style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.slate400, size: 20),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton(onPressed: () => _save('Draft'), child: const Text('Save draft')),
            const SizedBox(height: 8),
            FilledButton(onPressed: () => _save('Pending'), child: const Text('Submit request')),
          ],
        ),
      ),
    );
  }
}
