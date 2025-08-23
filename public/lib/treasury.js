const TREASURY_BASE = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service';

// Expose Treasury query helper globally for non-module usage.
function treasuryQuery(datasetPath, params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) search.set(k, v);
  }
  const qs = search.toString();
  const url = `${TREASURY_BASE}/${datasetPath}${qs ? `?${qs}` : ''}`;
  if (typeof window.proxiedFetch === 'function') {
    return window.proxiedFetch(url);
  }
  const msg = 'proxiedFetch is not available';
  console.error(msg);
  if (typeof alert === 'function') alert(msg);
  throw new Error(msg);
}
window.treasuryQuery = treasuryQuery;
