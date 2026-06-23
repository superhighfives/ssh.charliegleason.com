// src/components/ErrorScreen.tsx
//
// Full-screen cold-start failure, shown when the very first content fetch from
// charliegleason.com fails so we have nothing to render (see ../data/store).
// Mirrors TooSmall: a quiet centred message pointing people at the website.

import { colors } from "../theme";

export function ErrorScreen() {
  return (
    <box flexGrow={1} justifyContent="center" alignItems="center" padding={1}>
      <box flexDirection="column" alignItems="center">
        <text fg={colors.yellow} content="Couldn't load content." />
        <text fg={colors.dim} content="Something isn't working." />
        <box flexDirection="row" marginTop={1}>
          <text fg={colors.dim} content="Visit charliegleason.com." />
        </box>
      </box>
    </box>
  );
}
