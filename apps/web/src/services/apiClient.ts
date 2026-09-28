/**
 * InfiTimePro API Client
 * Connects frontend modules to the backend gateway at http://localhost:4000/api/v1
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
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const token = localStorage.getItem('infi_timepro_auth_token') || 'demo-jwt-token-active';
    const tenantId = localStorage.getItem('infi_timepro_tenant_id') || 'tenant-demo-001';

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-tenant-id': tenantId,
      'Authorization': `Bearer ${token}`,
      ...customHeaders,
    };
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      if (params) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
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
        method: 'GET',
        headers: this.getHeaders(),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.error?.message || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
        return {
          success: false,
          error: { code: json?.error?.code || String(response.status), message: errMsg, details: json?.error?.details },
        };
      }

      return json || { success: true };
    } catch (error: any) {
      console.warn(`[ApiClient.get] Failed for ${endpoint}:`, error.message);
      return {
        success: false,
        error: { message: error.message || 'Network connection failed' },
      };
    }
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.error?.message || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
        return {
          success: false,
          error: { code: json?.error?.code || String(response.status), message: errMsg, details: json?.error?.details },
        };
      }

      return json || { success: true };
    } catch (error: any) {
      console.warn(`[ApiClient.post] Failed for ${endpoint}:`, error.message);
      return {
        success: false,
        error: { message: error.message || 'Network connection failed' },
      };
    }
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.error?.message || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
        return {
          success: false,
          error: { code: json?.error?.code || String(response.status), message: errMsg, details: json?.error?.details },
        };
      }

      return json || { success: true };
    } catch (error: any) {
      console.warn(`[ApiClient.put] Failed for ${endpoint}:`, error.message);
      return {
        success: false,
        error: { message: error.message || 'Network connection failed' },
      };
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.error?.message || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
        return {
          success: false,
          error: { code: json?.error?.code || String(response.status), message: errMsg, details: json?.error?.details },
        };
      }

      return json || { success: true };
    } catch (error: any) {
      console.warn(`[ApiClient.delete] Failed for ${endpoint}:`, error.message);
      return {
        success: false,
        error: { message: error.message || 'Network connection failed' },
      };
    }
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errMsg = json?.error?.message || json?.message || `Request failed with status ${response.status} (${response.statusText})`;
        return {
          success: false,
          error: { code: json?.error?.code || String(response.status), message: errMsg, details: json?.error?.details },
        };
      }

      return json || { success: true };
    } catch (error: any) {
      console.warn(`[ApiClient.patch] Failed for ${endpoint}:`, error.message);
      return {
        success: false,
        error: { message: error.message || 'Network connection failed' },
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
