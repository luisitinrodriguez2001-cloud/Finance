// Access the PROXY constant from the global scope instead of importing so the
// script can run without ES module support in the browser.
function proxiedFetch(targetUrl, init) {
  if (typeof targetUrl !== "string" || !/^https?:\/\//i.test(targetUrl)) {
    throw new Error("proxiedFetch expects an absolute URL");
  }
  if (typeof window.PROXY === "string" && window.PROXY.length > 0) {
    const url = window.PROXY + encodeURIComponent(targetUrl);
    return fetch(url, init);
  }
  const warn = "window.PROXY is not defined; using direct fetch";
  if (typeof fetch === "function") {
    console.warn(warn);
    return fetch(targetUrl, init);
  }
  const errMsg = "window.PROXY is not defined and fetch is unavailable";
  console.error(errMsg);
  throw new Error(errMsg);
}

// Attach to window for global consumption.
window.proxiedFetch = proxiedFetch;
