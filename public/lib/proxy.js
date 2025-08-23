(function () {
  /**
   * Fetches a resource through a proxy defined by `window.PROXY`.
   * @param {string} url - The URL to fetch.
   * @param {RequestInit} [options] - Additional fetch options.
   * @returns {Promise<Response>} Resolves with the response object.
   */
  async function proxiedFetch(url, options) {
    if (!window || !window.PROXY) {
      throw new Error('PROXY not configured');
    }
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      throw new Error('URL must include protocol');
    }
    if (url.includes('..')) {
      throw new Error('URL must not contain ".."');
    }
    try {
      return await fetch(window.PROXY + encodeURIComponent(url), options);
    } catch (err) {
      throw err;
    }
  }

  window.proxiedFetch = proxiedFetch;
})();
