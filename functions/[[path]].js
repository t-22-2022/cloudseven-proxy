export async function onRequest(context) {

  const request = context.request;
  const url = new URL(request.url);

  const path = url.pathname.slice(1);

  if (!path) {
    return new Response("CloudSeven Proxy Ready", {
      status: 200
    });
  }

  const target = "https://" + path;

  const headers = new Headers();

  headers.set("User-Agent", request.headers.get("User-Agent") || "Mozilla/5.0");
  headers.set("Referer", target);
  headers.set("Origin", target);

  const response = await fetch(target, {
    method: request.method,
    headers: headers
  });

  const newHeaders = new Headers(response.headers);

  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Headers", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders
  });
}
