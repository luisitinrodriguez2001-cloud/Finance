import { proxiedFetch } from './proxy.js';

const BLS_BASE = 'https://api.bls.gov/publicAPI/v2/timeseries/data';

export function blsFetchSingle(seriesId, { startyear, endyear, ...rest } = {}) {
  const params = new URLSearchParams();
  if (startyear) params.set('startyear', startyear);
  if (endyear) params.set('endyear', endyear);
  for (const [k, v] of Object.entries(rest)) {
    if (v != null) params.set(k, v);
  }
  const qs = params.toString();
  const url = `${BLS_BASE}/${encodeURIComponent(seriesId)}${qs ? `?${qs}` : ''}`;
  return proxiedFetch(url);
}

export function blsFetchMany(seriesIds, { startyear, endyear, key } = {}) {
  const body = { seriesid: seriesIds };
  if (startyear) body.startyear = startyear;
  if (endyear) body.endyear = endyear;
  if (key) body.registrationkey = key;
  return proxiedFetch(BLS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

