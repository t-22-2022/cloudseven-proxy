export async function onRequest(context) {

  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  if (!path) {
    return new Response("CloudSeven Proxy Ready", { status: 200 });
  }

  const target = "https://" + path;

  const CUSTOM_UA = "Ott Tv/1.7.3.1 (Linux;Android 12; en; 923k1l)";

  function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const ranges = [
    { base: "60.53", isp: "TM Unifi" },
    { base: "115.164", isp: "Maxis Broadband" },
    { base: "175.144", isp: "Celcom Malaysia" },
    { base: "42.1", isp: "Digi Telecommunications" },
    { base: "118.101", isp: "U Mobile" }
  ];

  const pick = ranges[Math.floor(Math.random() * ranges.length)];

  const fakeIP = `${pick.base}.${random(1,255)}.${random(1,255)}`;
  const fakeISP = pick.isp;

  console.log("🟢 REQUEST RECEIVED");
  console.log("🌍 IP:", fakeIP);
  console.log("📡 ISP:", fakeISP);
  console.log("📱 UA:", CUSTOM_UA);
  console.log("🔗 Target:", target);

  const headers = new Headers();

  headers.set("User-Agent", CUSTOM_UA);
  headers.set("Referer", target);
  headers.set("Origin", target);

  // Spoof IP headers
  headers.set("X-Forwarded-For", fakeIP);
  headers.set("X-Real-IP", fakeIP);
  headers.set("Client-IP", fakeIP);
  headers.set("True-Client-IP", fakeIP);

  // Cloudflare style spoof
  headers.set("CF-Connecting-IP", fakeIP);
  headers.set("CF-IPCountry", "MY");

  // =========================
  // FETCH TARGET
  // =========================

  const response = await fetch(target, {
    method: request.method,
    headers: headers
  });

  const contentType = response.headers.get("content-type") || "";

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
