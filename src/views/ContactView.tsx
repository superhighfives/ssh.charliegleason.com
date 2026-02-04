// src/views/ContactView.tsx

import { contact } from "../data/content";
import { colors } from "../theme";

// ASCII icons for each contact type
const asciiIcons: Record<string, string> = {
  Website: "[WWW]",
  Writing: "[TXT]",
  GitHub: "[GIT]",
  Twitter: "[TWR]",
  Dribbble: "[DRB]",
  Email: "[@@@]",
};

type ContactViewProps = {
  selectedIndex: number;
  onBack: () => void;
  onOpenUrl: (url: string) => void;
};

export function ContactView({ selectedIndex, onBack, onOpenUrl }: ContactViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1} alignItems="center">
      <box flexDirection="column" width={80}>
        <text fg={colors.dim} content="← Back (esc)" />
        <box marginTop={1}>
          <text fg={colors.yellow} content="Contact" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <box flexDirection="column">
          {contact.map((item, index) => {
            const isSelected = index === selectedIndex;
            const icon = asciiIcons[item.label] || "[---]";
            const prefix = isSelected ? "> " : "  ";
            return (
              <box key={item.label} flexDirection="column" marginBottom={1}>
                <text 
                  fg={isSelected ? colors.yellow : colors.white} 
                  content={`${prefix}${icon} ${item.label}`} 
                />
                <text fg={colors.dim} content={`       ${item.description}`} />
                <text fg={colors.dim} content={`       ${item.url}  ${isSelected ? "[Enter to open]" : ""}`} />
              </box>
            );
          })}
        </box>
      </box>
    </box>
  );
}
