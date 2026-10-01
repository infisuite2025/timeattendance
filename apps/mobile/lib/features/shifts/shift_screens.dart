import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../core/demo_data.dart';
import '../../core/models.dart';
import '../../shared/widgets.dart';

class ShiftLibraryScreen extends StatelessWidget {
  const ShiftLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final shifts = context.watch<AppState>().shifts;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shift Library'),
        actions: [
          IconButton(onPressed: () => openPage(context, const CreateShiftScreen()), icon: const Icon(Icons.add)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          for (final shift in shifts) ...[
            AppCard(
              onTap: () => openPage(context, CreateShiftScreen(existingId: shift.id)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(shift.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16))),
                      StatusPill(label: shift.code, color: AppColors.primary, soft: const Color(0xFFEFF6FF)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('${shift.window} · ${shift.duration}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text('Break ${shift.breakLabel}', style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
                  Text('Late grace ${shift.graceLate} · Early exit grace ${shift.graceEarly}', style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}

class CreateShiftScreen extends StatefulWidget {
  const CreateShiftScreen({super.key, this.existingId});

  final String? existingId;

  @override
  State<CreateShiftScreen> createState() => _CreateShiftScreenState();
}

class _CreateShiftScreenState extends State<CreateShiftScreen> {
  late final TextEditingController _name;
  late final TextEditingController _code;
  late final TextEditingController _start;
  late final TextEditingController _end;
  late final TextEditingController _break;
  late final TextEditingController _graceLate;
  late final TextEditingController _graceEarly;
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    final existing = widget.existingId == null
        ? null
        : context.read<AppState>().shifts.where((s) => s.id == widget.existingId).firstOrNull;
    _name = TextEditingController(text: existing?.name ?? '');
    _code = TextEditingController(text: existing?.code ?? '');
    _start = TextEditingController(text: existing?.start ?? '09:00 AM');
    _end = TextEditingController(text: existing?.end ?? '06:00 PM');
    _break = TextEditingController(text: existing?.breakLabel ?? '01h 00m');
    _graceLate = TextEditingController(text: existing?.graceLate ?? '15 mins');
    _graceEarly = TextEditingController(text: existing?.graceEarly ?? '15 mins');
  }

  @override
  void dispose() {
    _name.dispose();
    _code.dispose();
    _start.dispose();
    _end.dispose();
    _break.dispose();
    _graceLate.dispose();
    _graceEarly.dispose();
    super.dispose();
  }

  void _save() {
    if (_name.text.trim().isEmpty || _code.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Name and code are required.')));
      setState(() => _tab = 0);
      return;
    }
    final id = widget.existingId ?? _code.text.trim().toUpperCase();
    context.read<AppState>().addShift(
          ShiftTemplate(
            id: id,
            name: _name.text.trim(),
            code: _code.text.trim().toUpperCase(),
            start: _start.text.trim(),
            end: _end.text.trim(),
            breakLabel: _break.text.trim(),
            graceLate: _graceLate.text.trim(),
            graceEarly: _graceEarly.text.trim(),
            duration: 'See timings',
          ),
        );
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Shift saved on this device.')));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.existingId == null ? 'Create Shift' : 'Edit Shift')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('Basics')),
                ButtonSegment(value: 1, label: Text('Timings')),
                ButtonSegment(value: 2, label: Text('Rules')),
                ButtonSegment(value: 3, label: Text('Preview')),
              ],
              selected: {_tab},
              onSelectionChanged: (value) => setState(() => _tab = value.first),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_tab == 0) ...[
                  TextField(controller: _name, decoration: const InputDecoration(labelText: 'Shift name')),
                  const SizedBox(height: 10),
                  TextField(controller: _code, decoration: const InputDecoration(labelText: 'Code')),
                ],
                if (_tab == 1) ...[
                  TextField(controller: _start, decoration: const InputDecoration(labelText: 'Start')),
                  const SizedBox(height: 10),
                  TextField(controller: _end, decoration: const InputDecoration(labelText: 'End')),
                  const SizedBox(height: 10),
                  TextField(controller: _break, decoration: const InputDecoration(labelText: 'Break')),
                  const SizedBox(height: 8),
                  const Text('Overnight shifts are allowed when the end time is on the next morning.', style: TextStyle(fontSize: 12, color: AppColors.slate500)),
                ],
                if (_tab == 2) ...[
                  TextField(controller: _graceLate, decoration: const InputDecoration(labelText: 'Late grace')),
                  const SizedBox(height: 10),
                  TextField(controller: _graceEarly, decoration: const InputDecoration(labelText: 'Early exit grace')),
                ],
                if (_tab == 3)
                  AppCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_name.text.isEmpty ? 'Untitled shift' : _name.text, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                        const SizedBox(height: 6),
                        Text('${_code.text.isEmpty ? '—' : _code.text.toUpperCase()} · ${_start.text} – ${_end.text}'),
                        Text('Break ${_break.text}'),
                        Text('Late ${_graceLate.text} · Early exit ${_graceEarly.text}'),
                      ],
                    ),
                  ),
                const SizedBox(height: 16),
                FilledButton(onPressed: _save, child: const Text('Save shift')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ShiftGroupsScreen extends StatelessWidget {
  const ShiftGroupsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final groups = context.watch<AppState>().groups;
    return Scaffold(
      appBar: AppBar(title: const Text('Shift Groups')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          for (final group in groups)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                onTap: () {
                  showInfoSheet(
                    context,
                    title: group.name,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${group.employees} employees · ${group.pattern}'),
                        const SizedBox(height: 8),
                        Text(group.summary),
                        const SizedBox(height: 8),
                        for (final shift in group.shifts) Text('• $shift'),
                      ],
                    ),
                  );
                },
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(group.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                          Text('${group.employees} people · ${group.pattern}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                          Text(group.summary, style: const TextStyle(fontSize: 13)),
                        ],
                      ),
                    ),
                    const Icon(Icons.expand_less, color: AppColors.slate400),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class ShiftSwapsScreen extends StatelessWidget {
  const ShiftSwapsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final swaps = context.watch<AppState>().swaps;
    final pending = swaps.where((s) => s.status == 'Pending').length;
    final approved = swaps.where((s) => s.status == 'Approved').length;
    return Scaffold(
      appBar: AppBar(title: const Text('Shift Swaps')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Row(
            children: [
              Expanded(child: MetricTile(value: '$pending', label: 'Pending', color: AppColors.primary)),
              const SizedBox(width: 8),
              Expanded(child: MetricTile(value: '$approved', label: 'Approved', color: AppColors.emerald)),
            ],
          ),
          const SizedBox(height: 12),
          for (final swap in swaps)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                onTap: () => _sheet(context, swap),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(swap.id, style: const TextStyle(fontWeight: FontWeight.w800))),
                        StatusPill(label: swap.status, color: colorForRequestStatus(swap.status)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('${swap.fromName} · ${swap.fromShift}'),
                    const Icon(Icons.swap_vert, size: 16, color: AppColors.slate400),
                    Text('${swap.toName} · ${swap.toShift}'),
                    Text(swap.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _sheet(BuildContext context, SwapRequest swap) {
    showInfoSheet(
      context,
      title: swap.id,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${swap.fromName} (${swap.fromShift}) swaps with ${swap.toName} (${swap.toShift}) on ${swap.dateLabel}.'),
          const SizedBox(height: 8),
          Text(swap.reason),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose),
                  onPressed: swap.status == 'Pending'
                      ? () {
                          context.read<AppState>().decideSwap(swap.id, false);
                          Navigator.pop(context);
                        }
                      : null,
                  child: const Text('Reject'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton(
                  onPressed: swap.status == 'Pending'
                      ? () {
                          context.read<AppState>().decideSwap(swap.id, true);
                          Navigator.pop(context);
                        }
                      : null,
                  child: const Text('Approve'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class ShiftAssignmentScreen extends StatefulWidget {
  const ShiftAssignmentScreen({super.key});

  @override
  State<ShiftAssignmentScreen> createState() => _ShiftAssignmentScreenState();
}

class _ShiftAssignmentScreenState extends State<ShiftAssignmentScreen> {
  final _selected = <String>{};
  String _shift = 'General Shift';
  DateTime _from = DateTime(2024, 9, 16);
  DateTime _to = DateTime(2024, 9, 20);
  bool _replace = true;
  bool _notify = true;

  String _label(DateTime date) => '${date.day} Sep 2024';

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final shiftNames = state.shifts.map((shift) => shift.name).toList();
    final selectedShift = shiftNames.contains(_shift) ? _shift : shiftNames.first;
    return Scaffold(
      appBar: AppBar(title: const Text('Assign Shift')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              children: [
                const Text('Select the people who should receive this shift.', style: TextStyle(color: AppColors.slate500)),
                const SizedBox(height: 8),
                for (final person in state.team)
                  CheckboxListTile(
                    value: _selected.contains(person.id),
                    onChanged: (value) {
                      setState(() {
                        if (value == true) {
                          _selected.add(person.id);
                        } else {
                          _selected.remove(person.id);
                        }
                      });
                    },
                    secondary: AvatarBadge(initials: person.initials, size: 32),
                    title: Text(person.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    subtitle: Text('${person.code} · ${state.shiftFor(person)}'),
                    controlAffinity: ListTileControlAffinity.leading,
                  ),
              ],
            ),
          ),
          Material(
            elevation: 8,
            color: AppColors.white,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  AppDropdown<String>(
                    value: selectedShift,
                    label: 'Shift',
                    items: [for (final shift in state.shifts) DropdownMenuItem(value: shift.name, child: Text(shift.name))],
                    onChanged: (value) => setState(() => _shift = value ?? selectedShift),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: OutlinedButton(onPressed: () => _pick(true), child: Text('From ${_label(_from)}'))),
                      const SizedBox(width: 8),
                      Expanded(child: OutlinedButton(onPressed: () => _pick(false), child: Text('To ${_label(_to)}'))),
                    ],
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Replace existing shifts'),
                    value: _replace,
                    onChanged: (value) => setState(() => _replace = value),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Send notification'),
                    value: _notify,
                    onChanged: (value) => setState(() => _notify = value),
                  ),
                  FilledButton(
                    onPressed: _selected.isEmpty
                        ? null
                        : () {
                            if (_to.isBefore(_from)) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Effective to cannot be before effective from.')));
                              return;
                            }
                            final targets = _replace
                                ? _selected.toList()
                                : _selected.where((id) => !state.assignments.containsKey(id)).toList();
                            if (targets.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Everyone selected already has a shift. Turn on replace to overwrite it.')));
                              return;
                            }
                            context.read<AppState>().assignShift(employeeIds: targets, shiftName: selectedShift);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('$selectedShift assigned to ${targets.length} people${_notify ? '. They will see it on this device.' : '.'}')),
                            );
                            Navigator.pop(context);
                          },
                    child: const Text('Assign Shift'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pick(bool from) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: from ? _from : _to,
      firstDate: DateTime(2024, 9, 1),
      lastDate: DateTime(2024, 9, 30),
    );
    if (picked == null) return;
    setState(() {
      if (from) {
        _from = picked;
      } else {
        _to = picked;
      }
    });
  }
}

class TeamScheduleScreen extends StatelessWidget {
  const TeamScheduleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final people = state.team.take(8).toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Team Schedule')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          Text(state.scheduleNote, style: const TextStyle(color: AppColors.slate500, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final shift in state.shifts.take(4))
                StatusPill(label: shift.code, color: AppColors.primary, soft: const Color(0xFFEFF6FF)),
            ],
          ),
          const SizedBox(height: 12),
          for (final person in people)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(person.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        for (final day in DemoData.weekDays)
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 2),
                              child: Column(
                                children: [
                                  Text(day, style: const TextStyle(fontSize: 10, color: AppColors.slate500)),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(vertical: 6),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFEFF6FF),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      _code(state.shiftFor(person)),
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          AppCard(
            child: Text(
              state.schedulePublished ? 'Staffing summary: the published week covers ${people.length} people on their assigned shift.' : 'This week is still a draft.',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: () => context.read<AppState>().copyLastWeek(), child: const Text('Copy Last Week')),
          const SizedBox(height: 8),
          OutlinedButton(onPressed: () => openPage(context, const ShiftAssignmentScreen()), child: const Text('Assign Shift')),
          const SizedBox(height: 8),
          FilledButton(onPressed: () => context.read<AppState>().publishSchedule(), child: const Text('Publish Schedule')),
        ],
      ),
    );
  }

  String _code(String shift) {
    final parts = shift.split(' ');
    if (parts.isEmpty) return '—';
    return parts.first.substring(0, parts.first.length >= 2 ? 2 : 1).toUpperCase();
  }
}
