// src/views/ContactView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { contact } from "../data/content";
import { colors } from "../theme";

type ContactViewProps = {
  selectedIndex: number;
  onBack: () => void;
  onOpenUrl: (url: string) => void;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

const MAX_WIDTH = 80;
const MAX_HEIGHT = 24;

export function ContactView({ selectedIndex, onBack, onOpenUrl, scrollRef }: ContactViewProps) {
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={MAX_WIDTH} height={MAX_HEIGHT}>
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ Navigate  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Contact" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {contact.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === contact.length - 1;
              const prefix = isSelected ? "> " : "  ";
              return (
                <box key={item.label} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  <text 
                    fg={isSelected ? colors.yellow : colors.white} 
                    content={`${prefix}${item.label}`} 
                  />
                  <text fg={colors.dim} marginLeft={2} content={item.description} />
                  <text fg={colors.dim} marginLeft={2} content={item.url} />
                </box>
              );
            })}
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
