// src/views/ProjectsView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { projects } from "../data/content";
import { colors } from "../theme";
import { Divider } from "../components/Divider";
import { useLayout } from "../components/useLayout";

type ProjectsViewProps = {
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function ProjectsView({ selectedIndex, scrollRef }: ProjectsViewProps) {
  const { contentWidth, contentHeight } = useLayout();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ · pgup/pgdn · home/end  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Projects" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <Divider width={contentWidth} />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {projects.map((project, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === projects.length - 1;
              return (
                <box key={project.name} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  <box flexDirection="row">
                    <box width={2}>
                      <text fg={isSelected ? colors.yellow : colors.white} content={isSelected ? "> " : "  "} />
                    </box>
                    <box flexGrow={1} flexDirection="row" flexWrap="wrap">
                      <text
                        fg={isSelected ? colors.yellow : colors.white}
                        content={project.name}
                      />
                      <text fg={colors.dim} marginLeft={2} content={`(${project.url})`} />
                    </box>
                  </box>
                  <box flexDirection="row">
                    <box width={2} />
                    <box flexGrow={1}>
                      <text fg={colors.dim} wrapMode="word" content={project.description} />
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
