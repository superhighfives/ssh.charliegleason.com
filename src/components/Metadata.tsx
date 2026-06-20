// src/components/Metadata.tsx

import { useContent } from "../data/store";
import { useLive } from "../data/live";
import { useSessionCount } from "../data/sessions";
import { colors } from "../theme";

export function Metadata() {
  const { metadata } = useContent();
  const { nowPlaying } = useLive();
  // Everyone but you. The count includes the current session, so subtract it.
  const alsoHere = Math.max(0, useSessionCount() - 1);

  const nowPlayingLabel =
    nowPlaying && nowPlaying.isNowPlaying
      ? `${nowPlaying.name} — ${nowPlaying.artist}`
      : null;

  return (
    <box flexDirection="column">
      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="Location" />
        <text fg={colors.white} content={metadata.location} />
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="Work" />
        <text fg={colors.white} content={metadata.company} />
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="Web" />
        <text fg={colors.yellow} content={metadata.website} />
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="GitHub" />
        <text fg={colors.yellow} content={`@${metadata.github}`} />
      </box>

      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="Now Playing" />
        {nowPlayingLabel ? (
          <text fg={colors.white} wrapMode="word" content={nowPlayingLabel} />
        ) : (
          <text fg={colors.dim} content="Nothing right now" />
        )}
      </box>

      <box flexDirection="column">
        <text fg={colors.dim} content="Also here" />
        {alsoHere > 0 ? (
          <text fg={colors.white} content={String(alsoHere)} />
        ) : (
          <text fg={colors.dim} content="Just you" />
        )}
      </box>
    </box>
  );
}
