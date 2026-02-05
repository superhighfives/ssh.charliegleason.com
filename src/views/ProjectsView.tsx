// src/views/ProjectsView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { projects } from "../data/content";
import { colors } from "../theme";

type ProjectsViewProps = {
  selectedIndex: number;
  onBack: () => void;
  onOpenUrl: (url: string) => void;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

const MAX_WIDTH = 80;
const MAX_HEIGHT = 24;

export function ProjectsView({ selectedIndex, onBack, onOpenUrl, scrollRef }: ProjectsViewProps) {
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={MAX_WIDTH} height={MAX_HEIGHT}>
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ Navigate  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Projects" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {projects.map((project, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === projects.length - 1;
              const prefix = isSelected ? "> " : "  ";
              return (
                <box key={project.name} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  <box flexDirection="row">
                    <text 
                      fg={isSelected ? colors.yellow : colors.white} 
                      content={`${prefix}${project.name}`} 
                    />
                    <text fg={colors.dim} marginLeft={2} content={`(${project.url})`} />
                  </box>
                  <text fg={colors.dim} marginLeft={2} content={project.description} />
                </box>
              );
            })}
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
