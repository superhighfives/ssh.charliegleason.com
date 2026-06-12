# Single-process SSH TUI server. @opentui/ssh accepts the SSH connection
# and mounts the React tree directly onto a per-session CliRenderer - no
# child process, no PTY.

FROM oven/bun:1.3-slim AS base

# tini handles signal forwarding so SIGTERM from Fly cleanly stops the
# server. ncurses-bin provides `tic` and `infocmp`, which Ghostty's
# ssh-terminfo shell integration uses to upload the xterm-ghostty terminfo
# entry on connect.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tini \
    ncurses-bin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .

ENV NODE_ENV=production \
    SSH_PORT=2222 \
    SSH_HOST_KEY_PATH=/data/host_key

EXPOSE 2222

# The server self-generates a host key into /data on first boot.
ENTRYPOINT ["/usr/bin/tini", "-s", "--"]
CMD ["bun", "run", "src/ssh-server.tsx"]
