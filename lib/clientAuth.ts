/**
 * Client-side helper to attach admin authorization headers to fetch requests.
 * Uses NextAuth session automatically, or falls back to stored admin key or default dev key.
 */
export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (typeof window !== 'undefined') {
    const storedKey =
      localStorage.getItem('admin_api_key') ||
      (document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/)![1]) : 'mechgirl-admin-2026');

    if (storedKey) {
      headers['Authorization'] = `Bearer ${storedKey}`;
      headers['x-admin-key'] = storedKey;
    }
  }

  return headers;
}

export function setAdminKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_api_key', key);
    document.cookie = `admin_token=${encodeURIComponent(key)}; path=/; max-age=2592000`;
  }
}

export function getStoredAdminKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_api_key') || 'mechgirl-admin-2026';
  }
  return 'mechgirl-admin-2026';
}

export function saveLoggedInUser(user: any, key?: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('admin_user', JSON.stringify(user));
    if (key) {
      setAdminKey(key);
    }
  }
}

export function getLoggedInUser(): any | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('user') || localStorage.getItem('admin_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_api_key');
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
