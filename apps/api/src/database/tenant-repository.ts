import { getTenantContext, TenantContext } from '../middleware/tenant-context.js';

export class TenantSecurityException extends Error {
  public readonly code: string;
  public readonly tenantId: string;

  constructor(message: string, tenantId: string) {
    super(message);
    this.name = 'TenantSecurityException';
    this.code = 'ERR_TENANT_VIOLATION_ATTEMPT';
    this.tenantId = tenantId;
  }
}

export interface TenantScopedEntity {
  id: string;
  tenantId: string;
  [key: string]: any;
}

/**
 * Centralized Server-Enforced Tenant Isolation Repository
 * Enforces automatic tenant query scoping and ownership checks on all data access operations.
 * Developers cannot bypass tenant filtering because tenant context is resolved automatically from AsyncLocalStorage.
 */
export class TenantScopedRepository<T extends TenantScopedEntity> {
  private items: T[] = [];
  private entityName: string;

  constructor(entityName: string, initialData: T[] = []) {
    this.entityName = entityName;
    this.items = [...initialData];
  }

  /**
   * Automatically resolve current immutable tenant context.
   */
  private getCurrentTenant(): TenantContext {
    return getTenantContext();
  }

  /**
   * Server-Enforced Query Scoping: Find all entities for the active tenant.
   */
  async find(filterFn?: (item: T) => boolean): Promise<T[]> {
    const currentTenant = this.getCurrentTenant();
    const tenantItems = this.items.filter((item) => item.tenantId === currentTenant.tenantId);
    if (!filterFn) return [...tenantItems];
    return tenantItems.filter(filterFn);
  }

  /**
   * Server-Enforced Object Ownership Check: Find single entity by ID.
   * Throws TenantSecurityException if object belongs to a different tenant.
   */
  async findById(id: string): Promise<T | null> {
    const currentTenant = this.getCurrentTenant();
    const item = this.items.find((i) => i.id === id);

    if (!item) return null;

    if (item.tenantId !== currentTenant.tenantId) {
      console.error(
        `🚨 TENANT SECURITY VIOLATION: Attempted access to ${this.entityName}:${id} (owned by ${item.tenantId}) from active context ${currentTenant.tenantId}`
      );
      throw new TenantSecurityException(
        `Access denied. Resource ${id} does not belong to tenant ${currentTenant.tenantId}`,
        currentTenant.tenantId
      );
    }

    return { ...item };
  }

  /**
   * Server-Enforced Mutation: Create entity bound automatically to active tenant.
   */
  async create(data: Omit<T, 'id' | 'tenantId'> & { id?: string }): Promise<T> {
    const currentTenant = this.getCurrentTenant();
    const newEntity = {
      ...data,
      id: data.id || `${this.entityName.toLowerCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: currentTenant.tenantId,
      createdAt: new Date().toISOString()
    } as unknown as T;

    this.items.unshift(newEntity);
    return { ...newEntity };
  }

  /**
   * Server-Enforced Mutation: Update entity with tenant ownership verification.
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`${this.entityName} ${id} not found`);
    }

    const currentTenant = this.getCurrentTenant();
    const idx = this.items.findIndex((i) => i.id === id && i.tenantId === currentTenant.tenantId);

    const updated = {
      ...this.items[idx],
      ...updates,
      id: existing.id,
      tenantId: currentTenant.tenantId, // Immutable tenant ownership
      updatedAt: new Date().toISOString()
    };

    this.items[idx] = updated;
    return { ...updated };
  }

  /**
   * Server-Enforced Mutation: Delete entity with tenant ownership verification.
   */
  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    const currentTenant = this.getCurrentTenant();
    const idx = this.items.findIndex((i) => i.id === id && i.tenantId === currentTenant.tenantId);

    if (idx === -1) return false;

    this.items.splice(idx, 1);
    return true;
  }
}
