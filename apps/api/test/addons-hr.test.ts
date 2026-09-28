import { describe, it, expect } from 'vitest';
import { AddonsService } from '../src/modules/addons/addons.service.js';
import { HRService } from '../src/modules/hr/hr.service.js';

describe('Addons & Modular Licensing Engine', () => {
  it('should return catalog of available add-ons with pricing and feature lists', async () => {
    const catalog = await AddonsService.getCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(4);
    
    const hrAddon = catalog.find(c => c.id === 'hr_suite');
    expect(hrAddon).toBeDefined();
    expect(hrAddon?.pricePerSeatMonthly).toBe(2.50);
    expect(hrAddon?.pricePerSeatAnnual).toBe(24.00);
    expect(hrAddon?.features.length).toBeGreaterThan(3);
  });

  it('should check active add-on status for default tenant', async () => {
    const isActive = await AddonsService.isAddonActive('tenant-001', 'hr_suite');
    expect(isActive).toBe(true);

    const isTmActive = await AddonsService.isAddonActive('tenant-001', 'time_and_materials');
    expect(isTmActive).toBe(false);
  });

  it('should allow tenant to subscribe with trial or annual billing', async () => {
    const subscription = await AddonsService.subscribe('tenant-test-999', {
      addonId: 'time_and_materials',
      billingCycle: 'annual',
      seats: 50,
      startAsTrial: true
    });

    expect(subscription.status).toBe('trial');
    expect(subscription.billingCycle).toBe('annual');
    expect(subscription.subscribedSeats).toBe(50);
    expect(subscription.trialEndsAt).toBeDefined();

    const activeCheck = await AddonsService.isAddonActive('tenant-test-999', 'time_and_materials');
    expect(activeCheck).toBe(true);
  });
});

describe('Core HR & Employee Lifecycle Engine', () => {
  it('should fetch HR dashboard summary metrics', async () => {
    const summary = await HRService.getDashboardSummary();
    expect(summary.totalActiveEmployees).toBe(1248);
    expect(summary.activeOnboardings).toBeGreaterThan(0);
    expect(summary.totalAssetsManaged).toBeGreaterThan(0);
    expect(summary.openHelpdeskTickets).toBeGreaterThanOrEqual(0);
  });

  it('should progress candidate onboarding checklist tasks and update stage', async () => {
    const candidates = await HRService.getCandidates();
    const candidate = candidates[0];
    const initialProgress = candidate.progressPercent;

    // Toggle uncompleted task
    const targetTask = candidate.tasks.find(t => !t.completed);
    if (targetTask) {
      const updated = await HRService.toggleCandidateTask(candidate.id, targetTask.id);
      expect(updated.tasks.find(t => t.id === targetTask.id)?.completed).toBe(true);
      expect(updated.progressPercent).toBeGreaterThan(initialProgress);
    }
  });

  it('should filter documents by category and search term', async () => {
    const idDocs = await HRService.getDocuments('identity');
    expect(idDocs.every(d => d.category === 'identity')).toBe(true);

    const searchDocs = await HRService.getDocuments(undefined, 'Sarah');
    expect(searchDocs.length).toBeGreaterThan(0);
    expect(searchDocs[0].employeeName).toContain('Sarah');
  });

  it('should allocate asset to employee and record return with condition', async () => {
    // Find available asset
    const availableAssets = await HRService.getAssets(undefined, 'available');
    expect(availableAssets.length).toBeGreaterThan(0);

    const target = availableAssets[0];
    const allocated = await HRService.allocateAsset(target.id, 'EMP-1002', 'David Miller', 'EMP-1002');
    expect(allocated.status).toBe('allocated');
    expect(allocated.allocatedToEmployeeId).toBe('EMP-1002');

    const returned = await HRService.returnAsset(target.id, 'good');
    expect(returned.status).toBe('available');
    expect(returned.allocatedToEmployeeId).toBeUndefined();
    expect(returned.condition).toBe('good');
  });

  it('should create and resolve HR helpdesk tickets', async () => {
    const newTicket = await HRService.createTicket({
      employeeId: 'EMP-1001',
      employeeName: 'Sarah Jenkins',
      employeeCode: 'EMP-1001',
      category: 'letter_request',
      subject: 'Bonafide Certificate',
      description: 'Need for passport renewal',
      priority: 'high',
      requestedLetterType: 'bonafide'
    });

    expect(newTicket.ticketNumber).toMatch(/^TKT-HR-/);
    expect(newTicket.status).toBe('open');

    const resolved = await HRService.resolveTicket(newTicket.id, 'Letter issued and uploaded to document vault.');
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolutionNotes).toContain('Letter issued');
  });
});
