import { useState } from 'react';
import type { FormEvent } from 'react';
import { authApi } from '../services/authApi';

interface SetCredentialsButtonProps {
  staffId: number;
  staffName?: string | null;
  session: any;
}

export default function SetCredentialsButton({ staffId, staffName, session }: SetCredentialsButtonProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function openModal() {
    setUsername('');
    setPassword('');
    setError(null);
    setDone(false);
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await authApi.setCredentials(staffId, username, password, session?.token);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save credentials.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="text-xs font-semibold text-indigo-700 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50"
      >
        Set login
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center p-10 z-50 overflow-y-auto"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="font-bold text-gray-800">Login for {staffName ?? 'this staff member'}</h2>
            <p className="text-xs text-gray-500 mt-1">They'll use this username and password to sign in.</p>

            {done ? (
              <>
                <div className="mt-4 bg-emerald-50 text-emerald-800 text-sm rounded px-4 py-3">
                  Credentials saved. Share them with {staffName} directly — they aren't stored anywhere
                  else for you to look up later.
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-indigo-900 text-white text-sm font-semibold px-4 py-2 rounded"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
                  <input
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jmwangi"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Temporary password</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {error && <div className="bg-red-50 text-red-700 text-sm rounded px-4 py-3">{error}</div>}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={saving}
                    className="text-sm font-medium text-gray-600 border border-gray-300 rounded px-4 py-2 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="text-sm font-semibold text-white bg-indigo-900 rounded px-4 py-2 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save credentials'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}