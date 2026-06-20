// src/dev.tsx
//
// Local dev entry point. Runs the TUI directly in your terminal (no SSH).
// Use `bun run dev` for fast iteration; `bun run ssh` exercises the full
// SSH path against localhost:2222.

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { exec } from "child_process";

import { App, type OpenUrl } from "./index";
import { startContentSync } from "./data/store";
import { startLiveSync } from "./data/live";
import { addSession } from "./data/sessions";

const openUrl: OpenUrl = (url) => {
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  const command =
    process.platform === "darwin"
      ? `open "${fullUrl}"`
      : process.platform === "win32"
      ? `start "${fullUrl}"`
      : `xdg-open "${fullUrl}"`;
  exec(command);
};

const renderer = await createCliRenderer();

const cleanup = () => {
  renderer.destroy();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Same content + live sync as the SSH server, so local dev mirrors production.
startContentSync();
startLiveSync();
// Count this local viewer as a session ("Just you").
addSession();

createRoot(renderer).render(<App onExit={cleanup} openUrl={openUrl} />);
