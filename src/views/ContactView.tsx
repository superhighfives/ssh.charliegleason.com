// src/views/ContactView.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { contact } from "../data/content";
import { colors } from "../theme";
import { useLayout } from "../components/useLayout";
import { ViewHeader } from "../components/ViewHeader";

type ContactViewProps = {
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function ContactView({ selectedIndex, scrollRef }: ContactViewProps) {
  const { contentWidth, contentHeight } = useLayout();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader title="Contact" hint="↑/↓ · pgup/pgdn · home/end  •  Enter to open" />
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {contact.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === contact.length - 1;
              return (
                <box key={item.label} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  <box flexDirection="row">
                    <box width={2}>
                      <text fg={isSelected ? colors.yellow : colors.white} content={isSelected ? "> " : "  "} />
                    </box>
                    <box flexGrow={1}>
                      <text
                        fg={isSelected ? colors.yellow : colors.white}
                        wrapMode="word"
                        content={item.label}
                      />
                    </box>
                  </box>
                  <box flexDirection="row">
                    <box width={2} />
                    <box flexGrow={1} flexDirection="column">
                      <text fg={colors.dim} wrapMode="word" content={item.description} />
                      <text fg={colors.dim} content={item.url} />
                    </box>
                  </box>
                </box>
              );
            })}
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
