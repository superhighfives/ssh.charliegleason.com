// src/data/store.ts
//
// Content store. The SSH server is a single long-lived process, so we fetch the
// portfolio content from charliegleason.com once into a module-level singleton
// and share it across every connected session. A periodic refresh keeps the
// terminal in sync with the website without a redeploy; on any failure we keep
// the last-known-good value (falling back to the build-time content on a cold
// start). Components subscribe via `useContent()`.

import { useSyncExternalStore } from "react";
import { type Content, fallbackContent } from "./content";

// Where to pull content from. Override with CONTENT_API_BASE for local testing
// (e.g. http://localhost:4321 against `astro dev`). Default is the canonical
// www host — the apex 301s to it, and WebSockets (see ./live) can't follow that.
// Trailing slashes are stripped so path joins don't produce `host//api/...`.
const API_BASE = (
  process.env.CONTENT_API_BASE ?? "https://www.charliegleason.com"
).replace(/\/+$/, "");
const POSTS_LIMIT = 6;

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

interface ApiContentResponse {
  profile: ApiProfile;
  projects: ApiProject[];
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

let current: Content = fallbackContent;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getContent(): Content {
  return current;
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
    // (last-known-good, or the fallback on a cold start) rather than blanking it.
    let writing = current.writing;
    try {
      const posts = await fetchJson<ApiPostsResponse>(
        `/api/posts?limit=${POSTS_LIMIT}`,
      );
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
      projects: data.projects.map((project) => ({
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
    emit();
  } catch (err) {
    console.error(
      "[content] sync failed, keeping last-known-good:",
      err instanceof Error ? err.message : err,
    );
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
