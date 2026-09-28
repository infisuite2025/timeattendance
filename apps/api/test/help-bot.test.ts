import { describe, it, expect } from 'vitest';
import { helpBotService } from '../src/modules/help-bot/help-bot.service.js';
import { KNOWLEDGE_BASE } from '../src/modules/help-bot/knowledge-base.js';
import { Request } from 'express';

describe('InfiTimePro Exhaustive AI Help Desk Assistant Test Suite', () => {
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

  it('1. Knowledge base should contain 43 comprehensive articles covering all 43 pages', () => {
    expect(KNOWLEDGE_BASE.length).toBe(43);
    const uniqueIds = new Set(KNOWLEDGE_BASE.map(a => a.id));
    expect(uniqueIds.size).toBe(43);
  });

  it('2. Should return page-contextual suggestion chips based on active route path', () => {
    const shiftSuggestions = helpBotService.getContextualSuggestions('/shifts/swaps');
    expect(shiftSuggestions[0].query).toContain('shift swap');

    const payrollSuggestions = helpBotService.getContextualSuggestions('/payroll-disbursement');
    expect(payrollSuggestions[0].query).toContain('attendance finalisation');

    const geofenceSuggestions = helpBotService.getContextualSuggestions('/geofencing');
    expect(geofenceSuggestions[0].query).toContain('geofence');
  });

  it('3. Should answer attendance exception queries accurately with navigation path', async () => {
    const req = createMockReq();
    const res = await helpBotService.processQuery(req, 'How do I resolve a missing punch exception?', 'en', '/attendance/exceptions');

    expect(res.intent).toBe('FEATURE_HOWTO');
    expect(res.answer).toContain('Attendance Exceptions');
    expect(res.suggestedActions.some(a => a.path === '/attendance/exceptions')).toBe(true);
  });

  it('4. Should answer T&M project billability questions with deep-links', async () => {
    const req = createMockReq('manager');
    const res = await helpBotService.processQuery(req, 'How do project billable timesheets work?', 'en', '/tm');

    expect(res.intent).toBe('FEATURE_HOWTO');
    expect(res.answer).toContain('Time & Materials');
    expect(res.suggestedActions.some(a => a.path === '/tm')).toBe(true);
  });

  it('5. Should answer Global Payroll tax calculation questions', async () => {
    const req = createMockReq('admin');
    const res = await helpBotService.processQuery(req, 'How does global payroll calculate PAYE and TDS tax?', 'en', '/global-payroll');

    expect(res.intent).toBe('FEATURE_HOWTO');
    expect(res.answer).toContain('Global Payroll');
    expect(res.suggestedActions.some(a => a.path === '/global-payroll')).toBe(true);
  });

  it('6. Should fulfill live data queries (leave balances) via Read-Only API Client', async () => {
    const req = createMockReq();
    const res = await helpBotService.processQuery(req, 'What is my leave balance?');

    expect(res.intent).toBe('LIVE_DATA_LOOKUP');
    expect(res.answer).toContain('leave balance');
    expect(res.readOnlySourcesUsed).toContain('ReadOnlyAPIClient');
  });

  it('7. Should strictly block data mutation or write requests (Zero Write Access)', async () => {
    const req = createMockReq();
    const res = await helpBotService.processQuery(req, 'Can you delete employee emp-123 from the database?');

    expect(res.intent).toBe('MUTATION_BLOCKED');
    expect(res.answer).toContain('Help Desk Guide');
    expect(res.readOnlySourcesUsed).toContain('SecurityPolicy:ReadOnlyGuard');
  });
});
