import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/authApi';
import type { AuthSession, LoginRequest } from '../services/authApi';
import { setAuthToken } from '../services/authToken';
import type { BootstrapAdminRequest } from '../services/authApi';

const STORAGE_KEY = 'utumishi_auth_session';

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthSession>;
  bootstrapAdmin: (data: BootstrapAdminRequest) => Promise<AuthSession>;
  applySessionExternal: (s: AuthSession) => void; // 💡 NEW: Exposes session updating to component levels
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadPersisted(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadPersisted());
  const [loading, setLoading] = useState(true);

  function applySession(s: AuthSession) {
    if (!s || !s.token) return;
    setSession(s);
    setAuthToken(s.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  function applySessionExternal(s: AuthSession) {
    applySession(s);
  }

  function logout() {
    setSession(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('utumishi_tab_sessions'); // Clear tab sessions on logout
  }

  async function login(credentials: LoginRequest) {
    const result = await authApi.login(credentials);
    applySession(result);
    return result; // Return the payload so calling code can capture it
  }

  async function bootstrapAdmin(data: BootstrapAdminRequest) {
    const result = await authApi.bootstrapAdmin(data);
    applySession(result);
    return result;
  }

  useEffect(() => {
    const persisted = loadPersisted();
    if (!persisted) {
      setLoading(false);
      return;
    }

    setAuthToken(persisted.token);
    setSession(persisted);

    authApi
      .me()
      .then((fresh) => {
        if (fresh && fresh.token) {
          applySession(fresh);
        } else {
          applySession({ ...persisted, ...fresh });
        }
      })
      .catch(() => {
        applySession(persisted); // Retain offline session stability fallback
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, login, bootstrapAdmin, applySessionExternal, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>.');
  return ctx;
}
