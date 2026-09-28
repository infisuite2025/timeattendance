import path from 'path';
import { getTenantContext } from '../middleware/tenant-context.js';

export class TenantStorageService {
  /**
   * Enforces server-side tenant file path partitioning.
   * Path format: /storage/tenants/{tenantId}/{category}/{sanitizedFilename}
   */
  static getTenantFilePath(category: string, filename: string, explicitTenantId?: string): string {
    const tenantId = explicitTenantId || getTenantContext().tenantId;

    // Prevent directory traversal attacks
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9_-]/g, '');
    const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');

    return path.join('/storage', 'tenants', tenantId, sanitizedCategory, sanitizedFilename);
  }

  /**
   * Enforces tenant-isolated cache key namespacing.
   * Format: tenant:{tenantId}:{key}
   */
  static getTenantCacheKey(key: string, explicitTenantId?: string): string {
    const tenantId = explicitTenantId || getTenantContext().tenantId;
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_:.-]/g, '');
    return `tenant:${tenantId}:${sanitizedKey}`;
  }
}
