export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "",
        },
      });
    }

    const resp = await fetch(url, request);
    const modified = new Response(resp.body, resp);
    modified.headers.set("Access-Control-Allow-Origin", origin);
    modified.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    modified.headers.set("Access-Control-Allow-Headers", "*");
    return modified;
  },
};
