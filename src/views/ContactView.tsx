// src/views/ContactView.tsx

import { contact } from "../data/content";
import { colors } from "../theme";

type ContactViewProps = {
  selectedIndex: number;
  onBack: () => void;
};

export function ContactView({ selectedIndex, onBack }: ContactViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Contact</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column" gap={1}>
        {contact.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <text key={item.label} fg={isSelected ? colors.yellow : colors.white}>
              {isSelected ? "> " : "  "}
              {item.label.padEnd(14)} {item.url}
            </text>
          );
        })}
      </box>
    </box>
  );
}
