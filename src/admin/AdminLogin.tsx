import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Loader2 } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#D7E2EA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121212] border border-[#D7E2EA]/20 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#E5B549]/10 border border-[#E5B549]/30 flex items-center justify-center mb-4 text-[#E5B549]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            SRM AUTOMOTIVES
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#D7E2EA]/60 mt-1">
            Admin Portal Sign In
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D7E2EA]/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@srmautomotives.com"
                required
                className="w-full bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#D7E2EA]/30 focus:outline-none focus:border-[#E5B549] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#D7E2EA]/80">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D7E2EA]/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#1A1A1A] border border-[#D7E2EA]/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-[#D7E2EA]/30 focus:outline-none focus:border-[#E5B549] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#E5B549] text-black font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl hover:bg-[#f0c25c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In to Admin Dashboard'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[#D7E2EA]/10 pt-4">
          <a
            href="/"
            className="text-xs text-[#D7E2EA]/50 hover:text-[#E5B549] transition-colors uppercase tracking-wider"
          >
            ← Back to SRM AUTOMOTIVES Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
