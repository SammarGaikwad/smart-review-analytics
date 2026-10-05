import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Authenticating Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RoleRoute: React.FC<{
  requiredRoles: string[];
  children: React.ReactNode;
}> = ({ requiredRoles, children }) => {
  const { roles } = useAuth();

  const hasPermission = requiredRoles.some((reqRole) => roles.includes(reqRole));

  if (!hasPermission) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Access Restricted (HTTP 403 Forbidden)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your account role(s) <span className="font-semibold text-slate-700">[{roles.join(', ') || 'None'}]</span> do not have authorization to view this enterprise module. Required role(s): [{requiredRoles.join(', ')}].
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
