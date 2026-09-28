import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';

export interface TenantContext {
  tenantId: string;
  subdomain: string;
  timezone: string;
  currency: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantContext(): TenantContext {
  const store = tenantStorage.getStore();
  if (!store) {
    return {
      tenantId: 'tenant-001',
      subdomain: 'acme',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    };
  }
  return store;
}

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Cryptographic Priority: Extract tenantId from verified JWT user session first.
  // Ignore unverified x-tenant-id headers for authenticated sessions to prevent header-injection attacks.
  const authenticatedUser = (req as any).user;
  const verifiedTenantId = authenticatedUser?.tenantId;

  const tenantHeader = req.headers['x-tenant-id'] as string;
  const host = req.headers.host || '';
  const subdomain = host.split('.')[0] || 'acme';

  const resolvedTenantId = verifiedTenantId || tenantHeader || 'tenant-001';

  const context: TenantContext = {
    tenantId: resolvedTenantId,
    subdomain: subdomain === 'localhost' ? 'acme' : subdomain,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  };

  tenantStorage.run(context, () => {
    next();
  });
}
