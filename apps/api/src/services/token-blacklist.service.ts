export class TokenBlacklistService {
  private static revokedTokens: Set<string> = new Set();
  private static revokedTenants: Set<string> = new Set();

  static revokeToken(tokenIdOrHash: string): void {
    this.revokedTokens.add(tokenIdOrHash);
  }

  static isTokenRevoked(tokenIdOrHash: string): boolean {
    return this.revokedTokens.has(tokenIdOrHash);
  }

  static suspendTenantSessions(tenantId: string): void {
    this.revokedTenants.add(tenantId);
  }

  static isTenantSuspended(tenantId: string): boolean {
    return this.revokedTenants.has(tenantId);
  }

  static reset(): void {
    this.revokedTokens.clear();
    this.revokedTenants.clear();
  }
}
