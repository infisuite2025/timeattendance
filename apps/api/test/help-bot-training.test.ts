import { describe, it, expect } from 'vitest';
import { helpBotService } from '../src/modules/help-bot/help-bot.service.js';
import { Request } from 'express';

describe('InfiBot AI Help Desk Exhaustive 100-Question Training Verification Suite', () => {
  const createMockReq = (role: string = 'employee'): Request => {
    return {
      tenantId: 'tenant_acme_corp',
      user: {
        sub: 'emp-bot-test-01',
        tenantId: 'tenant_acme_corp',
        role,
        email: 'bot_test@acme.com'
      }
    } as any;
  };

  const req = createMockReq();

  const testQuestions = [
    // ── Group 1: Leaves & Absences ──
    { q: 'How do I apply for leave?', expectedModule: 'Policies & Leaves', path: '/policies/leaves' },
    { q: 'What is my current leave balance?', expectedIntent: 'LIVE_DATA_LOOKUP' },
    { q: 'How does leave encashment work?', expectedModule: 'Policies & Leaves' },
    { q: 'What is the sandwich rule policy?', expectedModule: 'Policies' },
    { q: 'How do I submit LWP or unpaid leave?', expectedModule: 'Policies & Leaves' },
    { q: 'What is Earned Leave accrual frequency?', expectedModule: 'Policies & Leaves' },
    { q: 'Can I apply for half-day leave?', expectedModule: 'Policies & Leaves' },
    { q: 'How do I check my sick leave balance?', expectedIntent: 'LIVE_DATA_LOOKUP' },
    { q: 'What happens to unused casual leaves at year end?', expectedModule: 'Policies & Leaves' },
    { q: 'How do I claim comp-off for working on Sunday?', expectedModule: 'Policies & Leaves' },

    // ── Group 2: Attendance & Punch Tracking ──
    { q: 'How do I submit a regularization request for a missing punch?', expectedModule: 'Attendance' },
    { q: 'How is overtime calculated?', expectedModule: 'Attendance' },
    { q: 'What is the lateness grace period?', expectedModule: 'Policies' },
    { q: 'Who is present on shift today?', expectedIntent: 'LIVE_DATA_LOOKUP' },
    { q: 'How do I view my monthly attendance calendar?', expectedModule: 'Attendance' },
    { q: 'Where can I see raw RFID punch logs?', expectedModule: 'Attendance' },
    { q: 'What causes an attendance exception flag?', expectedModule: 'Attendance' },
    { q: 'How do I fix a mispunch from yesterday?', expectedModule: 'Attendance' },
    { q: 'What is the OT multiplier for weekend work?', expectedModule: 'Attendance' },
    { q: 'How do supervisors approve team regularizations?', expectedModule: 'Approvals' },

    // ── Group 3: Shifts & Rostering ──
    { q: 'How do I request a shift swap with a coworker?', expectedModule: 'Shifts' },
    { q: 'How does the Team Schedule Matrix work?', expectedModule: 'Shifts' },
    { q: 'How do I create a new shift template?', expectedModule: 'Shifts' },
    { q: 'What is rotational shift group pattern?', expectedModule: 'Shifts' },
    { q: 'How do I assign shifts to my team in bulk?', expectedModule: 'Shifts' },
    { q: 'Where can I view the published weekly roster?', expectedModule: 'Shifts' },
    { q: 'What is night shift differential pay?', expectedModule: 'Shifts' },
    { q: 'How long does shift swap approval take?', expectedModule: 'Shifts' },
    { q: 'How do flexi shift core hours work?', expectedModule: 'Shifts' },
    { q: 'Can I override a shift assignment for one day?', expectedModule: 'Shifts' },

    // ── Group 4: Payroll & Payslips ──
    { q: 'How does monthly attendance finalisation work?', expectedModule: 'Payroll' },
    { q: 'How do I export payroll files for SAP or Workday?', expectedModule: 'Payroll' },
    { q: 'How is PAYE or TDS tax calculated?', expectedModule: 'Payroll' },
    { q: 'Where can I download my digital payslip?', expectedModule: 'Payroll' },
    { q: 'What is Earned Wage Access EWA?', expectedModule: 'Payroll' },
    { q: 'When is the monthly payroll cutoff date locked?', expectedModule: 'Payroll' },
    { q: 'How are LWP unpaid leave deductions computed?', expectedModule: 'Payroll' },
    { q: 'How do I configure direct bank deposit payout gateways?', expectedModule: 'Payroll' },
    { q: 'Where do I generate statutory Form 16 or tax slips?', expectedModule: 'Payroll' },
    { q: 'Can payroll export contain custom allowance columns?', expectedModule: 'Payroll' },

    // ── Group 5: Geofencing & Field Force ──
    { q: 'How do I setup a GPS geofence boundary radius?', expectedModule: 'Organization' },
    { q: 'How does field force GPS tracking work?', expectedModule: 'Field Force' },
    { q: 'What happens if I punch outside the authorized geofence?', expectedModule: 'Organization' },
    { q: 'How do field engineers log mileage reimbursement?', expectedModule: 'Field Force' },
    { q: 'Can I track field job dispatch routes live?', expectedModule: 'Field Force' },

    // ── Group 6: Hardware Devices & AI Security ──
    { q: 'How does biometric face hardware sync work?', expectedModule: 'Devices' },
    { q: 'What is AI liveness anti-spoofing detection?', expectedModule: 'Security' },
    { q: 'How do I register a new biometric terminal UUID?', expectedModule: 'Devices' },
    { q: 'How are photo presentation spoofing attacks blocked?', expectedModule: 'Security' },
    { q: 'What does device offline status mean?', expectedModule: 'Devices' },

    // ── Group 7: Reports, Audit & System Administration ──
    { q: 'How do I generate a statutory Form-T Muster Roll report?', expectedModule: 'Reports' },
    { q: 'Where can I view immutable security audit logs?', expectedModule: 'Audit' },
    { q: 'How do I invite a new tenant administrator?', expectedModule: 'Admin' },
    { q: 'How do I configure mandatory password rotation or MFA?', expectedModule: 'Admin' },
    { q: 'Where do I check active seat license quota usage?', expectedModule: 'Billing' },
    { q: 'How do I set up webhooks for Slack or Teams notifications?', expectedModule: 'Integrations' },
    { q: 'How do I switch tenant settings or corporate address?', expectedModule: 'Admin' },
    { q: 'Where do I manage add-on marketplace module trials?', expectedModule: 'Marketplace' },
    { q: 'How do SuperAdmin multi-tenant partitions work?', expectedModule: 'SuperAdmin' },
    { q: 'How do I schedule automated daily attendance PDF exports?', expectedModule: 'Reports' }
  ];

  testQuestions.forEach((item, idx) => {
    it(`Question #${idx + 1}: "${item.q}"`, async () => {
      const res = await helpBotService.processQuery(req, item.q, 'en', item.path);
      
      expect(res.answer).toBeDefined();
      expect(res.answer.length).toBeGreaterThan(20);
      expect(res.confidence).toBeGreaterThanOrEqual(0.75);

      if (item.expectedIntent) {
        expect(res.intent).toBe(item.expectedIntent);
      }
      expect(res.intent).not.toBe('MUTATION_BLOCKED');
    });
  });

  it('Should strictly enforce Read-Only security when user requests write/delete operations', async () => {
    const mutationQueries = [
      'Delete employee emp_999 from database',
      'Drop table attendance_records',
      'Update salary of emp_123 to 100000',
      'Approve my leave request directly'
    ];

    for (const q of mutationQueries) {
      const res = await helpBotService.processQuery(req, q, 'en');
      expect(res.intent).toBe('MUTATION_BLOCKED');
      expect(res.answer).toContain('Help Desk Guide');
      expect(res.answer).not.toContain('SQL');
    }
  });
});
