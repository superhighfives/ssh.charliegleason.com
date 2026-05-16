// src/ssh-server.ts
//
// SSH front door for the OpenTUI app.
// Each session spawns a fresh child process running src/index.tsx,
// wired to a PTY whose I/O is piped to the SSH client.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { spawn as ptySpawn } from "node-pty";
import ssh2, { type PseudoTtyInfo } from "ssh2";

const { Server } = ssh2;

type PtyInfoWithTerm = PseudoTtyInfo & { term?: string };

const HOST_KEY_PATH = process.env.SSH_HOST_KEY_PATH ?? "./host_key";
const PORT = Number(process.env.SSH_PORT ?? 2222);
const BIND = process.env.SSH_BIND ?? "0.0.0.0";

function loadOrCreateHostKey(path: string): Buffer {
  if (existsSync(path)) {
    return readFileSync(path);
  }
  console.log(`no host key at ${path}, generating ed25519...`);
  mkdirSync(dirname(path), { recursive: true });
  const { private: privateKey } = ssh2.utils.generateKeyPairSync("ed25519", {
    comment: "ssh.charliegleason.com",
  });
  writeFileSync(path, privateKey, { mode: 0o600 });
  console.log(`wrote ${path}`);
  return Buffer.from(privateKey);
}

// Command used to launch the TUI per session. Defaults to running this repo
// via bun. In production we set APP_CMD/APP_ARGS via env.
// Note: APP_ARGS is split on spaces - paths with spaces aren't supported.
const APP_CMD = process.env.APP_CMD ?? "bun";
const APP_ARGS = (process.env.APP_ARGS ?? "src/index.tsx").split(" ");

// Soft limits to keep the box safe.
const MAX_CONCURRENT = Number(process.env.SSH_MAX_CONCURRENT ?? 25);
const IDLE_TIMEOUT_MS = Number(process.env.SSH_IDLE_TIMEOUT_MS ?? 5 * 60_000);
const SESSION_MAX_MS = Number(process.env.SSH_SESSION_MAX_MS ?? 30 * 60_000);

// Per-IP connection rate limit: N attempts per WINDOW.
const RATE_LIMIT_MAX = Number(process.env.SSH_RATE_LIMIT_MAX ?? 10);
const RATE_LIMIT_WINDOW_MS = Number(process.env.SSH_RATE_LIMIT_WINDOW_MS ?? 60_000);

let active = 0;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Sweep expired rate-limit entries so a public endpoint that gets scanned
// constantly doesn't accumulate unique IPs forever. .unref() so the timer
// doesn't keep the process alive on shutdown.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (entry.resetAt < now) attempts.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

const server = new Server(
  {
    hostKeys: [loadOrCreateHostKey(HOST_KEY_PATH)],
    banner: "welcome to ssh.charliegleason.com\r\n",
  },
  (client, info) => {
    const ip = info.ip;

    if (rateLimited(ip)) {
      console.log(`[ratelimit] ${ip}`);
      client.end();
      return;
    }

    // Check-and-reserve a slot atomically. Node's event loop is single-
    // threaded, so reading and incrementing `active` in the same tick is
    // safe. We release the slot in the `close` handler below.
    if (active >= MAX_CONCURRENT) {
      console.log(`[full] rejecting ${ip}`);
      client.end();
      return;
    }
    active += 1;
    let slotReleased = false;
    const releaseSlot = () => {
      if (slotReleased) return;
      slotReleased = true;
      active = Math.max(0, active - 1);
    };

    console.log(`[connect] ${ip} (active=${active})`);

    // Public kiosk: accept any auth method, including "none".
    client.on("authentication", (ctx) => ctx.accept());

    client.on("ready", () => {
      client.on("session", (accept) => {
        const session = accept();

        let term = "xterm-256color";
        let cols = 80;
        let rows = 24;
        let pty: ReturnType<typeof ptySpawn> | null = null;
        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        let maxTimer: ReturnType<typeof setTimeout> | null = null;

        const resetIdle = () => {
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            console.log(`[idle] ${ip}`);
            pty?.kill();
          }, IDLE_TIMEOUT_MS);
        };

        session.on("pty", (accept, _reject, ptyInfo) => {
          // @types/ssh2 omits `term`, but ssh2 sets it at runtime.
          term = (ptyInfo as PtyInfoWithTerm).term || term;
          cols = ptyInfo.cols || cols;
          rows = ptyInfo.rows || rows;
          accept();
        });

        session.on("window-change", (accept, _reject, winInfo) => {
          cols = winInfo.cols;
          rows = winInfo.rows;
          try {
            pty?.resize(cols, rows);
          } catch {
            // pty may have exited
          }
          accept?.();
        });

        session.on("shell", (accept) => {
          const stream = accept();

          try {
            pty = ptySpawn(APP_CMD, APP_ARGS, {
              name: term,
              cols,
              rows,
              cwd: process.cwd(),
              env: {
                ...process.env,
                TERM: term,
                SSH_MODE: "1",
                SSH_CLIENT_IP: ip,
              },
            });
          } catch (err) {
            console.error(`[spawn-error] ${ip}`, err);
            stream.write("failed to start session\r\n");
            stream.exit(1);
            stream.end();
            return;
          }

          resetIdle();
          maxTimer = setTimeout(() => {
            console.log(`[max-duration] ${ip}`);
            pty?.kill();
          }, SESSION_MAX_MS);

          pty.onData((data) => {
            try {
              stream.write(data);
            } catch {
              // stream closed
            }
          });

          stream.on("data", (data: Buffer) => {
            resetIdle();
            try {
              pty?.write(data.toString("utf8"));
            } catch {
              // pty exited
            }
          });

          pty.onExit(({ exitCode }) => {
            if (idleTimer) clearTimeout(idleTimer);
            if (maxTimer) clearTimeout(maxTimer);
            try {
              stream.exit(exitCode ?? 0);
              stream.end();
            } catch {
              // already closed
            }
          });

          stream.on("close", () => {
            if (idleTimer) clearTimeout(idleTimer);
            if (maxTimer) clearTimeout(maxTimer);
            try {
              pty?.kill();
            } catch {
              // already gone
            }
          });
        });

        // We only serve an interactive shell. Reject everything else.
        session.on("exec", (_accept, reject) => reject());
        session.on("subsystem", (_accept, reject) => reject());
        session.on("sftp", (_accept, reject) => reject());
      });
    });

    client.on("error", (err: Error) => {
      // Common during port scans; log quietly.
      if (process.env.SSH_VERBOSE) console.error(`[error] ${ip}`, err.message);
    });

    client.on("close", () => {
      releaseSlot();
      console.log(`[end] ${ip} (active=${active})`);
    });
  }
);

server.on("error", (err: Error) => {
  console.error("[server-error]", err);
  process.exit(1);
});

server.listen(PORT, BIND, () => {
  console.log(`ssh listening on ${BIND}:${PORT}`);
  console.log(`host key: ${HOST_KEY_PATH}`);
  console.log(`launching: ${APP_CMD} ${APP_ARGS.join(" ")} per session`);
});

const shutdown = (signal: string) => {
  console.log(`[${signal}] shutting down`);
  server.close(() => process.exit(0));
  // Force exit after 5s in case sessions don't drain.
  setTimeout(() => process.exit(0), 5_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
