/**
 * ResolveX Frontend API Configuration Helper
 * 
 * Resolves full backend API URLs based on VITE_API_BASE_URL build-time configuration.
 */

export function getApiUrl(path: string): string {
  const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

  if (!rawBase) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  // Strip trailing slashes
  const base = rawBase.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Prevent duplicate /api/v1 path segments if base already includes /api/v1
  if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1')) {
    return `${base}${cleanPath.substring(7)}`;
  }

  return `${base}${cleanPath}`;
}
