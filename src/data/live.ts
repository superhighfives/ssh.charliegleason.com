// src/data/live.ts
//
// Live data store. The website exposes the current Last.fm track at
// /api/lastfm — as JSON for a plain GET, or over WebSocket for an upgrade.
// We poll the JSON over plain HTTPS (Bun's WebSocket client can't complete the
// upgrade against Cloudflare here, and polling is plenty for a once-a-track
// readout). One shared poller in the long-lived process fans updates out to
// every session via `useLive()`. On failure we keep the last-known-good value.

import { useSyncExternalStore } from "react";

const API_BASE = (
  process.env.CONTENT_API_BASE ?? "https://www.charliegleason.com"
).replace(/\/+$/, "");

// The tracker polls Last.fm every ~30s; match that so we're never far behind.
const POLL_INTERVAL_MS = 30_000;

export interface NowPlaying {
  name: string;
  artist: string;
  isNowPlaying: boolean;
}

export interface LiveState {
  nowPlaying: NowPlaying | null;
}

let current: LiveState = { nowPlaying: null };
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

/** Subscribe a component to live data (now-playing). */
export function useLive(): LiveState {
  return useSyncExternalStore(subscribe, getLive, getLive);
}

interface LastFmResponse {
  track?: {
    name?: unknown;
    artist?: unknown;
    isNowPlaying?: unknown;
  };
}

async function refresh(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/lastfm`);
    if (!res.ok) throw new Error(`/api/lastfm -> HTTP ${res.status}`);
    const data = (await res.json()) as LastFmResponse;
    const track = data.track;
    if (
      track &&
      typeof track.name === "string" &&
      typeof track.artist === "string"
    ) {
      update({
        nowPlaying: {
          name: track.name,
          artist: track.artist,
          isNowPlaying: track.isNowPlaying === true,
        },
      });
    }
  } catch (err) {
    console.error(
      "[live] now-playing fetch failed, keeping last-known-good:",
      err instanceof Error ? err.message : err,
    );
  }
}

let polling = false;

/**
 * Start polling now-playing. Fetches immediately, then on an interval. Returns
 * a stop function. Safe to call once at process startup.
 */
export function startLiveSync(): () => void {
  void refresh();
  const timer = setInterval(() => {
    if (polling) return;
    polling = true;
    void refresh().finally(() => {
      polling = false;
    });
  }, POLL_INTERVAL_MS);
  timer.unref?.();
  return () => clearInterval(timer);
}
