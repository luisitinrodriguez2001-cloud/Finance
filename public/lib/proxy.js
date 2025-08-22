// Access the PROXY constant from the global scope instead of importing so the
// script can run without ES module support in the browser.
function proxiedFetch(targetUrl, init) {
  if (typeof targetUrl !== "string" || !/^https?:\/\//i.test(targetUrl)) {
    throw new Error("proxiedFetch expects an absolute URL");
  }
  const url = window.PROXY + encodeURIComponent(targetUrl);
  return fetch(url, init);
}

// Attach to window for global consumption.
window.proxiedFetch = proxiedFetch;
