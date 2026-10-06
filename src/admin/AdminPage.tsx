import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ErrorState { hasError: boolean; error: Error | null; }

class AdminErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('Admin crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0C0C0C] text-white flex items-center justify-center p-8">
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-8 max-w-2xl w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-lg font-bold text-red-400">Admin Panel Error</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">A runtime error occurred. See details below:</p>
            <pre className="text-xs text-red-300 bg-slate-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap max-h-64">
              {this.state.error?.message}{'\n\n'}{this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <AdminErrorBoundary>
      <AuthProvider>
        <AdminContent />
      </AuthProvider>
    </AdminErrorBoundary>
  );
};

export default AdminPage;

