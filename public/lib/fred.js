import { proxiedFetch } from './proxy.js';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

export function fredSeriesObservations({ series_id, api_key, params = {} }) {
  const search = new URLSearchParams({ series_id, api_key, file_type: 'json' });
  for (const [k, v] of Object.entries(params)) {
    if (v != null) search.set(k, v);
  }
  const url = `${FRED_BASE}?${search.toString()}`;
  return proxiedFetch(url);
}

