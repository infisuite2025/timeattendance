import { describe, it, expect, vi } from 'vitest';
import { superAdminPrivacyGuard } from '../src/middleware/privacy-guard.js';
import { tenantMiddleware, getTenantContext } from '../src/middleware/tenant-context.js';
import { ReportsService } from '../src/modules/reports/reports.service.js';
import { organizationService } from '../src/modules/organization/organization.service.js';

describe('Security & Multi-Tenant Hardening Verification Suite', () => {
  it('1. Should block Super Admin from accessing tenant operational endpoints with HTTP 403 Privacy Boundary Guard', () => {
    const req: any = {
      user: {
        id: 'usr_superadmin_00',
        tenantId: 'system_platform',
        role: 'SUPER_ADMIN',
        permissions: ['*']
      },
      headers: {}
    };

    let responseStatus = 0;
    let jsonBody: any = null;

    const res: any = {
      status: (code: number) => {
        responseStatus = code;
        return {
          json: (body: any) => {
            jsonBody = body;
          }
        };
      }
    };

    const next = vi.fn();

    superAdminPrivacyGuard(req, res, next);

    expect(responseStatus).toBe(403);
    expect(jsonBody.success).toBe(false);
    expect(jsonBody.error.code).toBe('ERR_SUPER_ADMIN_PRIVACY_BOUNDARY');
    expect(next).not.toHaveBeenCalled();
  });

  it('2. Should pass Super Admin Privacy Guard for non-SuperAdmin roles', () => {
    const req: any = {
      user: {
        id: 'usr_admin_001',
        tenantId: 'tenant-001',
        role: 'ADMIN',
        permissions: ['*']
      }
    };

    const res: any = {};
    const next = vi.fn();

    superAdminPrivacyGuard(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('3. Should cryptographically derive tenantId from authenticated user session and ignore unverified header injection', () => {
    const req: any = {
      user: {
        id: 'usr_admin_001',
        tenantId: 'tenant-001',
        role: 'ADMIN'
      },
      headers: {
        'x-tenant-id': 'tenant-hacked-target-99',
        host: 'acme.infitimepro.com'
      }
    };

    const res: any = {};
    let activeContext: any = null;

    tenantMiddleware(req, res, () => {
      activeContext = getTenantContext();
    });

    expect(activeContext).not.toBeNull();
    expect(activeContext.tenantId).toBe('tenant-001');
    expect(activeContext.tenantId).not.toBe('tenant-hacked-target-99');
  });

  it('4. Should prevent cross-tenant IDOR deletion of report schedules belonging to another tenant', async () => {
    // sch-001 belongs to tenant-demo-001 / tenant-001
    const isDeleted = await ReportsService.deleteSchedule('sch-001', 'unauthorized-tenant-999');
    expect(isDeleted).toBe(false);
  });

  it('5. Should verify Authentication & Password Security Policies update in OrganizationService', () => {
    const updated = organizationService.updateSettings({
      mfaEnforced: true,
      passwordRotationDays: 60,
      sessionTimeoutMinutes: 15
    });

    expect(updated.mfaEnforced).toBe(true);
    expect(updated.passwordRotationDays).toBe(60);
    expect(updated.sessionTimeoutMinutes).toBe(15);

    const fetched = organizationService.getSettings();
    expect(fetched.mfaEnforced).toBe(true);
    expect(fetched.passwordRotationDays).toBe(60);
    expect(fetched.sessionTimeoutMinutes).toBe(15);
  });
});

