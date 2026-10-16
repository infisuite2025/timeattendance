import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/api_client.dart';
import '../../core/app_state.dart';
import '../../core/models.dart';
import '../../shared/feedback.dart';
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
          Text('${shifts.length} ${shifts.length == 1 ? 'shift' : 'shifts'}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 8),
          for (final shift in shifts) ...[
            AppCard(
              color: AppColors.white,
              onTap: () => openPage(context, CreateShiftScreen(existingId: shift.id)),
              padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(width: 4, height: 52, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(4))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(shift.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text('${shift.window} · ${shift.duration}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.slate700)),
                        const SizedBox(height: 2),
                        Text('Break ${shift.breakLabel}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                        Text('Late ${shift.graceLate} · Early ${shift.graceEarly}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      StatusPill(label: shift.code, color: AppColors.primary),
                      const Icon(Icons.chevron_right, color: AppColors.slate400),
                    ],
                  ),
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
  late TimeOfDay _startTime;
  late TimeOfDay _endTime;

  @override
  void initState() {
    super.initState();
    final existing = widget.existingId == null
        ? null
        : context.read<AppState>().shifts.where((s) => s.id == widget.existingId).firstOrNull;
    _name = TextEditingController(text: existing?.name ?? '');
    _code = TextEditingController(text: existing?.code ?? '');
    _startTime = _parseTime(existing?.start, const TimeOfDay(hour: 9, minute: 0));
    _endTime = _parseTime(existing?.end, const TimeOfDay(hour: 18, minute: 0));
    _start = TextEditingController(text: _fmt(_startTime));
    _end = TextEditingController(text: _fmt(_endTime));
    _break = TextEditingController(text: existing?.breakLabel ?? '01h 00m');
    _graceLate = TextEditingController(text: existing?.graceLate ?? '15 mins');
    _graceEarly = TextEditingController(text: existing?.graceEarly ?? '15 mins');
    for (final controller in [_name, _code, _break, _graceLate, _graceEarly]) {
      controller.addListener(() {
        if (mounted) setState(() {});
      });
    }
  }

  TimeOfDay _parseTime(String? raw, TimeOfDay fallback) {
    final match = RegExp(r'(\d{1,2}):(\d{2})\s*(AM|PM)', caseSensitive: false).firstMatch(raw ?? '');
    if (match == null) return fallback;
    var hour = int.parse(match.group(1)!);
    final minute = int.parse(match.group(2)!);
    final pm = match.group(3)!.toUpperCase() == 'PM';
    if (pm && hour != 12) hour += 12;
    if (!pm && hour == 12) hour = 0;
    return TimeOfDay(hour: hour, minute: minute);
  }

  String _fmt(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final minute = time.minute.toString().padLeft(2, '0');
    final suffix = time.period == DayPeriod.am ? 'AM' : 'PM';
    return '$hour:$minute $suffix';
  }

  Future<void> _pickTime(bool start) async {
    final picked = await showAppTimePicker(context, initialTime: start ? _startTime : _endTime);
    if (picked == null) return;
    setState(() {
      if (start) {
        _startTime = picked;
        _start.text = _fmt(picked);
      } else {
        _endTime = picked;
        _end.text = _fmt(picked);
      }
    });
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
      showAppToast(context, 'Name and code are required.', error: true);
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
    showAppToast(context, 'Shift saved on this device.', success: true);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.existingId != null;
    final title = _name.text.trim().isEmpty ? (editing ? 'This shift' : 'New shift') : _name.text.trim();
    final code = _code.text.trim().isEmpty ? '—' : _code.text.trim().toUpperCase();
    return Scaffold(
      appBar: AppBar(title: Text(editing ? 'Edit shift' : 'Create shift')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          AppCard(
            color: AppColors.white,
            padding: EdgeInsets.zero,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 5, decoration: const BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.vertical(top: Radius.circular(16)))),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(child: Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700))),
                          StatusPill(label: code, color: AppColors.primary),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text('${_fmt(_startTime)} – ${_fmt(_endTime)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                      const SizedBox(height: 4),
                      Text('Break ${_break.text.trim().isEmpty ? '—' : _break.text.trim()}', style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
                      Text(
                        'Late ${_graceLate.text.trim().isEmpty ? '—' : _graceLate.text.trim()} · Early ${_graceEarly.text.trim().isEmpty ? '—' : _graceEarly.text.trim()}',
                        style: const TextStyle(fontSize: 13, color: AppColors.slate500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Section('Name'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: Column(
              children: [
                TextField(controller: _name, textCapitalization: TextCapitalization.words, decoration: const InputDecoration(labelText: 'Shift name')),
                const SizedBox(height: 10),
                TextField(controller: _code, textCapitalization: TextCapitalization.characters, decoration: const InputDecoration(labelText: 'Short code')),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Section('Hours'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _TimeRow(icon: Icons.login_rounded, label: 'Starts', value: _fmt(_startTime), onTap: () => _pickTime(true)),
                const Divider(height: 1, color: AppColors.line),
                _TimeRow(icon: Icons.logout_rounded, label: 'Ends', value: _fmt(_endTime), onTap: () => _pickTime(false)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: TextField(controller: _break, decoration: const InputDecoration(labelText: 'Break')),
          ),
          const SizedBox(height: 8),
          const AppCard(
            color: AppColors.white,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Accent(color: AppColors.primary),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'If the shift ends the next morning, set the end time after midnight. That still counts as one shift.',
                    style: TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Section('Grace'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            child: Column(
              children: [
                TextField(controller: _graceLate, decoration: const InputDecoration(labelText: 'Late arrival grace')),
                const SizedBox(height: 10),
                TextField(controller: _graceEarly, decoration: const InputDecoration(labelText: 'Early exit grace')),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(onPressed: _save, child: Text(editing ? 'Save changes' : 'Save shift')),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500, letterSpacing: 0.2));
  }
}

class _TimeRow extends StatelessWidget {
  const _TimeRow({required this.icon, required this.label, required this.value, required this.onTap});
  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
                color: AppColors.white,
                padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
                onTap: () {
                  showAppSheet<void>(
                    context,
                    title: group.name,
                    message: '${group.employees} people · ${group.pattern}',
                    builder: (_) => AppCard(
                      color: AppColors.white,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(group.summary, style: const TextStyle(fontSize: 14, height: 1.4, color: AppColors.slate700)),
                          const SizedBox(height: 12),
                          for (var i = 0; i < group.shifts.length; i++) ...[
                            if (i > 0) const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.schedule, size: 16, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Expanded(child: Text(group.shifts[i], style: const TextStyle(fontWeight: FontWeight.w700))),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
                child: Row(
                  children: [
                    Container(width: 4, height: 44, decoration: BoxDecoration(color: AppColors.indigo, borderRadius: BorderRadius.circular(4))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(group.name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 2),
                          Text('${group.employees} people · ${group.pattern}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                          const SizedBox(height: 2),
                          Text(group.summary, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: AppColors.slate700)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.slate400),
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
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '$pending', label: 'Pending', color: AppColors.primary),
                _Count(value: '$approved', label: 'Approved', color: AppColors.emerald),
                _Count(value: '${swaps.length}', label: 'Total', color: AppColors.slate900),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text('${swaps.length} ${swaps.length == 1 ? 'swap' : 'swaps'}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate500)),
          const SizedBox(height: 8),
          for (final swap in swaps)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                color: AppColors.white,
                onTap: () => _sheet(context, swap),
                padding: const EdgeInsets.fromLTRB(14, 12, 10, 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 4,
                      height: 56,
                      decoration: BoxDecoration(color: colorForRequestStatus(swap.status), borderRadius: BorderRadius.circular(4)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(swap.dateLabel, style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text(swap.fromName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          Text(swap.fromShift, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                          const SizedBox(height: 4),
                          Text(swap.toName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          Text(swap.toShift, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        StatusPill(label: swap.status, color: colorForRequestStatus(swap.status)),
                        const Icon(Icons.chevron_right, color: AppColors.slate400),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _sheet(BuildContext context, SwapRequest swap) {
    final pending = swap.status == 'Pending';
    showAppSheet<void>(
      context,
      title: swap.id,
      message: swap.dateLabel,
      builder: (sheetContext) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppCard(
            color: AppColors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${swap.fromName} · ${swap.fromShift}', style: const TextStyle(fontWeight: FontWeight.w700)),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 6),
                  child: Icon(Icons.swap_vert, size: 18, color: AppColors.primary),
                ),
                Text('${swap.toName} · ${swap.toShift}', style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 10),
                Text(swap.reason, style: const TextStyle(fontSize: 13, height: 1.4, color: AppColors.slate700)),
              ],
            ),
          ),
          if (pending) ...[
            const SizedBox(height: 12),
            OptionGroup(
              children: [
                SheetChoiceTile(
                  icon: Icons.check_circle_outline,
                  title: 'Approve swap',
                  subtitle: 'Apply this exchange for both people',
                  onTap: () async {
                    final confirmed = await showAppConfirm(
                      sheetContext,
                      title: 'Approve swap?',
                      message: 'Approve ${swap.id} between ${swap.fromName} and ${swap.toName}?',
                      confirmLabel: 'Approve',
                      icon: Icons.check_circle_outline,
                    );
                    if (!confirmed || !context.mounted) return;
                    context.read<AppState>().decideSwap(swap.id, true);
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
                  },
                ),
                SheetChoiceTile(
                  icon: Icons.cancel_outlined,
                  title: 'Reject swap',
                  subtitle: 'Leave both shifts as they are',
                  destructive: true,
                  onTap: () async {
                    final confirmed = await showAppConfirm(
                      sheetContext,
                      title: 'Reject swap?',
                      message: 'Reject ${swap.id}? This swap will not be applied.',
                      confirmLabel: 'Reject',
                      danger: true,
                      icon: Icons.cancel_outlined,
                    );
                    if (!confirmed || !context.mounted) return;
                    context.read<AppState>().decideSwap(swap.id, false);
                    if (sheetContext.mounted) Navigator.pop(sheetContext);
                  },
                ),
              ],
            ),
          ],
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
  String _shift = '';
  final DateTime _today = DateTime.now();
  late DateTime _from = DateTime(_today.year, _today.month, _today.day);
  late DateTime _to = _from.add(const Duration(days: 4));
  bool _replace = true;
  bool _notify = true;

  String _label(DateTime date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final shiftNames = state.shifts.map((shift) => shift.name).toList();
    final selectedShift = shiftNames.contains(_shift) ? _shift : (shiftNames.isEmpty ? '' : shiftNames.first);
    return Scaffold(
      appBar: AppBar(title: const Text('Assign Shift')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              children: [
                const Text('Select the people who should receive this shift.', style: TextStyle(fontSize: 13, height: 1.35, color: AppColors.slate500)),
                const SizedBox(height: 12),
                for (final person in state.team) ...[
                  AppCard(
                    color: AppColors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    onTap: () {
                      setState(() {
                        if (_selected.contains(person.id)) {
                          _selected.remove(person.id);
                        } else {
                          _selected.add(person.id);
                        }
                      });
                    },
                    child: Row(
                      children: [
                        Checkbox(
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
                        ),
                        AvatarBadge(initials: person.initials, size: 36),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(person.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                              Text('${person.code} · ${state.shiftFor(person)}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ],
            ),
          ),
          Material(
            color: AppColors.white,
            child: Container(
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.line))),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (shiftNames.isEmpty)
                    const Text('No shifts are in the workspace yet. Create one in Shift Library first.', style: TextStyle(fontSize: 13, color: AppColors.slate500))
                  else
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
                  SizedBox(height: 48, child: FilledButton(
                    onPressed: _selected.isEmpty || selectedShift.isEmpty
                        ? null
                        : () async {
                            if (_to.isBefore(_from)) {
                              showAppToast(context, 'Effective to cannot be before effective from.', error: true);
                              return;
                            }
                            final targets = _replace
                                ? _selected.toList()
                                : _selected.where((id) => !state.assignments.containsKey(id)).toList();
                            if (targets.isEmpty) {
                              showAppToast(context, 'Everyone selected already has a shift. Turn on replace to overwrite it.', error: true);
                              return;
                            }
                            final confirmed = await showAppConfirm(
                              context,
                              title: 'Assign this shift?',
                              message: '$selectedShift will be assigned to ${targets.length} ${targets.length == 1 ? 'person' : 'people'}.',
                              confirmLabel: 'Assign',
                              icon: Icons.event_available_outlined,
                            );
                            if (!confirmed || !context.mounted) return;
                            try {
                              await context.read<AppState>().assignShift(employeeIds: targets, shiftName: selectedShift);
                            } on ApiException catch (error) {
                              if (!context.mounted) return;
                              showAppToast(context, error.message, error: true);
                              return;
                            }
                            if (!context.mounted) return;
                            showAppToast(
                              context,
                              '$selectedShift assigned to ${targets.length} people${_notify ? '. They will see it on this device.' : '.'}',
                              success: true,
                            );
                            Navigator.pop(context);
                          },
                    child: const Text('Assign Shift'),
                  )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pick(bool from) async {
    final picked = await showAppDatePicker(
      context,
      initialDate: from ? _from : _to,
      firstDate: DateTime(_today.year - 1),
      lastDate: DateTime(_today.year + 1, 12, 31),
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
    final people = state.canManageTeam
        ? state.roster
        : state.roster.where((person) => person.name == state.displayName).toList();
    final days = people.isEmpty ? const <String>[] : people.first.days.map((cell) => cell.dayName).toList();
    final shifts = <String>{
      for (final person in people)
        for (final cell in person.days)
          if (cell.shiftName.isNotEmpty) cell.shiftName,
    }.toList();
    return Scaffold(
      appBar: AppBar(title: Text(state.canManageTeam ? 'Team schedule' : 'My schedule')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              children: [
                _Count(value: '${people.length}', label: 'People', color: AppColors.slate900),
                _Count(value: '${shifts.length}', label: 'Shifts', color: AppColors.primary),
                _Count(value: state.schedulePublished ? 'Live' : 'Draft', label: 'Week', color: state.schedulePublished ? AppColors.emerald : AppColors.amber),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            color: AppColors.white,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Accent(color: state.schedulePublished ? AppColors.emerald : AppColors.amber),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(state.scheduleNote, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 2),
                      Text(
                        state.canManageTeam ? 'Assigned shifts for this week.' : 'Your assigned shift for this week.',
                        style: const TextStyle(fontSize: 12, height: 1.35, color: AppColors.slate500),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _Section('Roster'),
          const SizedBox(height: 8),
          AppCard(
            color: AppColors.white,
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Column(
              children: [
                Row(
                  children: [
                    const SizedBox(width: 112),
                    for (final day in days)
                      Expanded(
                        child: Text(day, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.slate500)),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                if (people.isEmpty)
                  const Padding(padding: EdgeInsets.all(12), child: Text('No roster has been published for this week.'))
                else
                  for (var i = 0; i < people.length; i++) ...[
                    if (i > 0) const Divider(height: 12, color: AppColors.line),
                    _RosterRow(person: people[i]),
                  ],
              ],
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final shift in shifts)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppColors.line),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 8, height: 8, decoration: BoxDecoration(color: _shiftColor(shift), shape: BoxShape.circle)),
                      const SizedBox(width: 6),
                      Text(shift, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
            ],
          ),
          if (state.canAdminister) ...[
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () => openPage(context, const ShiftAssignmentScreen()),
              child: const Text('Assign shift'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () async {
                final confirmed = await showAppConfirm(
                  context,
                  title: 'Copy last week?',
                  message: 'This replaces the current roster with last week’s assignments.',
                  confirmLabel: 'Copy week',
                  icon: Icons.content_copy_rounded,
                );
                if (!confirmed || !context.mounted) return;
                context.read<AppState>().copyLastWeek();
              },
              child: const Text('Copy last week'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(
              onPressed: () async {
                final confirmed = await showAppConfirm(
                  context,
                  title: 'Publish schedule?',
                  message: 'Publishing makes this week visible to the team.',
                  confirmLabel: 'Publish',
                  icon: Icons.publish_rounded,
                );
                if (!confirmed || !context.mounted) return;
                context.read<AppState>().publishSchedule();
              },
              child: const Text('Publish schedule'),
            ),
          ),
          ],
        ],
      ),
    );
  }

  Color _shiftColor(String shift) {
    const colors = [AppColors.primary, AppColors.emerald, AppColors.amber, AppColors.purple, AppColors.rose, AppColors.indigo];
    var hash = 0;
    for (final unit in shift.codeUnits) {
      hash = (hash + unit) % colors.length;
    }
    return colors[hash];
  }
}

class _RosterRow extends StatelessWidget {
  const _RosterRow({required this.person});
  final RosterPerson person;

  @override
  Widget build(BuildContext context) {
    final initials = person.name.trim().isEmpty
        ? '—'
        : person.name.trim().split(RegExp(r'\s+')).take(2).map((part) => part[0]).join().toUpperCase();
    return Row(
      children: [
        SizedBox(
          width: 112,
          child: Row(
            children: [
              AvatarBadge(initials: initials, size: 28),
              const SizedBox(width: 8),
              Expanded(
                child: Text(person.name.split(' ').first, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
        for (final cell in person.days)
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Container(
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: _tone(cell.shiftName.isEmpty ? cell.code : cell.shiftName), borderRadius: BorderRadius.circular(8)),
                child: Text(cell.code, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.white)),
              ),
            ),
          ),
      ],
    );
  }

  Color _tone(String value) {
    const colors = [AppColors.primary, AppColors.emerald, AppColors.amber, AppColors.purple, AppColors.rose, AppColors.indigo];
    var hash = 0;
    for (final unit in value.codeUnits) {
      hash = (hash + unit) % colors.length;
    }
    return colors[hash];
  }
}

class _Accent extends StatelessWidget {
  const _Accent({required this.color});
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(width: 4, height: 36, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)));
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
