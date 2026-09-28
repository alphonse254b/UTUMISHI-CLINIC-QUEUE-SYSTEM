const STORAGE_KEY = 'utumishi_tab_sessions';

function decodePayload(jwt: string): { exp?: number } | null {
  try {
    const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function tokenExpiry(jwt: string): Date | null {
  const payload = decodePayload(jwt);
  return payload?.exp ? new Date(payload.exp * 1000) : null;
}

export function isExpired(jwt: string): boolean {
  const payload = decodePayload(jwt);
  if (!payload) return true; // unreadable token is unusable
  return payload.exp ? payload.exp * 1000 < Date.now() : false;
}

/** Raw stored token for a tab (may be expired), or undefined if none. */
export function getTabToken(tabKey: string): string | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const token = raw ? JSON.parse(raw)?.[tabKey]?.token : undefined;
    return typeof token === 'string' && token ? token : undefined;
  } catch {
    return undefined;
  }
}