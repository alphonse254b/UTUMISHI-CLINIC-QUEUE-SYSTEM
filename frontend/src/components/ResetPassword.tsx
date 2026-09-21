import React, { useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

function getQueryParam(name: string) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export default function ResetPassword() {
  const [phase, setPhase] = useState<'request' | 'reset'>('request');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = getQueryParam('token');
    if (t) {
      setToken(t);
      setPhase('reset');
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await authApi.requestPasswordReset({ emailOrUsername });
      setMessage('If an account with that email exists, a reset link has been emailed.');
    } catch (err: any) {
      setError(err?.message || 'Failed to request password reset');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token) return setError('Missing token');
    if (!newPassword || newPassword.length < 6) return setError('Password must be at least 6 characters');
    try {
      await authApi.resetPassword({ token, newPassword });
      setMessage('Password has been reset. You may now sign in.');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md border">
      <h2 className="text-lg font-bold mb-4">Password Reset</h2>
      {message && <div className="mb-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}

      {phase === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Email or Username</label>
            <input className="w-full border p-2 rounded" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Request Reset</button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">New Password</label>
            <input type="password" className="w-full border p-2 rounded" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Reset Password</button>
        </form>
      )}
    </div>
  );
}
