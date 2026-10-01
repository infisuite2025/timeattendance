import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../app/navigation.dart';
import '../../app/theme.dart';
import '../../core/app_state.dart';
import '../../shared/widgets.dart';
import 'raise_screen.dart';

class RegularisationDetailScreen extends StatelessWidget {
  const RegularisationDetailScreen({super.key, required this.requestId});

  final String requestId;

  @override
  Widget build(BuildContext context) {
    final request = context.watch<AppState>().requests.where((r) => r.id == requestId).firstOrNull;
    if (request == null) {
      return Scaffold(appBar: AppBar(title: const Text('Request')), body: const Center(child: Text('This request is no longer on the device.')));
    }
    final pending = request.status == 'Pending';
    return Scaffold(
      appBar: AppBar(title: const Text('Request Detail')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          AppCard(
            child: Row(
              children: [
                const AvatarBadge(initials: 'PN'),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.employeeName, style: const TextStyle(fontWeight: FontWeight.w800)),
                      Text('${request.employeeCode} · ${request.department}', style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
                    ],
                  ),
                ),
                StatusPill(label: request.status, color: colorForRequestStatus(request.status)),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Request information', style: TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                _line('Type', request.type),
                _line('Date', request.dateLabel),
                _line('Issue', request.issue),
                _line('Proposed correction', '${request.actualTime} → ${request.correctedTime}'),
                _line('Location', request.location),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Reason', style: TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 6),
                Text(request.reason, style: const TextStyle(height: 1.4)),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Attendance snapshot', style: TextStyle(fontWeight: FontWeight.w800)),
                const SizedBox(height: 8),
                _line('Original', request.actualTime),
                _line('Requested', request.correctedTime),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Text(
              request.attachment == null ? 'No attachment' : 'Attachment: ${request.attachment}',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(height: 10),
          const AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Approval workflow', style: TextStyle(fontWeight: FontWeight.w800)),
                SizedBox(height: 8),
                Text('1. Request submitted'),
                Text('2. Manager review — pending with Naresh Andukoori', style: TextStyle(color: AppColors.amber, fontWeight: FontWeight.w700)),
                Text('3. HR review — waiting'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: request.status == 'Draft' || request.status == 'Sent Back'
                ? () => openPage(context, RaiseRegularisationScreen(requestId: request.id))
                : null,
            child: const Text('Edit Request'),
          ),
          const SizedBox(height: 8),
          OutlinedButton(
            style: OutlinedButton.styleFrom(foregroundColor: AppColors.rose, side: const BorderSide(color: AppColors.rose)),
            onPressed: pending
                ? () {
                    context.read<AppState>().withdrawRequest(request.id);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Request withdrawn.')));
                  }
                : null,
            child: const Text('Withdraw Request'),
          ),
        ],
      ),
    );
  }

  Widget _line(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 130, child: Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 13))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        ],
      ),
    );
  }
}
