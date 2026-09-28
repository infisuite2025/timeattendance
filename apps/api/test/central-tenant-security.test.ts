import { describe, it, expect, vi } from 'vitest';
import { TenantScopedRepository, TenantSecurityException } from '../src/database/tenant-repository.js';
import { tenantStorage, TenantContext } from '../src/middleware/tenant-context.js';
import { SupportAccessService } from '../src/modules/support/support-access.service.js';
import { superAdminPrivacyGuard } from '../src/middleware/privacy-guard.js';
import { TenantStorageService } from '../src/services/tenant-storage.service.js';
import { TenantJobRunner } from '../src/services/tenant-job-runner.js';

describe('Centralized Server-Enforced Multi-Tenant Security Architecture', () => {
  const tenant1Context: TenantContext = {
    tenantId: 'tenant_alpha_corp',
    subdomain: 'alpha',
    timezone: 'Asia/Kolkata',
    currency: 'INR'
  };

  const tenant2Context: TenantContext = {
    tenantId: 'tenant_beta_inc',
    subdomain: 'beta',
    timezone: 'America/New_York',
    currency: 'USD'
  };

  const repository = new TenantScopedRepository<{ id: string; tenantId: string; name: string }>('Policy', [
    { id: 'pol-001', tenantId: 'tenant_alpha_corp', name: 'Alpha Overtime Policy' },
    { id: 'pol-002', tenantId: 'tenant_beta_inc', name: 'Beta Shift Policy' }
  ]);

  it('1. Should automatically inject tenant scoping on repository queries via AsyncLocalStorage', async () => {
    await tenantStorage.run(tenant1Context, async () => {
      const items = await repository.find();
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Alpha Overtime Policy');
      expect(items[0].tenantId).toBe('tenant_alpha_corp');
    });

    await tenantStorage.run(tenant2Context, async () => {
      const items = await repository.find();
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Beta Shift Policy');
      expect(items[0].tenantId).toBe('tenant_beta_inc');
    });
  });

  it('2. Should throw TenantSecurityException when trying to fetch an object owned by a different tenant (IDOR prevention)', async () => {
    await tenantStorage.run(tenant1Context, async () => {
      // pol-002 belongs to tenant_beta_inc
      await expect(repository.findById('pol-002')).rejects.toThrow(TenantSecurityException);
    });
  });

  it('3. Should automatically bind new entity creation to the current tenant context', async () => {
    await tenantStorage.run(tenant1Context, async () => {
      const created = await repository.create({ name: 'Alpha Leave Policy' });
      expect(created.tenantId).toBe('tenant_alpha_corp');
    });
  });

  it('4. Should support time-limited, audited Break-Glass Support Tokens for Super Admin', async () => {
    // Tenant Admin grants support access
    const grant = await SupportAccessService.grantSupportAccess(
      'tenant_alpha_corp',
      'Alpha Corp',
      'adm-001',
      'admin@alpha.com',
      'Investigate biometric sync issue'
    );

    expect(grant.token).toBeDefined();

    // Super Admin presents token in request
    const req: any = {
      user: { id: 'usr_superadmin_00', role: 'SUPER_ADMIN' },
      headers: { 'x-support-grant-token': grant.token }
    };

    const res: any = {};
    const next = vi.fn();

    await superAdminPrivacyGuard(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.supportGrant.grantId).toBe(grant.grantId);
  });

  it('5. Should reject expired or invalid Break-Glass Support Tokens with HTTP 403', async () => {
    const req: any = {
      user: { id: 'usr_superadmin_00', role: 'SUPER_ADMIN' },
      headers: { 'x-support-grant-token': 'invalid-fake-token-123' }
    };

    let responseCode = 0;
    const res: any = {
      status: (code: number) => {
        responseCode = code;
        return { json: vi.fn() };
      }
    };
    const next = vi.fn();

    await superAdminPrivacyGuard(req, res, next);

    expect(responseCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('6. Should partition file paths and cache keys by tenant ID automatically', () => {
    const filePath = TenantStorageService.getTenantFilePath('reports', 'muster_roll_sep.xlsx', 'tenant_alpha_corp');
    expect(filePath).toContain('tenant_alpha_corp');
    expect(filePath).toContain('muster_roll_sep.xlsx');

    const cacheKey = TenantStorageService.getTenantCacheKey('active_employees', 'tenant_alpha_corp');
    expect(cacheKey).toBe('tenant:tenant_alpha_corp:active_employees');
  });

  it('7. Should bind background jobs strictly inside tenant context using TenantJobRunner', async () => {
    let capturedTenantId = '';

    await TenantJobRunner.runInTenantContext(tenant2Context, async () => {
      const items = await repository.find();
      capturedTenantId = items[0].tenantId;
      return items;
    });

    expect(capturedTenantId).toBe('tenant_beta_inc');
  });
});
