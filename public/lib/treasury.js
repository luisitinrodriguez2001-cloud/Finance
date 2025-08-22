const TREASURY_BASE = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service';

// Expose Treasury query helper globally for non-module usage.
function treasuryQuery(datasetPath, params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) search.set(k, v);
  }
  const qs = search.toString();
  const url = `${TREASURY_BASE}/${datasetPath}${qs ? `?${qs}` : ''}`;
  return window.proxiedFetch(url);
}
window.treasuryQuery = treasuryQuery;
