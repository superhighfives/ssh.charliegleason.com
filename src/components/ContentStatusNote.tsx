// src/components/ContentStatusNote.tsx
//
// Placeholder shown in a view's content area when there's nothing to render yet:
// "Loading…" before the first fetch from charliegleason.com lands, or an error
// line if that first fetch failed. Returns null once content is ready, so views
// can render it whenever their own data is empty without special-casing.

import { useContentStatus } from "../data/store";
import { colors } from "../theme";

export function ContentStatusNote() {
  const status = useContentStatus();
  if (status === "ready") return null;
  return (
    <text
      fg={colors.dim}
      wrapMode="word"
      content={
        status === "error"
          ? "Couldn't reach charliegleason.com — try again shortly."
          : "Loading…"
      }
    />
  );
}
