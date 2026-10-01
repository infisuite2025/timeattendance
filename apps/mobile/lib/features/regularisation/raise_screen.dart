import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/theme.dart';
import '../../core/api_client.dart';
import '../../core/app_state.dart';
import '../../shared/widgets.dart';

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
  String _location = 'Client Site';
  TimeOfDay _actual = const TimeOfDay(hour: 9, minute: 5);
  TimeOfDay _corrected = const TimeOfDay(hour: 9, minute: 0);
  DateTime _date = DateTime(2024, 9, 12);
  String? _attachment;
  late final bool _editing;

  static const _types = ['Missing Punch', 'Late Coming', 'Short Working Hours', 'Shift Change', 'Work From Home', 'Attendance Correction'];
  static const _issues = ['Missing Check-in', 'Missing Check-out', 'Wrong time', 'Wrong location'];
  static const _locations = ['Bangalore HQ', 'Client Site', 'Hyderabad Office', 'Chennai Plant', 'Remote'];

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
      _location = _locations.contains(existing.location) ? existing.location : _locations.first;
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
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2024, 1, 1),
      lastDate: DateTime(2024, 12, 31),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _pickTime(bool actual) async {
    final picked = await showTimePicker(context: context, initialTime: actual ? _actual : _corrected);
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
    try {
      await context.read<AppState>().saveRequest(
            id: _editing ? widget.requestId : null,
            type: _type,
            dateLabel: _dateLabel,
            issue: _issue,
            actualTime: _fmt(_actual),
            correctedTime: _fmt(_corrected),
            location: _location,
            reason: _reason.text.trim(),
            status: status,
            attachment: _attachment,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(status == 'Draft' ? 'Draft saved on this device.' : 'Request sent to the workspace.')),
      );
      Navigator.pop(context);
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_editing ? 'Edit request' : 'Raise Regularisation')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: AppColors.roseSoft, borderRadius: BorderRadius.circular(14)),
              child: Text(
                'Attendance on $_dateLabel (General Shift). Check-in: Not recorded. Check-out: 06:12 PM recorded.',
                style: const TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate700),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Request information', style: TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            AppDropdown<String>(
              value: _type,
              label: 'Request type',
              items: [for (final type in _types) DropdownMenuItem(value: type, child: Text(type))],
              onChanged: (value) => setState(() => _type = value ?? _type),
            ),
            const SizedBox(height: 10),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Date'),
              subtitle: Text(_dateLabel),
              trailing: const Icon(Icons.calendar_today_outlined),
              onTap: _pickDate,
            ),
            AppDropdown<String>(
              value: _issue,
              label: 'Attendance issue',
              items: [for (final issue in _issues) DropdownMenuItem(value: issue, child: Text(issue))],
              onChanged: (value) => setState(() => _issue = value ?? _issue),
            ),
            const SizedBox(height: 16),
            const Text('Time details', style: TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: OutlinedButton(onPressed: () => _pickTime(true), child: Text('Actual ${_fmt(_actual)}'))),
                const SizedBox(width: 8),
                Expanded(child: OutlinedButton(onPressed: () => _pickTime(false), child: Text('Corrected ${_fmt(_corrected)}'))),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Work location', style: TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            AppDropdown<String>(
              value: _location,
              label: 'Location',
              items: [for (final place in _locations) DropdownMenuItem(value: place, child: Text(place))],
              onChanged: (value) => setState(() => _location = value ?? _location),
            ),
            const SizedBox(height: 16),
            const Text('Additional information', style: TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _reason,
              maxLines: 4,
              maxLength: 500,
              decoration: const InputDecoration(alignLabelWithHint: true, labelText: 'Reason'),
              validator: (value) {
                final text = value?.trim() ?? '';
                if (text.length < 10) return 'Describe the correction in at least 10 characters';
                return null;
              },
            ),
            const SizedBox(height: 8),
            InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: () async {
                final choice = await showModalBottomSheet<String>(
                  context: context,
                  showDragHandle: true,
                  builder: (context) => SafeArea(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const ListTile(title: Text('Attach a file stored with this request')),
                        for (final name in ['supporting-note.pdf', 'desk-pass.jpg', 'approval.png'])
                          ListTile(
                            leading: const Icon(Icons.attach_file),
                            title: Text(name),
                            subtitle: const Text('PDF, JPG, or PNG · under 5 MB'),
                            onTap: () => Navigator.pop(context, name),
                          ),
                        ListTile(
                          leading: const Icon(Icons.close),
                          title: const Text('Remove attachment'),
                          onTap: () => Navigator.pop(context, ''),
                        ),
                      ],
                    ),
                  ),
                );
                if (!mounted || choice == null) return;
                setState(() => _attachment = choice.isEmpty ? null : choice);
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.slate200),
                  color: AppColors.slate50,
                ),
                child: Text(
                  _attachment == null ? 'Tap to upload an attachment. PDF, JPG, PNG. Max 5 MB.' : 'Attached: $_attachment',
                  style: const TextStyle(fontSize: 13, color: AppColors.slate700),
                ),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton(onPressed: () => _save('Draft'), child: const Text('Save Draft')),
            const SizedBox(height: 8),
            FilledButton(onPressed: () => _save('Pending'), child: const Text('Submit Request')),
          ],
        ),
      ),
    );
  }
}
