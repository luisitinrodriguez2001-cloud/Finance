(function () {
  const BASE = 'https://api.stlouisfed.org/fred/series/observations';

  /**
   * Fetch economic series data.
   * @param {Object} opts
   * @param {string} opts.seriesId - FRED series identifier.
   * @param {string} opts.frequency - Data frequency (e.g. 'm').
   * @param {number} opts.start - Start date as number.
   * @param {number} opts.end - End date as number.
   * @returns {Promise<Object>} Resolves with parsed JSON data.
   */
  async function econFetch({ seriesId, frequency, start, end }) {
    if (!seriesId) {
      throw new Error('econFetch: "seriesId" is required');
    }
    if (!frequency) {
      throw new Error('econFetch: "frequency" is required');
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new Error('econFetch: "start" and "end" must be numbers');
    }

    const params = new URLSearchParams({
      series_id: seriesId,
      frequency: frequency,
      observation_start: String(start),
      observation_end: String(end),
      file_type: 'json',
    });

    const url = `${BASE}?${params.toString()}`;

    let resp;
    try {
      resp = await window.proxiedFetch(url);
    } catch (err) {
      throw new Error(`econFetch: request failed: ${err.message}`);
    }

    if (!resp || !resp.ok) {
      throw new Error(`econFetch: HTTP ${resp && resp.status}`);
    }

    const ct = resp.headers.get('Content-Type') || '';
    if (!/application\/json/i.test(ct)) {
      throw new Error('econFetch: Expected JSON response');
    }

    try {
      return await resp.json();
    } catch (err) {
      throw new Error('econFetch: Failed to parse JSON');
    }
  }

  window.econFetch = econFetch;
})();
