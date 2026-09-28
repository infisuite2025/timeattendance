import {
  UnifiedApprovalItemDTO,
  ApprovalDecisionRequestDTO,
  BulkApprovalDecisionRequestDTO,
  ApprovalHistoryLogDTO,
  ApprovalInboxMetricsDTO
} from '@infi-timepro/shared-types';

export class ApprovalsService {
  private static items: UnifiedApprovalItemDTO[] = [
    {
      id: 'appr-001',
      requestCode: 'REG-8092',
      category: 'regularisation',
      employeeId: 'emp-002',
      employeeCode: 'EMP-1002',
      employeeName: 'Michael Chang',
      department: 'Product Design',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      targetDate: '2026-09-14',
      title: 'Check-In Correction (09:00 AM)',
      summaryDetails: 'Requested IN time 09:00 AM instead of missing punch due to main gate terminal timeout.',
      originalValues: 'IN: --:-- | OUT: 06:25 PM',
      requestedValues: 'IN: 09:00 AM | OUT: 06:25 PM',
      reasonCategory: 'Biometric Device Failure',
      reasonText: 'Main gate facial terminal showed timeout error during 9 AM morning rush.',
      currentTier: 1,
      maxTiers: 2,
      priority: 'high',
      slaHoursRemaining: 8,
      status: 'pending',
      submittedAt: '2026-09-14T09:30:00.000Z'
    },
    {
      id: 'appr-002',
      requestCode: 'OT-4103',
      category: 'overtime',
      employeeId: 'emp-006',
      employeeCode: 'EMP-1006',
      employeeName: 'Vikram Malhotra',
      department: 'Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      targetDate: '2026-09-14',
      title: 'Night Shift Overtime Claim (+1h 30m)',
      summaryDetails: 'Database index rebuild and high volume stress testing deliverable.',
      requestedValues: 'Claimed: 90 mins (1.5h) | Project: PRJ-DB-OPTIMIZE',
      claimedDurationMinutes: 90,
      policyCalculatedMinutes: 90,
      reasonText: 'Database index rebuild and high volume stress testing.',
      currentTier: 1,
      maxTiers: 1,
      priority: 'medium',
      slaHoursRemaining: 18,
      status: 'pending',
      submittedAt: '2026-09-14T06:45:00.000Z'
    },
    {
      id: 'appr-003',
      requestCode: 'SWP-3011',
      category: 'shift_swap',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      targetDate: '2026-09-18',
      title: 'Shift Exchange with Michael Chang',
      summaryDetails: 'Exchanging Morning Shift (07:00-15:30) for General Shift (09:00-18:00).',
      requestedValues: 'Morning Shift ↔ General Shift',
      swapPartnerName: 'Michael Chang',
      swapPartnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      restPeriodCompliance: true,
      reasonText: 'Family emergency doctor consultation scheduled on Friday morning.',
      currentTier: 1,
      maxTiers: 1,
      priority: 'high',
      slaHoursRemaining: 12,
      status: 'pending',
      submittedAt: '2026-09-14T08:10:00.000Z'
    },
    {
      id: 'appr-004',
      requestCode: 'REG-8093',
      category: 'regularisation',
      employeeId: 'emp-003',
      employeeCode: 'EMP-1003',
      employeeName: 'Priya Sharma',
      department: 'Operations',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      targetDate: '2026-09-14',
      title: 'On-Duty Client Visit (07:00 AM)',
      summaryDetails: 'Direct dispatch to vendor logistics hub in Whitefield for inspection.',
      originalValues: 'IN: 07:35 AM | OUT: 03:40 PM',
      requestedValues: 'IN: 07:00 AM | OUT: 03:40 PM',
      reasonCategory: 'On-Duty Client Visit',
      reasonText: 'Directly reported to vendor logistics hub in Whitefield for dispatch inspection.',
      currentTier: 1,
      maxTiers: 1,
      priority: 'medium',
      slaHoursRemaining: 22,
      status: 'pending',
      submittedAt: '2026-09-14T08:00:00.000Z'
    }
  ];

