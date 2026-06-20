// src/redirect-server.ts
//
// HTTP redirect server for the apex. Every request 301s to REDIRECT_TARGET
// with the path and query preserved. Fly terminates TLS on :443 and forwards
// to HTTP_PORT here; the same listener handles plain :80 via Fly's
// force_https handler.

const PORT = Number(process.env.HTTP_PORT ?? 8080);
// Bind to all interfaces, including IPv6. Fly's internal network is v6-only
// (6PN), so binding to 0.0.0.0 means the edge proxy can't reach us.
const BIND = process.env.HTTP_BIND ?? "::";
const TARGET = process.env.REDIRECT_TARGET ?? "https://www.charliegleason.com";

export function startRedirectServer() {
  const server = Bun.serve({
    port: PORT,
    hostname: BIND,
    fetch(req) {
      const url = new URL(req.url);
      const location = `${TARGET}${url.pathname}${url.search}`;
      return new Response(null, {
        status: 301,
        headers: { Location: location },
      });
    },
  });
  console.log(`http redirect listening on ${server.hostname}:${server.port} → ${TARGET}`);
  return server;
}
