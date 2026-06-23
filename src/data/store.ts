// src/data/store.ts
//
// Content store. The SSH server is a single long-lived process, so we fetch the
// portfolio content from charliegleason.com once into a module-level singleton
// and share it across every connected session. A periodic refresh keeps the
// terminal in sync with the website without a redeploy; on any failure we keep
// the last-known-good value (empty content on a cold start — there is no
// build-time fallback). Components subscribe via `useContent()`.

import { useSyncExternalStore } from "react";
import { type Content, emptyContent } from "./content";

// Where to pull content from. Override with CONTENT_API_BASE for local testing
// (e.g. http://localhost:4321 against `astro dev`). Default is the canonical
// www host — the apex 301s to it, and WebSockets (see ./live) can't follow that.
// Trailing slashes are stripped so path joins don't produce `host//api/...`.
const API_BASE = (
  process.env.CONTENT_API_BASE ?? "https://www.charliegleason.com"
).replace(/\/+$/, "");

// ── Shapes returned by the website's APIs ─────────────────────────────────

interface ApiProfile {
  bio: Content["bio"];
  metadata: Content["metadata"];
  awards: Content["awards"];
  talks: Content["talks"];
  education: Content["education"];
  certifications: Content["certifications"];
  volunteering: Content["volunteering"];
  races: Content["races"];
  contact: Content["contact"];
}

interface ApiProject {
  icon: string;
  title: string;
  property: string;
  subtitle: string;
  url: string;
}

// /api/content returns each list as a { title, data } section (matching the
// website's internal model), so the items live under `.data`.
interface ApiSection<T> {
  title: string;
  data: T[];
}

interface ApiContentResponse {
  profile: ApiProfile;
  projects: ApiSection<ApiProject>;
}

interface ApiPost {
  slug: string;
  url: string;
  title: string;
  description: string;
  date: string;
}

interface ApiPostsResponse {
  success: boolean;
  posts?: ApiPost[];
  error?: string;
}

// ── Singleton store ───────────────────────────────────────────────────────

// loading: the first fetch hasn't resolved yet (cold start, empty content).
// ready:   at least one fetch has succeeded; `current` is real content.
// error:   the *first* fetch failed, so we have nothing to show. Once we've been
//          ready, later failures keep last-known-good and stay "ready".
export type ContentStatus = "loading" | "ready" | "error";

let current: Content = emptyContent;
let status: ContentStatus = "loading";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getContent(): Content {
  return current;
}

export function getStatus(): ContentStatus {
  return status;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribe a component to the shared content. Re-renders on every refresh. */
export function useContent(): Content {
  return useSyncExternalStore(subscribe, getContent, getContent);
}

/** Subscribe a component to the load status (loading → ready/error). */
export function useContentStatus(): ContentStatus {
  return useSyncExternalStore(subscribe, getStatus, getStatus);
}

// Drop the scheme (http(s):// or mailto:) and any trailing slash for display,
// matching the bare-URL style the terminal already uses. Launchers re-derive
// the scheme as needed (see the dev entry's openUrl).
function tidyUrl(url: string): string {
  return url
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return (await res.json()) as T;
}

// Guard against overlapping runs: if a refresh is slower than the interval, the
// next tick is skipped rather than racing it (which could let stale data win).
let refreshing = false;

/** Pull the latest content + posts and publish to the store. */
async function refresh(): Promise<void> {
  if (refreshing) return;
  refreshing = true;
  try {
    const data = await fetchJson<ApiContentResponse>("/api/content");

    // Posts are best-effort: if they fail we keep whatever writing list we have
    // (last-known-good, or empty on a cold start) rather than blanking it.
    let writing = current.writing;
    try {
      // Unlike the web homepage's "latest N", the terminal shows everything.
      const posts = await fetchJson<ApiPostsResponse>("/api/posts?limit=all");
      if (posts.success && posts.posts?.length) {
        writing = posts.posts.map((post) => ({
          title: post.title,
          description: post.description,
          url: tidyUrl(post.url),
        }));
      }
    } catch (err) {
      console.error(
        "[content] posts fetch failed, keeping current writing:",
        err instanceof Error ? err.message : err,
      );
    }

    current = {
      bio: data.profile.bio,
      metadata: data.profile.metadata,
      projects: data.projects.data.map((project) => ({
        name: project.title,
        description: project.subtitle,
        url: tidyUrl(project.url),
      })),
      writing,
      awards: data.profile.awards,
      talks: data.profile.talks,
      education: data.profile.education,
      certifications: data.profile.certifications,
      volunteering: data.profile.volunteering,
      races: data.profile.races,
      contact: data.profile.contact.map((item) => ({
        ...item,
        url: tidyUrl(item.url),
      })),
    };
    status = "ready";
    emit();
  } catch (err) {
    console.error(
      "[content] sync failed, keeping last-known-good:",
      err instanceof Error ? err.message : err,
    );
    // Surface an error only on a cold start (nothing to show yet). If we've
    // already been ready, keep the last-known-good content and status.
    if (status === "loading") {
      status = "error";
      emit();
    }
  } finally {
    refreshing = false;
  }
}

/**
 * Begin syncing content. Fetches immediately, then on an interval. Returns a
 * stop function. Safe to call once at process startup.
 */
export function startContentSync(intervalMs = 60_000): () => void {
  void refresh();
  const timer = setInterval(() => {
    void refresh();
  }, intervalMs);
  // Don't let the refresh timer keep the process alive during shutdown.
  timer.unref?.();
  return () => clearInterval(timer);
}
