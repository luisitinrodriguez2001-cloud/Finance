(function () {
  const BASE = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=';

  /**
   * Fetch a stock quote from Yahoo Finance.
   * @param {string} symbol - Stock ticker symbol.
   * @returns {Promise<Object>} Resolves with quote data.
   */
  async function quoteFetch(symbol) {
    if (typeof symbol !== 'string' || !symbol.trim()) {
      throw new Error('quoteFetch: "symbol" is required');
    }
    const url = BASE + encodeURIComponent(symbol.trim().toUpperCase());

    let resp;
    try {
      resp = await window.proxiedFetch(url);
    } catch (err) {
      throw new Error(`quoteFetch: request failed: ${err.message}`);
    }

    if (!resp || !resp.ok) {
      throw new Error(`quoteFetch: HTTP ${resp && resp.status}`);
    }

    const ct = resp.headers.get('Content-Type') || '';
    if (!/application\/json/i.test(ct)) {
      throw new Error('quoteFetch: Expected JSON response');
    }

    let json;
    try {
      json = await resp.json();
    } catch (err) {
      throw new Error('quoteFetch: Failed to parse JSON');
    }

    const result = json && json.quoteResponse && json.quoteResponse.result;
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('quoteFetch: No data for symbol');
    }

    return result[0];
  }

  window.quoteFetch = quoteFetch;
})();
