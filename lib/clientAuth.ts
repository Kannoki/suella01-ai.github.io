/**
 * Client-side helper to attach admin authorization headers to fetch requests.
 * Uses NextAuth session automatically, or falls back to the stored admin key
 * (which must be obtained via real login — no hardcoded defaults).
 */
export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('admin_api_key');
    // Only attach Authorization headers when we actually have a key from real login
    if (storedKey) {
      headers['Authorization'] = `Bearer ${storedKey}`;
      headers['x-admin-key'] = storedKey;
    }
  }

  return headers;
}

/**
 * Stores an admin API key in localStorage and a hardened cookie.
 * Cookie uses SameSite=Strict + Secure (in production) to mitigate CSRF.
 */
export function setAdminKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_api_key', key);
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `admin_token=${encodeURIComponent(key)}; path=/; max-age=2592000; SameSite=Strict${secureFlag}`;
  }
}

/** Returns the stored admin key, or empty string if not set. */
export function getStoredAdminKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_api_key') || '';
  }
  return '';
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
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_api_key');
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict${secureFlag}`;
  }
}

/**
 * Compresses and downscales an image File on the client side before uploading or storing in Base64.
 * Keeps file size small (~50KB-200KB), avoids HTTP 413 payload limit errors, and keeps apps fast.
 */
export function compressImageFile(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
