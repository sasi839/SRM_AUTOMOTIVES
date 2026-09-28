import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  fallback,
}) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-[#D7E2EA]">
        <span className="text-sm font-medium uppercase tracking-widest animate-pulse">
          Authenticating Admin Session...
        </span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#121212] border border-red-500/20 rounded-xl text-center">
        <h3 className="text-xl font-bold uppercase tracking-wide text-red-500 mb-2">
          Access Denied
        </h3>
        <p className="text-sm text-[#D7E2EA]/70 max-w-md">
          You must be logged in as an authorized SRM AUTOMOTIVES administrator to access protected management tools.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
