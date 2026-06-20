// src/components/Metadata.tsx

import { useContent } from "../data/store";
import { useLive } from "../data/live";
import { colors } from "../theme";

export function Metadata() {
  const { metadata } = useContent();
  const { nowPlaying, visitors } = useLive();

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
        <text fg={colors.dim} content="Online" />
        <text
          fg={colors.white}
          content={visitors === null ? "—" : String(visitors)}
        />
      </box>
    </box>
  );
}
