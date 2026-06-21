// src/components/Metadata.tsx

import { useContent } from "../data/store";
import { colors } from "../theme";

export function Metadata() {
  const { metadata } = useContent();

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

      <box flexDirection="column">
        <text fg={colors.dim} content="GitHub" />
        <text fg={colors.yellow} content={`@${metadata.github}`} />
      </box>
    </box>
  );
}
