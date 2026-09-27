/**
 * Date and Time utility functions for client and server.
 * Pure functions with no node built-in dependencies (fs, path).
 */

/**
 * Normalizes any date string (ISO YYYY-MM-DD or human-formatted like 'September 15, 2026')
 * into HTML5 date input format (YYYY-MM-DD) without timezone shifts.
 */
export function toDateInputValue(dateStr?: string | null): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0];
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
}

/**
 * Formats a date string (YYYY-MM-DD or human readable) into 'Month Day, Year' (e.g. 'September 15, 2026')
 */
export function formatActivityDate(dateStr?: string | null): string {
  if (!dateStr) return 'TBD';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime()) && trimmed.includes('-')) {
    return parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return trimmed;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
