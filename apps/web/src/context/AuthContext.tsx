import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient.ts';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CORPORATE_HR' | 'PAYROLL_ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'DATA_PROTECTION_OFFICER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  employeeCode: string;
  avatar: string;
  companyName: string;
}

export const PERSONA_PROFILES: Record<UserRole, AuthUser> = {
  SUPER_ADMIN: {
    id: 'usr-superadmin-00',
    name: 'Platform Owner (SuperAdmin)',
    email: 'superadmin@infitimepro.com',
    role: 'SUPER_ADMIN',
    designation: 'SaaS Platform Owner & Master Billing Admin',
    department: 'Platform Architecture & Licensing',
    employeeCode: 'SUP-001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop',
    companyName: 'InfiTimePro Global Platform'
  },
  ADMIN: {
    id: 'usr-admin-01',
    name: 'Naresh Andukoori',
    email: 'naresh@company.com',
    role: 'ADMIN',
    designation: 'Chief Administrator',
    department: 'People Operations & IT',
    employeeCode: 'ADM-001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop',
    companyName: 'ACME Enterprise Corp'
  },
  CORPORATE_HR: {
    id: 'usr-hr-02',
    name: 'Anita Desai',
    email: 'anita.desai@company.com',
    role: 'CORPORATE_HR',
    designation: 'VP Human Resources',
    department: 'Human Resources',
    employeeCode: 'HR-201',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop',
    companyName: 'ACME Enterprise Corp'
  },
  PAYROLL_ADMIN: {
    id: 'usr-pay-03',
    name: 'Rajesh Kumar',
    email: 'rajesh.payroll@company.com',
    role: 'PAYROLL_ADMIN',
    designation: 'Global Payroll Disbursement Lead',
    department: 'Finance & Payroll',
    employeeCode: 'FIN-301',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
    companyName: 'ACME Enterprise Corp'
  },
  MANAGER: {
    id: 'usr-mgr-02',
    name: 'Vikram Singh',
    email: 'vikram.singh@company.com',
    role: 'MANAGER',
    designation: 'Operations Lead & Supervisor',
    department: 'Production & Rostering',
    employeeCode: 'MGR-104',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop',
    companyName: 'ACME Enterprise Corp'
  },
  EMPLOYEE: {
    id: 'usr-emp-03',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@company.com',
    role: 'EMPLOYEE',
    designation: 'Senior Process Specialist',
    department: 'Operations & Assembly',
    employeeCode: 'EMP-1001',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop',
    companyName: 'ACME Enterprise Corp'
  },
  DATA_PROTECTION_OFFICER: {
    id: 'usr-dpo-04',
    name: 'Rajesh Kumar, CISSP',
    email: 'dpo.privacy@company.com',
    role: 'DATA_PROTECTION_OFFICER',
    designation: 'Chief Data Protection Officer & Privacy Counsel',
    department: 'Legal Compliance & DPDPA Privacy Desk',
    employeeCode: 'DPO-881',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop',
    companyName: 'ACME Enterprise Corp'
  }
};

interface AuthContextType {
  user: AuthUser;
  role: UserRole;
  login: (email: string, password?: string, explicitRole?: UserRole) => UserRole;
  switchPersona: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    const savedRole = localStorage.getItem('infi_timepro_user_role') as UserRole;
    if (savedRole && PERSONA_PROFILES[savedRole]) {
      return PERSONA_PROFILES[savedRole];
    }
    return PERSONA_PROFILES.ADMIN;
  });

  useEffect(() => {
    localStorage.setItem('infi_timepro_user_role', user.role);
  }, [user]);

  useEffect(() => {
    const handleTokenExpired = () => {
      console.warn('[AuthContext] Session token expired. Purging stale auth state.');
      apiClient.clearAuth();
    };

    window.addEventListener('infi:token-expired', handleTokenExpired);
    return () => {
      window.removeEventListener('infi:token-expired', handleTokenExpired);
    };
  }, []);

  const login = (email: string, password?: string, explicitRole?: UserRole): UserRole => {
    let resolvedRole: UserRole = 'ADMIN';

    if (explicitRole) {
      resolvedRole = explicitRole;
    } else if (email.includes('super') || email.includes('owner') || email.includes('master')) {
      resolvedRole = 'SUPER_ADMIN';
    } else if (email.includes('sarah') || email.includes('priya') || email.includes('emp') || email.includes('employee')) {
      resolvedRole = 'EMPLOYEE';
    } else if (email.includes('vikram') || email.includes('mgr') || email.includes('manager') || email.includes('lead')) {
      resolvedRole = 'MANAGER';
    } else {
      resolvedRole = 'ADMIN';
    }

    const newUser = PERSONA_PROFILES[resolvedRole];
    setUser(newUser);
    localStorage.setItem('infi_timepro_user_role', resolvedRole);

    // Reset stale tokens immediately to prevent ERR_TOKEN_EXPIRED loops
    apiClient.clearAuth();

    // Asynchronously authenticate against backend to establish fresh JWT & Refresh tokens
    apiClient
      .post('/auth/login', { email, password: password || 'Admin@123' })
      .then((res) => {
        if (res.success && res.data?.token) {
          apiClient.setAuth(res.data.token, res.data.refreshToken, res.data.user?.tenantId);
        }
      })
      .catch((err) => {
        console.warn('[AuthContext.login] Backend login fallback to demo token:', err);
      });

    return resolvedRole;
  };

  const switchPersona = (role: UserRole) => {
    const newUser = PERSONA_PROFILES[role];
    setUser(newUser);
    localStorage.setItem('infi_timepro_user_role', role);
    // Clear stale session on persona switch
    apiClient.clearAuth();
  };

  const logout = () => {
    apiClient.post('/auth/logout').catch(() => {});
    apiClient.clearAuth();
    localStorage.removeItem('infi_timepro_user_role');
    setUser(PERSONA_PROFILES.ADMIN);
  };

  return (
    <AuthContext.Provider value={{ user, role: user.role, login, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
