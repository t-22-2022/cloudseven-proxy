export async function onRequest(context) {

  const url = new URL(context.request.url);
  const path = url.pathname.slice(1);

  if (!path) {
    return new Response("cloudseven Proxy Ready", {
      headers: { "content-type": "text/plain" }
    });
  }

  let target;

  try {
    target = decodeURIComponent(path);
  } catch {
    target = path;
  }

  if (!target.startsWith("http")) {
    target = "https://" + target;
  }

  const response = await fetch(target, {
    method: context.request.method,
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "*/*"
    }
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}
