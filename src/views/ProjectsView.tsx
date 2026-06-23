// src/views/ProjectsView.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { useContent } from "../data/store";
import { colors } from "../theme";
import { useLayout } from "../components/useLayout";
import { ViewHeader } from "../components/ViewHeader";

type ProjectsViewProps = {
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

export function ProjectsView({ selectedIndex, scrollRef }: ProjectsViewProps) {
  const { contentWidth, contentHeight, isCompact } = useLayout();
  const { projects } = useContent();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader title="Projects" hint="↑/↓ · pgup/pgdn · home/end  •  Enter to open" />
        <scrollbox
          ref={scrollRef}
          flexGrow={1}
          contentOptions={{ paddingRight: 1 }}
        >
          <box flexDirection="column">
            {projects.map((project, index) => {
              const isSelected = index === selectedIndex;
              const isLast = index === projects.length - 1;
              return (
                <box key={project.name} flexDirection="column" marginBottom={isLast ? 0 : 1}>
                  {/* Wide: name and (url) share a row, wrapping as a unit.
                      Narrow: stack the url on its own line and char-wrap it so a
                      long URL breaks instead of overflowing the scrollbar. */}
                  {isCompact ? (
                    <>
                      <box flexDirection="row">
                        <box width={2}>
                          <text fg={isSelected ? colors.yellow : colors.white} content={isSelected ? "> " : "  "} />
                        </box>
                        <box flexGrow={1}>
                          <text fg={isSelected ? colors.yellow : colors.white} content={project.name} />
                        </box>
                      </box>
                      <box flexDirection="row">
                        <box width={2} />
                        <box flexGrow={1}>
                          <text fg={colors.border} wrapMode="char" content={`(${project.url})`} />
                        </box>
                      </box>
                    </>
                  ) : (
                    <box flexDirection="row">
                      <box width={2}>
                        <text fg={isSelected ? colors.yellow : colors.white} content={isSelected ? "> " : "  "} />
                      </box>
                      <box flexGrow={1} flexDirection="row" flexWrap="wrap">
                        <text
                          fg={isSelected ? colors.yellow : colors.white}
                          content={project.name}
                        />
                        <text fg={colors.border} marginLeft={2} content={`(${project.url})`} />
                      </box>
                    </box>
                  )}
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
