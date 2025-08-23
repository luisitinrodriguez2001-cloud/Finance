(function () {
  const BASE = 'https://api.worldbank.org/v2/country/US/indicator/';

  /**
   * Fetch economic series data from the World Bank API.
   * @param {Object} opts
   * @param {string} opts.seriesId - World Bank indicator code.
   * @param {number} opts.start - Start year.
   * @param {number} opts.end - End year.
   * @returns {Promise<Array>} Resolves with an array of data points.
   */
  async function econFetch({ seriesId, start, end }) {
    if (!seriesId) {
      throw new Error('econFetch: "seriesId" is required');
    }
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new Error('econFetch: "start" and "end" must be numbers');
    }

    const params = new URLSearchParams({
      format: 'json',
      per_page: '5000',
      date: `${start}:${end}`
    });

    const url = `${BASE}${encodeURIComponent(seriesId)}?${params.toString()}`;

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

    let json;
    try {
      json = await resp.json();
    } catch (err) {
      throw new Error('econFetch: Failed to parse JSON');
    }

    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
      throw new Error('econFetch: Unexpected World Bank response');
    }

    return json[1];
  }

  window.econFetch = econFetch;
})();
