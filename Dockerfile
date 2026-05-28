# The SSH wrapper runs on Node (node-pty does not play nicely with Bun's
# Node compat layer for posix_spawn). The TUI child is launched with Bun,
# which is what OpenTUI expects.

FROM node:22-bookworm-slim AS base

# Install Bun for the TUI child process, plus build tools for native addons.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    unzip \
    tini \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://bun.sh/install | bash \
    && ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lock ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production \
    SSH_PORT=2222 \
    SSH_HOST_KEY_PATH=/data/host_key \
    APP_CMD=bun \
    APP_ARGS="src/index.tsx"

EXPOSE 2222

# tini handles signal forwarding so SIGTERM from Fly cleanly stops the server.
# The server self-generates a host key into /data on first boot.
ENTRYPOINT ["/usr/bin/tini", "-s", "--"]
CMD ["node", "--experimental-strip-types", "src/ssh-server.ts"]