  private static history: ApprovalHistoryLogDTO[] = [
    {
      id: 'hist-001',
      requestCode: 'REG-8090',
      category: 'regularisation',
      employeeName: 'Sarah Jenkins',
      employeeCode: 'EMP-1001',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      decision: 'approved',
      approverName: 'David Rodriguez',
      approverRole: 'VP Engineering',
      decisionTimestamp: '2026-09-12T11:30:00.000Z',
      comments: 'WFH window pre-approved for cloud migration support.',
      impactSummary: 'Attendance status recalculated from Absent to Present (8h net hours credited)'
    },
    {
      id: 'hist-002',
      requestCode: 'OT-4102',
      category: 'overtime',
      employeeName: 'Sarah Jenkins',
      employeeCode: 'EMP-1001',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      decision: 'approved',
      approverName: 'David Rodriguez',
      approverRole: 'VP Engineering',
      decisionTimestamp: '2026-09-14T08:15:00.000Z',
      comments: 'Approved 1h 50m calculated OT duration.',
      impactSummary: '110 minutes OT approved at 1.5x payroll multiplier ($137.50 payable)'
    }
  ];

  static async getInbox(filter?: { category?: string; status?: string; search?: string }): Promise<UnifiedApprovalItemDTO[]> {
    let list = [...this.items];
    if (filter?.category && filter.category !== 'all') {
      list = list.filter(i => i.category === filter.category);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(i => i.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(i => i.employeeName.toLowerCase().includes(q) || i.requestCode.toLowerCase().includes(q) || i.title.toLowerCase().includes(q));
    }
    return list;
  }

  static async getMetrics(): Promise<ApprovalInboxMetricsDTO> {
    const pending = this.items.filter(i => i.status === 'pending');
    return {
      pendingMyActionCount: pending.length,
      escalatedCount: pending.filter(i => i.slaHoursRemaining < 10).length,
      approvalsCompletedThisMonth: this.history.length + 18,
      avgTurnaroundHours: 3.8,
      regularisationsPending: pending.filter(i => i.category === 'regularisation').length,
      overtimePending: pending.filter(i => i.category === 'overtime').length,
      shiftSwapsPending: pending.filter(i => i.category === 'shift_swap').length
    };
  }

  static async submitDecision(payload: ApprovalDecisionRequestDTO, approverName: string): Promise<UnifiedApprovalItemDTO> {
    const item = this.items.find(i => i.id === payload.approvalId);
    if (!item) throw new Error('Approval request not found');

    item.status = payload.decision === 'approved' ? 'approved' : (payload.decision === 'rejected' ? 'rejected' : 'sent_back');

    this.history.unshift({
      id: `hist-${Date.now()}`,
      requestCode: item.requestCode,
      category: item.category,
      employeeName: item.employeeName,
      employeeCode: item.employeeCode,
      avatarUrl: item.avatarUrl,
      decision: payload.decision,
      approverName,
      approverRole: 'Manager & Approver',
      decisionTimestamp: new Date().toISOString(),
      comments: payload.comments || 'Processed via Approvals Hub',
      impactSummary: `Decision: ${payload.decision.toUpperCase()} - Status updated.`
    });

    return item;
  }

  static async bulkDecision(payload: BulkApprovalDecisionRequestDTO, approverName: string): Promise<{ count: number }> {
    let count = 0;
    for (const id of payload.approvalIds) {
      const item = this.items.find(i => i.id === id);
      if (item && item.status === 'pending') {
        item.status = payload.decision;
        count++;
        this.history.unshift({
          id: `hist-${Date.now()}-${count}`,
          requestCode: item.requestCode,
          category: item.category,
          employeeName: item.employeeName,
          employeeCode: item.employeeCode,
          avatarUrl: item.avatarUrl,
          decision: payload.decision,
          approverName,
          approverRole: 'Manager & Approver',
          decisionTimestamp: new Date().toISOString(),
          comments: payload.comments || 'Bulk processed via Approvals Hub',
          impactSummary: `Bulk Decision: ${payload.decision.toUpperCase()}`
        });
      }
    }
    return { count };
  }

  static async getHistory(): Promise<ApprovalHistoryLogDTO[]> {
    return this.history;
  }
}
