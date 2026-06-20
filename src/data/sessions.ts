// src/data/sessions.ts
//
// Local live count of concurrent SSH sessions. Unlike content/live data this is
// entirely in-process — the SSH server bumps it as connections open and close,
// no network involved. Every session subscribes via `useSessionCount()`, so the
// "Also here" line updates for everyone the moment someone joins or leaves.

import { useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Register a session. Returns a disposer to call when it ends; the disposer is
 * idempotent so a double-close can't drive the count negative.
 */
export function addSession(): () => void {
  count += 1;
  emit();
  let removed = false;
  return () => {
    if (removed) return;
    removed = true;
    count = Math.max(0, count - 1);
    emit();
  };
}

export function getSessionCount(): number {
  return count;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Total live sessions, including the current one. */
export function useSessionCount(): number {
  return useSyncExternalStore(subscribe, getSessionCount, getSessionCount);
}
