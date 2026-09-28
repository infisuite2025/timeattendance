import { describe, it, expect } from 'vitest';
import { FieldForceService } from '../src/modules/field-force/field-force.service.js';

describe('Field Force Management Module', () => {

  it('should return dashboard summary with correct field status counts', async () => {
    const summary = await FieldForceService.getDashboardSummary('tenant-001');
    expect(summary.totalFieldEngineers).toBeGreaterThanOrEqual(6);
    expect(summary.engineersOnSite).toBeGreaterThanOrEqual(2);
    expect(summary.engineersAvailable).toBeGreaterThanOrEqual(2);
    expect(summary.totalJobSites).toBeGreaterThanOrEqual(6);
    expect(summary.activeJobSites).toBeGreaterThanOrEqual(5);
    expect(summary.jobsInProgress).toBeGreaterThanOrEqual(3);
    expect(summary.avgCompletionRate).toBeGreaterThan(85);
    expect(summary.avgCustomerRating).toBeGreaterThan(4.0);
    expect(summary.fleetAssigned).toBeGreaterThanOrEqual(3);
    expect(summary.fleetInMaintenance).toBeGreaterThanOrEqual(1);
  });

  it('should list job sites and filter by status', async () => {
    const all = await FieldForceService.getJobSites('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(6);

    const active = await FieldForceService.getJobSites('tenant-001', 'active');
    expect(active.length).toBeGreaterThanOrEqual(5);
    active.forEach(s => {
      expect(s.status).toBe('active');
      expect(s.geofenceRadiusMeters).toBeGreaterThan(0);
      expect(s.latitude).toBeDefined();
      expect(s.longitude).toBeDefined();
    });
  });

  it('should list field engineers with live GPS status', async () => {
    const all = await FieldForceService.getFieldEngineers('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(6);

    const onSite = await FieldForceService.getFieldEngineers('tenant-001', 'on_site');
    expect(onSite.length).toBeGreaterThanOrEqual(2);
    onSite.forEach(e => {
      expect(e.currentStatus).toBe('on_site');
      expect(e.currentJobId).toBeDefined();
      expect(e.currentLatitude).toBeDefined();
      expect(e.currentLongitude).toBeDefined();
    });
  });

  it('should dispatch an engineer to a scheduled job', async () => {
    const scheduled = await FieldForceService.getJobOrders('tenant-001', 'scheduled');
    expect(scheduled.length).toBeGreaterThanOrEqual(2);
    const available = await FieldForceService.getFieldEngineers('tenant-001', 'available');
    expect(available.length).toBeGreaterThanOrEqual(1);

    const job = await FieldForceService.dispatchEngineer(scheduled[0].id, available[0].employeeId, available[0].employeeName);
    expect(job.status).toBe('dispatched');
    expect(job.assignedEngineerId).toBe(available[0].employeeId);
    expect(job.dispatchedAt).toBeDefined();

    // Engineer status should now be dispatched
    const updatedEng = await FieldForceService.getFieldEngineers('tenant-001', 'dispatched');
    const found = updatedEng.find(e => e.employeeId === available[0].employeeId);
    expect(found).toBeDefined();
    expect(found?.currentJobId).toBe(scheduled[0].id);
  });

  it('should complete a job and update engineer availability', async () => {
    const inProgress = await FieldForceService.getJobOrders('tenant-001', 'on_site');
    expect(inProgress.length).toBeGreaterThanOrEqual(1);
    const job = inProgress[0];

    const completed = await FieldForceService.completeJob(
      job.id,
      'All tasks completed. Client satisfied.',
      5,
      ['Spare Part A x2', 'Cable 10m']
    );
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeDefined();
    expect(completed.customerRating).toBe(5);
    expect(completed.partsUsed).toContain('Spare Part A x2');
  });

  it('should detect outside-geofence check-ins', async () => {
    const all = await FieldForceService.getSiteCheckIns('tenant-001');
    expect(all.length).toBeGreaterThanOrEqual(5);

    const verified = all.filter(c => c.verificationStatus === 'verified');
    expect(verified.length).toBeGreaterThanOrEqual(4);
    verified.forEach(c => expect(c.isWithinGeofence).toBe(true));

    const outside = all.filter(c => c.verificationStatus === 'outside_geofence');
    expect(outside.length).toBeGreaterThanOrEqual(1);
    outside.forEach(c => {
      expect(c.isWithinGeofence).toBe(false);
      expect(c.distanceFromSiteMeters).toBeGreaterThan(200);
    });
  });

  it('should manage mileage claims — approve and reject', async () => {
    const pending = await FieldForceService.getMileageClaims('tenant-001', 'submitted');
    expect(pending.length).toBeGreaterThanOrEqual(2);

    const approved = await FieldForceService.approveMileageClaim(pending[0].id, 'Vikram Singh');
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('Vikram Singh');
    expect(approved.approvedAt).toBeDefined();

    const rejected = await FieldForceService.rejectMileageClaim(pending[1].id, 'Vikram Singh', 'Distance exceeds expected route by 50%');
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toContain('Distance exceeds');
  });

  it('should enforce tenant isolation — tenant-999 sees no field force data', async () => {
    const summary = await FieldForceService.getDashboardSummary('tenant-999');
    expect(summary.totalFieldEngineers).toBe(0);
    expect(summary.totalJobSites).toBe(0);
    expect(summary.jobsInProgress).toBe(0);

    const jobs = await FieldForceService.getJobOrders('tenant-999');
    expect(jobs.length).toBe(0);

    const claims = await FieldForceService.getMileageClaims('tenant-999');
    expect(claims.length).toBe(0);
  });

});
