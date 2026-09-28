import { describe, it, expect, beforeAll } from 'vitest';
import { TMService } from '../src/modules/tm/tm.service.js';

describe('Time & Materials Module', () => {

  it('should return dashboard summary with correct KPI counts', async () => {
    const summary = await TMService.getDashboardSummary('tenant-001');
    expect(summary.totalActiveClients).toBeGreaterThanOrEqual(3);
    expect(summary.totalActiveProjects).toBeGreaterThanOrEqual(3);
    expect(summary.pendingTimesheetApprovals).toBeGreaterThanOrEqual(0);
    expect(summary.overallUtilizationPercent).toBeGreaterThan(0);
    expect(summary.outstandingInvoiceCount).toBeGreaterThanOrEqual(0);
  });

  it('should list all clients for tenant', async () => {
    const clients = await TMService.getClients('tenant-001');
    expect(clients.length).toBeGreaterThanOrEqual(4);
    const active = clients.filter(c => c.status === 'active');
    expect(active.length).toBeGreaterThanOrEqual(3);
    const currencyCodes = clients.map(c => c.billingCurrency);
    expect(currencyCodes).toContain('USD');
    expect(currencyCodes).toContain('INR');
    expect(currencyCodes).toContain('AED');
  });

  it('should list projects and filter by client', async () => {
    const allProjects = await TMService.getProjects('tenant-001');
    expect(allProjects.length).toBeGreaterThanOrEqual(5);

    const afgProjects = await TMService.getProjects('tenant-001', 'cl-001');
    expect(afgProjects.length).toBeGreaterThanOrEqual(2);
    afgProjects.forEach(p => expect(p.clientId).toBe('cl-001'));

    const activeProjects = allProjects.filter(p => p.status === 'active');
    expect(activeProjects.length).toBeGreaterThanOrEqual(3);
  });

  it('should submit a new timesheet entry and compute billable amount', async () => {
    const initialTimesheets = await TMService.getTimesheets('tenant-001', 'EMP-1001');
    const entry = await TMService.submitTimesheet('tenant-001', {
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      projectId: 'proj-001',
      projectName: 'Core Banking Modernisation - Phase 2',
      taskId: 'task-003',
      taskName: 'COBOL to Java Migration - Module 1',
      date: '2025-09-13',
      hoursLogged: 7,
      isBillable: true,
      rateCardId: 'rc-002',
      description: 'Sprint 12 - AccountLedger migration unit tests',
    });
    expect(entry.id).toBeDefined();
    expect(entry.status).toBe('draft');
    expect(entry.hourlyRate).toBe(145);
    expect(entry.billedAmount).toBe(7 * 145); // 1015 USD
    expect(entry.billedAmount).toBe(1015);

    const updatedTimesheets = await TMService.getTimesheets('tenant-001', 'EMP-1001');
    expect(updatedTimesheets.length).toBe(initialTimesheets.length + 1);
  });

  it('should approve a pending timesheet and record approver', async () => {
    const pending = await TMService.getTimesheets('tenant-001', undefined, undefined, 'pending');
    expect(pending.length).toBeGreaterThanOrEqual(1);

    const targetId = pending[0].id;
    const approved = await TMService.approveTimesheet(targetId, 'David Park');
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('David Park');
    expect(approved.approvedAt).toBeDefined();
  });

  it('should retrieve rate cards and validate billing types', async () => {
    const rateCards = await TMService.getRateCards('tenant-001');
    expect(rateCards.length).toBeGreaterThanOrEqual(5);
    const usdCards = rateCards.filter(r => r.currency === 'USD');
    expect(usdCards.length).toBeGreaterThanOrEqual(3);
    usdCards.forEach(r => {
      expect(r.hourlyRate).toBeGreaterThan(0);
      expect(r.overtimeMultiplier).toBeGreaterThanOrEqual(1);
    });
  });

  it('should list invoices and filter by status', async () => {
    const allInvoices = await TMService.getInvoices('tenant-001');
    expect(allInvoices.length).toBeGreaterThanOrEqual(5);

    const paidInvoices = await TMService.getInvoices('tenant-001', undefined, 'paid');
    expect(paidInvoices.length).toBeGreaterThanOrEqual(3);
    paidInvoices.forEach(i => expect(i.status).toBe('paid'));

    const sentInvoices = await TMService.getInvoices('tenant-001', undefined, 'sent');
    expect(sentInvoices.length).toBeGreaterThanOrEqual(1);
  });

  it('should enforce tenant isolation — different tenant sees no data', async () => {
    const clients = await TMService.getClients('tenant-999');
    expect(clients.length).toBe(0);
    const projects = await TMService.getProjects('tenant-999');
    expect(projects.length).toBe(0);
    const timesheets = await TMService.getTimesheets('tenant-999');
    expect(timesheets.length).toBe(0);
  });

});
