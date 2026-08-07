/**
 * Robust, type-safe API fetch helper for Sidra Swap Watch
 * Safely handles non-JSON responses (HTML error pages / SPA fallbacks)
 */
export async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let errorMsg = `Server returned HTTP ${res.status}`;
    if (contentType.includes('application/json')) {
      try {
        const errObj = await res.json();
        if (errObj && errObj.error) {
          errorMsg = errObj.error;
        }
      } catch {
        // Fallback to status message
      }
    }
    throw new Error(errorMsg);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response from ${url}, but received ${contentType || 'text/html'}`);
  }

  return res.json() as Promise<T>;
}
