// src/data/live.ts
//
// Live data store. The website pushes now-playing (Last.fm) and the live
// visitor count over WebSocket from Durable Objects. The SSH process holds one
// shared connection to each and fans the updates out to every session via
// `useLive()`. Connections auto-reconnect with backoff; until the first message
// arrives the values are null and the UI shows a quiet placeholder.

import { useSyncExternalStore } from "react";

// Derived from the same base as content: https://… -> wss://…
const WS_BASE = (
  process.env.CONTENT_API_BASE ?? "https://www.charliegleason.com"
).replace(/^http/, "ws");

export interface NowPlaying {
  name: string;
  artist: string;
  isNowPlaying: boolean;
}

export interface LiveState {
  nowPlaying: NowPlaying | null;
  visitors: number | null;
}

let current: LiveState = { nowPlaying: null, visitors: null };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function update(patch: Partial<LiveState>) {
  current = { ...current, ...patch };
  emit();
}

export function getLive(): LiveState {
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribe a component to live data (now-playing + visitor count). */
export function useLive(): LiveState {
  return useSyncExternalStore(subscribe, getLive, getLive);
}

const MAX_BACKOFF_MS = 30_000;

// Hold a single auto-reconnecting WebSocket to `path`, handing each parsed JSON
// message to `onMessage`. Returns a stop function.
function connect(
  path: string,
  onMessage: (data: unknown) => void,
): () => void {
  let socket: WebSocket | null = null;
  let backoff = 1_000;
  let stopped = false;

  const schedule = () => {
    if (stopped) return;
    setTimeout(open, backoff);
    backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
  };

  const open = () => {
    if (stopped) return;
    try {
      socket = new WebSocket(`${WS_BASE}${path}`);
    } catch {
      schedule();
      return;
    }
    socket.addEventListener("open", () => {
      backoff = 1_000;
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed frames.
      }
    });
    // A failed connection fires "error" then "close"; reconnect on close only
    // so we don't schedule twice.
    socket.addEventListener("close", schedule);
    socket.addEventListener("error", () => {
      try {
        socket?.close();
      } catch {
        // already closing
      }
    });
  };

  open();

  return () => {
    stopped = true;
    try {
      socket?.close();
    } catch {
      // already closed
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Start the live connections. Returns a stop function. Note: the visitor WS
 * counts as one persistent connection on the website's counter — expected and
 * negligible.
 */
export function startLiveSync(): () => void {
  const stopLastfm = connect("/api/lastfm", (data) => {
    if (!isRecord(data) || !isRecord(data.track)) return;
    const track = data.track;
    if (typeof track.name !== "string" || typeof track.artist !== "string") {
      return;
    }
    update({
      nowPlaying: {
        name: track.name,
        artist: track.artist,
        isNowPlaying: track.isNowPlaying === true,
      },
    });
  });

  const stopVisitors = connect("/api/visitors", (data) => {
    if (isRecord(data) && typeof data.count === "number") {
      update({ visitors: data.count });
    }
  });

  return () => {
    stopLastfm();
    stopVisitors();
  };
}
