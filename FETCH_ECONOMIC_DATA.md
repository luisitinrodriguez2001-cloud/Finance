# Adding Economic Data Fetching

This guide explains how to wire new economic data sources into the **Data** tab of the toolkit. It assumes the app is served with the existing Cloudflare Worker proxy defined in [`public/config.js`](public/config.js).

## 1. Use the existing proxy

All network calls must go through the Cloudflare Worker proxy to avoid CORS errors. The proxy URL is exposed on `window.PROXY`:

```js
window.PROXY = "https://autumn-dew-1295.luisitinrodriguez2001.workers.dev/cors/?url=";
```

The helper `proxiedFetch` in `public/lib/proxy.js` already guards against bad URLs and missing proxy configuration. Always call APIs through this helper.

## 2. Create a guarded API helper

1. Add a file under `public/lib/` (for example, `econ.js`).
2. Build the target URL with all required query parameters.
3. Validate inputs aggressively:
   - Check that all required identifiers are present.
   - Reject non-numeric values where numbers are expected.
   - Encode parameters with `URLSearchParams`.
4. Call `window.proxiedFetch(url)` and **immediately check**:
   - The returned object exists and has `ok === true`.
   - The `Content-Type` header includes `application/json`.
5. Wrap JSON parsing in `try/catch` and throw descriptive errors on failure.
6. Attach the helper to `window` so it can be consumed without ES modules.

Example skeleton:

```js
function econFetch(params) {
  if (!params || !params.series) {
    throw new Error('econFetch: "series" parameter is required');
  }
  const url = `${BASE}?${new URLSearchParams(params)}`;
  return window.proxiedFetch(url);
}
window.econFetch = econFetch;
```

## 3. Register the helper in the Data tab

In `public/script.js`:

1. Destructure the helper from `window` at the top and wrap it with `ensureHelper` to create a defensive wrapper.
2. Extend the `DataPanel` state and UI with fields for the new API.
3. Inside `fetchData`, call the safe wrapper. Surround the call with `try/catch`:

```js
try {
  const resp = await safeEconFetch(opts);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json();
  if (!Array.isArray(data) || !data.length) {
    throw new Error('econFetch returned no data');
  }
  setResult(data);
  setStatus('Updated ✅');
} catch (err) {
  console.error('econFetch failed', err);
  setError(err);
  setStatus('Fetch failed. Check inputs or try again.');
}
```

## 4. Troubleshooting and defensive practices

- Log every failure with `console.error` and include the failing URL and options.
- Surface concise messages to the UI via `setStatus` and `setError` so users know what went wrong.
- Validate numeric fields with `Number.isFinite` before using them in calculations.
- Never assume shape of external data: verify keys exist before accessing them.
- Prefer explicit `throw new Error('message')` over silent failures; strict guards make bugs easier to trace.

Following these steps keeps the Data tab robust and debuggable while relying on the Cloudflare proxy for all economic data requests.
