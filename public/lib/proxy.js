import { PROXY } from "../config.js";

export function proxiedFetch(targetUrl, init) {
  if (typeof targetUrl !== "string" || !/^https?:\/\//i.test(targetUrl)) {
    throw new Error("proxiedFetch expects an absolute URL");
  }
  const url = PROXY + encodeURIComponent(targetUrl);
  return fetch(url, init);
}

