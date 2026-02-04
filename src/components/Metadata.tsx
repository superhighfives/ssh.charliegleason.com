// src/components/Metadata.tsx

import { TextAttributes } from "@opentui/core";
import { metadata } from "../data/content";
import { colors } from "../theme";

export function Metadata() {
  return (
    <box flexDirection="column">
      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="LOCATION" />
        <text fg={colors.white} content={metadata.location} />
      </box>
      
      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="WORK" />
        <text fg={colors.white} content={metadata.company} />
      </box>
      
      <box flexDirection="column" marginBottom={1}>
        <text fg={colors.dim} content="WEB" />
        <text fg={colors.yellow} content={metadata.website} />
      </box>
      
      <box flexDirection="column">
        <text fg={colors.dim} content="GITHUB" />
        <text fg={colors.yellow} content={`@${metadata.github}`} />
      </box>
    </box>
  );
}
