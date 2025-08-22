import { proxiedFetch } from './proxy.js';

const TREASURY_BASE = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service';

export function treasuryQuery(datasetPath, params = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) search.set(k, v);
  }
  const qs = search.toString();
  const url = `${TREASURY_BASE}/${datasetPath}${qs ? `?${qs}` : ''}`;
  return proxiedFetch(url);
}

