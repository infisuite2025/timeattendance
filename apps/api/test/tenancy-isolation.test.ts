import { describe, it, expect } from 'vitest';
import { tenantStorage, getTenantContext, TenantContext } from '../src/middleware/tenant-context.js';

describe('InfiTimePro Multi-Tenant Isolation & Async Context', () => {
  it('should return fallback default context when outside an active tenant async boundary', () => {
    const context = getTenantContext();
    expect(context.tenantId).toBe('tenant-001');
    expect(context.subdomain).toBe('acme');
  });

  it('should isolate distinct tenant contexts across asynchronous storage execution blocks', async () => {
    const tenant1Context: TenantContext = {
      tenantId: 'tenant_asia_corp',
      subdomain: 'asiacorp',
      timezone: 'Asia/Singapore',
      currency: 'SGD'
    };

    const tenant2Context: TenantContext = {
      tenantId: 'tenant_euro_logistics',
      subdomain: 'eurologistics',
      timezone: 'Europe/London',
      currency: 'GBP'
    };

    await Promise.all([
      tenantStorage.run(tenant1Context, async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
        const ctx1 = getTenantContext();
        expect(ctx1.tenantId).toBe('tenant_asia_corp');
        expect(ctx1.currency).toBe('SGD');
        expect(ctx1.timezone).toBe('Asia/Singapore');
      }),
      tenantStorage.run(tenant2Context, async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        const ctx2 = getTenantContext();
        expect(ctx2.tenantId).toBe('tenant_euro_logistics');
        expect(ctx2.currency).toBe('GBP');
        expect(ctx2.timezone).toBe('Europe/London');
      })
    ]);
  });
});
