import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext.tsx';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    // Clean fallback redirect based on role
    if (role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/tenants" replace />;
    }
    if (role === 'EMPLOYEE') {
      return <Navigate to="/attendance/my" replace />;
    }
    if (role === 'MANAGER') {
      return <Navigate to="/attendance/team" replace />;
    }
    if (role === 'DATA_PROTECTION_OFFICER') {
      return <Navigate to="/compliance/dpo-workspace" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
