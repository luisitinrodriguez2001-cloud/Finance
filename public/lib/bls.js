const BLS_BASE = 'https://api.bls.gov/publicAPI/v2/timeseries/data';

// Expose BLS helper functions globally so they can be used without modules.
function blsFetchSingle(seriesId, { startyear, endyear, ...rest } = {}) {
  const params = new URLSearchParams();
  if (startyear) params.set('startyear', startyear);
  if (endyear) params.set('endyear', endyear);
  for (const [k, v] of Object.entries(rest)) {
    if (v != null) params.set(k, v);
  }
  const qs = params.toString();
  const url = `${BLS_BASE}/${encodeURIComponent(seriesId)}${qs ? `?${qs}` : ''}`;
  return window.proxiedFetch(url);
}

function blsFetchMany(seriesIds, { startyear, endyear, key } = {}) {
  const body = { seriesid: seriesIds };
  if (startyear) body.startyear = startyear;
  if (endyear) body.endyear = endyear;
  if (key) body.registrationkey = key;
  return window.proxiedFetch(BLS_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

window.blsFetchSingle = blsFetchSingle;
window.blsFetchMany = blsFetchMany;
