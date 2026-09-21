import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { authApi } from '../services/authApi';

interface LoginPageProps {
  isEmbedded?: boolean;
  isAdmin?: boolean; 
  onOverrideLoginSuccess?: (sessionData: any) => void;
}

export default function LoginPage({ isEmbedded = false, isAdmin = false, onOverrideLoginSuccess }: LoginPageProps) {
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .needsBootstrap()
      .then((data: any) => {
        const needsSetupValue = data && (data.needsBootstrap ?? data.NeedsBootstrap);
        setNeedsSetup(!!needsSetupValue);
      })
      .catch(() => setNeedsSetup(false))
      .finally(() => setCheckingSetup(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result: any = needsSetup
        ? await authApi.bootstrapAdmin({ staffName, username, password })
        : await authApi.login({ username, password });

      // Normalize into one consistent shape regardless of casing the
      // backend used, so App.tsx's tabSessions always sees the same keys.
      const sessionPayload = {
        token: result?.token || result?.Token,
        staffId: result?.staffId || result?.StaffId,
        staffName: result?.staffName || result?.StaffName,
        role: result?.role || result?.Role || (needsSetup ? 'Admin' : ''),
      };

      onOverrideLoginSuccess?.(sessionPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid username or password configuration.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSetup) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading configurations…</div>;
  }

  const subtextDescription = needsSetup
    ? "No admin account exists yet. Set one up now — this form only works once."
    : isAdmin
      ? "Accessing master control configuration. Please authenticate with your primary system account credentials initialized at setup deployment."
      : "Sign in with the username and password your administrator set up for you.";

  const containerClasses = isEmbedded
    ? "w-full bg-white p-6 rounded-b-xl"
    : "min-h-screen flex items-center justify-center bg-gray-50";

  const formClasses = isEmbedded
    ? "w-full space-y-4"
    : "w-[380px] bg-white rounded-lg shadow p-8";

  return (
    <div className={containerClasses}>
      <form onSubmit={handleSubmit} className={formClasses}>
        {!isEmbedded && <h1 className="text-lg font-black text-indigo-950">UTUMISHI CLINIC</h1>}

        <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
          {subtextDescription}
        </p>

        {needsSetup ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Your name</label>
              <input
                required autoFocus value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
              <input
                required value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <input
                type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
              <input
                required autoFocus value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        )}

        {error && <div className="mt-4 bg-red-50 text-red-700 text-xs rounded px-4 py-3 font-medium">{error}</div>}
        <div className="flex justify-between items-center mt-2 text-xs">
          <button type="button" onClick={() => window.location.href = '/reset-password'} className="text-indigo-700 hover:underline">Forgot password?</button>
          <div />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded transition-all"
        >
          {submitting ? 'Working…' : needsSetup ? 'Create admin account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}