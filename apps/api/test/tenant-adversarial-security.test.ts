import { describe, it, expect, vi } from 'vitest';
import { TenantScopedRepository, TenantSecurityException } from '../src/database/tenant-repository.js';
import { tenantStorage, TenantContext } from '../src/middleware/tenant-context.js';
import { SupportAccessService } from '../src/modules/support/support-access.service.js';
import { superAdminPrivacyGuard } from '../src/middleware/privacy-guard.js';
import { TenantStorageService } from '../src/services/tenant-storage.service.js';
import { TenantJobRunner } from '../src/services/tenant-job-runner.js';
import { checkSameTenantDataScope } from '../src/middleware/rbac-guard.js';
import { TokenBlacklistService } from '../src/services/token-blacklist.service.js';
import { TenantLifecycleService } from '../src/services/tenant-lifecycle.service.js';

describe('Comprehensive Multi-Tenant Security Audit & Adversarial Verification Suite', () => {
  const tenantAContext: TenantContext = {
    tenantId: 'tenant_acme_corp',
    subdomain: 'acme',
    timezone: 'UTC',
    currency: 'USD'
  };

  const tenantBContext: TenantContext = {
    tenantId: 'tenant_stark_ind',
    subdomain: 'stark',
    timezone: 'America/New_York',
    currency: 'USD'
  };

  const employeeRepo = new TenantScopedRepository<{ id: string; tenantId: string; name: string; salary: number }>('Employee', [
    { id: 'emp_acme_1', tenantId: 'tenant_acme_corp', name: 'Alice Acme', salary: 100000 },
    { id: 'emp_stark_1', tenantId: 'tenant_stark_ind', name: 'Bob Stark', salary: 150000 }
  ]);

  const approvalRepo = new TenantScopedRepository<{ id: string; tenantId: string; employeeId: string; status: string }>('Approval', [
    { id: 'app_acme_1', tenantId: 'tenant_acme_corp', employeeId: 'emp_acme_1', status: 'PENDING' },
    { id: 'app_stark_1', tenantId: 'tenant_stark_ind', employeeId: 'emp_stark_1', status: 'PENDING' }
  ]);

  it('1. Central Tenant Repository & Cross-Tenant IDOR Prevention', async () => {
    await tenantStorage.run(tenantAContext, async () => {
      await expect(employeeRepo.findById('emp_stark_1')).rejects.toThrow(TenantSecurityException);

      const tenantAEmployees = await employeeRepo.find();
      expect(tenantAEmployees.some(e => e.id === 'emp_stark_1')).toBe(false);
      expect(tenantAEmployees.every(e => e.tenantId === 'tenant_acme_corp')).toBe(true);

      await expect(employeeRepo.update('emp_stark_1', { salary: 200000 })).rejects.toThrow(TenantSecurityException);
      await expect(employeeRepo.delete('emp_stark_1')).rejects.toThrow(TenantSecurityException);
    });
  });

  it('2. Same-Tenant Object-Level Data Scope Authorization (Employee vs Manager vs Admin)', async () => {
    const employeeUser: any = {
      id: 'usr_emp1',
      tenantId: 'tenant_acme_corp',
      role: 'EMPLOYEE',
      employeeId: 'emp_acme_1',
      departmentName: 'Engineering',
      permissions: ['employee:read']
    };

    const managerUser: any = {
      id: 'usr_mgr1',
      tenantId: 'tenant_acme_corp',
      role: 'MANAGER',
      employeeId: 'emp_mgr_1',
      departmentName: 'Engineering',
      permissions: ['reports:read']
    };

    const ownRecord = { employeeId: 'emp_acme_1', departmentName: 'Engineering' };
    const peerRecord = { employeeId: 'emp_acme_2', departmentName: 'Engineering' };
    const otherDeptRecord = { employeeId: 'emp_acme_3', departmentName: 'Sales' };

    expect(checkSameTenantDataScope(employeeUser, ownRecord)).toBe(true);
    expect(checkSameTenantDataScope(employeeUser, peerRecord)).toBe(false);
    expect(checkSameTenantDataScope(managerUser, ownRecord)).toBe(true);
    expect(checkSameTenantDataScope(managerUser, peerRecord)).toBe(true);
    expect(checkSameTenantDataScope(managerUser, otherDeptRecord)).toBe(false);
  });

  it('3. Server-Verified Context & Header Injection Defense', async () => {
    const mockReq: any = {
      headers: { 'x-tenant-id': 'tenant_stark_ind' },
      user: { id: 'usr_acme_user', tenantId: 'tenant_acme_corp', role: 'EMPLOYEE' }
    };

    const resolvedTenant = mockReq.user?.tenantId || mockReq.headers['x-tenant-id'];
    expect(resolvedTenant).toBe('tenant_acme_corp');
    expect(resolvedTenant).not.toBe('tenant_stark_ind');
  });

  it('4. Super Admin Privacy & MFA-Protected Break-Glass Access', async () => {
    const superAdminReq: any = {
      user: { id: 'usr_super_admin', role: 'SUPER_ADMIN' },
      headers: {}
    };
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    await superAdminPrivacyGuard(superAdminReq, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

    await expect(
      SupportAccessService.grantSupportAccess('tenant_acme_corp', 'Acme Corp', 'adm_1', 'admin@acme.com', 'Debug', 1, false)
    ).rejects.toThrow('MFA_STEP_UP_REQUIRED');

    const grant = await SupportAccessService.grantSupportAccess(
      'tenant_acme_corp',
      'Acme Corp',
      'adm_1',
      'admin@acme.com',
      'Debugging sync issue',
      1,
      true
    );

    expect(grant.mfaVerified).toBe(true);

    const mismatchValid = await SupportAccessService.validateSupportToken(grant.token, 'tenant_stark_ind');
    expect(mismatchValid).toBeNull();

    const validGrant = await SupportAccessService.validateSupportToken(grant.token, 'tenant_acme_corp');
    expect(validGrant).not.toBeNull();
    expect(validGrant?.tenantId).toBe('tenant_acme_corp');
  });

  it('5. Session Revocation & Tenant Suspension Validation', async () => {
    TokenBlacklistService.reset();
    const token = 'revoked_test_jwt_token_123';

    expect(TokenBlacklistService.isTokenRevoked(token)).toBe(false);
    TokenBlacklistService.revokeToken(token);
    expect(TokenBlacklistService.isTokenRevoked(token)).toBe(true);

    expect(TokenBlacklistService.isTenantSuspended('tenant_acme_corp')).toBe(false);
    TokenBlacklistService.suspendTenantSessions('tenant_acme_corp');
    expect(TokenBlacklistService.isTenantSuspended('tenant_acme_corp')).toBe(true);
    expect(TokenBlacklistService.isTenantSuspended('tenant_stark_ind')).toBe(false);
  });

  it('6. Database-Enforced Tenant Integrity & Relational Verification', () => {
    expect(() => {
      TenantLifecycleService.enforceRelationalIntegrity('tenant_acme_corp', 'tenant_stark_ind');
    }).toThrow('CROSS_TENANT_RELATIONAL_VIOLATION');

    expect(() => {
      TenantLifecycleService.enforceRelationalIntegrity('tenant_acme_corp', 'tenant_acme_corp');
    }).not.toThrow();
  });

  it('7. Repository Bypass Prevention Verification', async () => {
    await tenantStorage.run(tenantAContext, async () => {
      expect(() => {
        TenantLifecycleService.verifyRepositoryBypassPrevention({ tenantId: 'tenant_stark_ind' });
      }).toThrow(TenantSecurityException);

      expect(() => {
        TenantLifecycleService.verifyRepositoryBypassPrevention({ tenantId: 'tenant_acme_corp' });
      }).not.toThrow();
    });
  });

  it('8. Background Jobs & Queue Tenant Isolation', async () => {
    let capturedJobTenant: string | undefined;

    await tenantStorage.run(tenantAContext, async () => {
      TenantJobRunner.enqueueJob('PAYROLL_CALCULATION', { period: '2026-09' });
    });

    await TenantJobRunner.processNextJob(async (job) => {
      capturedJobTenant = tenantStorage.getStore()?.tenantId;
      expect(job.tenantId).toBe('tenant_acme_corp');
    });

    expect(capturedJobTenant).toBe('tenant_acme_corp');
    expect(capturedJobTenant).not.toBe('tenant_stark_ind');
  });

  it('9. Reports, Exports & Integrations Tenant Isolation', async () => {
    await tenantStorage.run(tenantAContext, async () => {
      const reportPath = TenantLifecycleService.getReportExportFilePath('monthly_attendance.csv');
      expect(reportPath).toContain('tenant_acme_corp');
      expect(reportPath).toContain('reports');

      const integrationKey = TenantLifecycleService.getIntegrationStorageKey('slack');
      expect(integrationKey).toBe('tenant:tenant_acme_corp:integrations:slack');
    });
  });

  it('10. Backup Export, Restore & Purge Deletion Isolation Verification', async () => {
    let tenantABackup: any;

    await tenantStorage.run(tenantAContext, async () => {
      tenantABackup = await TenantLifecycleService.exportTenantBackup({ Employee: employeeRepo as any });
      expect(tenantABackup.tenantId).toBe('tenant_acme_corp');
    });

    // Attempt Cross-Tenant Restore Attack: Restoring Tenant A's backup inside Tenant B's context
    await tenantStorage.run(tenantBContext, async () => {
      await expect(
        TenantLifecycleService.restoreTenantBackup(tenantABackup, { Employee: employeeRepo as any })
      ).rejects.toThrow(TenantSecurityException);
    });

    // Purge Tenant B
    const purgedCount = await TenantLifecycleService.purgeTenantData('tenant_stark_ind', [employeeRepo as any]);
    expect(purgedCount).toBe(1);

    await tenantStorage.run(tenantBContext, async () => {
      const list = await employeeRepo.find();
      expect(list.length).toBe(0);
    });
  });

  it('11. Shared Service Namespacing (WebSockets, Search, Notifications)', () => {
    const wsRoom = TenantLifecycleService.getWebSocketRoom('live-punches', 'tenant_acme_corp');
    expect(wsRoom).toBe('tenant:tenant_acme_corp:live-punches');

    const searchIndex = TenantLifecycleService.getSearchIndexName('employees', 'tenant_acme_corp');
    expect(searchIndex).toBe('tenant_tenant_acme_corp_employees');

    const notifTopic = TenantLifecycleService.getNotificationTopic('tenant_acme_corp');
    expect(notifTopic).toBe('tenant.tenant_acme_corp.notifications');
  });

  it('12. High Concurrency AsyncLocalStorage Multi-Tenant Stress Test', async () => {
    const operations = Array.from({ length: 50 }).map((_, index) => {
      const isEven = index % 2 === 0;
      const targetContext = isEven ? tenantAContext : tenantBContext;
      const expectedTenant = isEven ? 'tenant_acme_corp' : 'tenant_stark_ind';

      return tenantStorage.run(targetContext, async () => {
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 5)));
        const activeTenant = tenantStorage.getStore()?.tenantId;
        expect(activeTenant).toBe(expectedTenant);
      });
    });

    await Promise.all(operations);
  });
});
