// src/ssh-server.tsx
//
// SSH front door for the OpenTUI app.
// Each session gets a CliRenderer wired straight to the SSH channel; the
// React tree is mounted onto it via @opentui/react's createRoot.

import { createServer, logging, type Middleware } from "@opentui/ssh";
import { createRoot } from "@opentui/react";
import { App } from "./index";
import { startContentSync } from "./data/store";
import { startLiveSync } from "./data/live";
import { addSession } from "./data/sessions";
import { startRedirectServer } from "./redirect-server";

const HOST_KEY_PATH = process.env.SSH_HOST_KEY_PATH ?? "./host_key";
const PORT = Number(process.env.SSH_PORT ?? 2222);
const BIND = process.env.SSH_BIND ?? "0.0.0.0";

// Soft limits. Now that there's no child process per session, we can comfortably
// hold more concurrent connections than the old PTY-spawn model allowed.
const MAX_CONCURRENT = Number(process.env.SSH_MAX_CONCURRENT ?? 100);
const MAX_PER_CONNECTION = Number(process.env.SSH_MAX_PER_CONNECTION ?? 1);
const IDLE_TIMEOUT_MS = Number(process.env.SSH_IDLE_TIMEOUT_MS ?? 5 * 60_000);
const SESSION_MAX_MS = Number(process.env.SSH_SESSION_MAX_MS ?? 30 * 60_000);

// Per-IP connection rate limit: N sessions per WINDOW.
const RATE_LIMIT_MAX = Number(process.env.SSH_RATE_LIMIT_MAX ?? 10);
const RATE_LIMIT_WINDOW_MS = Number(process.env.SSH_RATE_LIMIT_WINDOW_MS ?? 60_000);

const attempts = new Map<string, { count: number; resetAt: number }>();

// Sweep expired entries so a publicly exposed endpoint that gets scanned
// constantly doesn't accumulate unique IPs forever. .unref() so the timer
// doesn't keep the process alive on shutdown.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (entry.resetAt < now) attempts.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

const rateLimit: Middleware = (session, next) => {
  const ip = session.remoteAddress.address;
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX) {
      console.log(`[ratelimit] ${ip}`);
      session.deny("rate limited");
    }
  }
  return next();
};

const server = createServer({
  hostKey: { path: HOST_KEY_PATH },
  auth: "open", // public kiosk
  idleTimeout: IDLE_TIMEOUT_MS,
  maxTimeout: SESSION_MAX_MS,
  limits: {
    session: {
      perConnection: MAX_PER_CONNECTION,
      global: MAX_CONCURRENT,
    },
  },
  onError: (err) => {
    console.error("[error]", err);
  },
})
  .use(logging())
  .use(rateLimit)
  .serve((session) => {
    const removeSession = addSession();
    const root = createRoot(session.renderer);
    root.render(<App onExit={() => session.end()} />);
    session.onClose(() => {
      removeSession();
      root.unmount();
    });
  });

const { host, port, fingerprints } = await server.listen(PORT, BIND);
console.log(`ssh listening on ${host}:${port}`);
for (const fp of fingerprints) console.log(`host key: ${fp}`);

// Pull portfolio content + live data from charliegleason.com and keep it fresh.
// Shared across every session; failures fall back to the bundled content.
const stopContentSync = startContentSync();
const stopLiveSync = startLiveSync();

startRedirectServer();

const shutdown = async (signal: string) => {
  console.log(`[${signal}] shutting down`);
  stopContentSync();
  stopLiveSync();
  await server.close();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
