const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

// Expose FRED helper globally for non-module environments.
function fredSeriesObservations({ series_id, api_key, params = {} }) {
  const search = new URLSearchParams({ series_id, api_key, file_type: 'json' });
  for (const [k, v] of Object.entries(params)) {
    if (v != null) search.set(k, v);
  }
  const url = `${FRED_BASE}?${search.toString()}`;
  if (typeof window.proxiedFetch === "function") {
    return window.proxiedFetch(url);
  }
  const msg = "proxiedFetch is not available";
  console.error(msg);
  if (typeof alert === "function") alert(msg);
  throw new Error(msg);
}
window.fredSeriesObservations = fredSeriesObservations;
