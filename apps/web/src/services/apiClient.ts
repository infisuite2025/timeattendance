/**
 * InfiTimePro API Client
 * Connects frontend modules to the backend gateway at http://localhost:4000/api/v1
 * Features resilient token expiry recovery, silent refresh, and IDOR/tenant isolation headers.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message: string;
    details?: any;
    expiredAt?: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string {
    if (typeof localStorage === 'undefined') return 'demo-jwt-token-active';
    const stored = localStorage.getItem('infi_timepro_auth_token');
    if (!stored || stored === 'undefined' || stored === 'null' || stored.trim() === '') {
      return 'demo-jwt-token-active';
    }
    return stored;
  }

  private getRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem('infi_timepro_refresh_token');
    return stored && stored !== 'undefined' && stored !== 'null' ? stored : null;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    const tenantId = (typeof localStorage !== 'undefined' && localStorage.getItem('infi_timepro_tenant_id')) || 'tenant-demo-001';

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-tenant-id': tenantId,
      'Authorization': `Bearer ${token}`,
      ...customHeaders,
    };
  }

  public setAuth(token: string, refreshToken?: string, tenantId?: string): void {
    if (typeof localStorage === 'undefined') return;
    if (token) localStorage.setItem('infi_timepro_auth_token', token);
    if (refreshToken) localStorage.setItem('infi_timepro_refresh_token', refreshToken);
    if (tenantId) localStorage.setItem('infi_timepro_tenant_id', tenantId);
  }

  public clearAuth(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('infi_timepro_auth_token');
    localStorage.removeItem('infi_timepro_refresh_token');
  }

  private async attemptTokenRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleAuthFailure();
      return null;
    }

    // Reuse in-flight refresh request if multiple concurrent requests hit ERR_TOKEN_EXPIRED
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        const json = await response.json().catch(() => null);

        if (response.ok && json?.data?.token) {
          const newToken = json.data.token;
          const newRefreshToken = json.data.refreshToken;
          this.setAuth(newToken, newRefreshToken);
          return newToken;
        } else {
          this.handleAuthFailure();
          return null;
        }
      } catch (err) {
        this.handleAuthFailure();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleAuthFailure(): void {
    this.clearAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('infi:token-expired', {
          detail: { code: 'ERR_TOKEN_EXPIRED', message: 'Session expired. Please log in again.' },
        })
      );
    }
  }

  private async executeFetch<T>(
    endpoint: string,
    options: { method: string; body?: any; params?: Record<string, any> },
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      if (options.params) {
        const query = new URLSearchParams();
        Object.entries(options.params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query.append(key, String(val));
          }
        });
        const queryString = query.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await fetch(url, {
        method: options.method,
        headers: this.getHeaders(),
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorCode = json?.error?.code || String(response.status);

        // Intercept 401 ERR_TOKEN_EXPIRED
        if ((response.status === 401 || errorCode === 'ERR_TOKEN_EXPIRED') && retryCount === 0) {
          const newToken = await this.attemptTokenRefresh();
          if (newToken) {
            // Retry the original request with the fresh token
            return this.executeFetch<T>(endpoint, options, retryCount + 1);
          }
        }

        const errMsg = json?.error?.message || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
        return {
          success: false,
          error: {
            code: errorCode,
            message: errMsg,
            details: json?.error?.details,
            expiredAt: json?.error?.expiredAt,
          },
        };
      }

      return json || { success: true };
    } catch (error: any) {
      console.warn(`[ApiClient.${options.method}] Failed for ${endpoint}:`, error.message);
      return {
        success: false,
        error: { message: error.message || 'Network connection failed' },
      };
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.executeFetch<T>(endpoint, { method: 'GET', params });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.executeFetch<T>(endpoint, { method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.executeFetch<T>(endpoint, { method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.executeFetch<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.executeFetch<T>(endpoint, { method: 'PATCH', body });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
