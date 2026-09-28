import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { Loader2 } from 'lucide-react';

const AdminContent: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-[#D7E2EA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#E5B549] animate-spin" />
          <span className="text-xs uppercase tracking-widest text-[#D7E2EA]/70">
            Checking Admin Session...
          </span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

export const AdminPage: React.FC = () => {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
};

export default AdminPage;
