export async function onRequest(context) {

  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  if (!path) {
    return new Response("CloudSeven Proxy Ready", { status: 200 });
  }

  const target = "https://" + path;

 
  const realIP = request.headers.get("CF-Connecting-IP") || "Unknown";

  console.log("🟢 REQUEST RECEIVED");
  console.log("🌍 Real IP:", realIP);
  console.log("📱 UA:", request.headers.get("User-Agent"));
  console.log("🔗 Target:", target);

  const headers = new Headers();
  headers.set("User-Agent", request.headers.get("User-Agent") || "Mozilla/5.0");
  headers.set("Referer", target);
  headers.set("Origin", target);

  const response = await fetch(target, {
    method: request.method,
    headers: headers
  });

  const contentType = response.headers.get("content-type") || "";

  // jika playlist M3U
  if (path.endsWith(".m3u") || contentType.includes("mpegurl")) {

    let body = await response.text();

    const proxy = url.origin + "/";

    body = body.replace(
      /(https?:\/\/[^\s]+)/g,
      (match) => proxy + match.replace(/^https?:\/\//, "")
    );

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  const newHeaders = new Headers(response.headers);

  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Headers", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders
  });
}
