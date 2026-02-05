// src/views/ProjectsView.tsx

import { TextAttributes } from "@opentui/core";
import { projects } from "../data/content";
import { colors } from "../theme";

type ProjectsViewProps = {
  selectedIndex: number;
  onBack: () => void;
  onOpenUrl: (url: string) => void;
};

export function ProjectsView({ selectedIndex, onBack, onOpenUrl }: ProjectsViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1} alignItems="center">
      <box flexDirection="column" width={80}>
        <text fg={colors.dim} content="← Back (esc)  •  ↑/↓ Navigate  •  Enter to open" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Projects" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <box flexDirection="column">
          {projects.map((project, index) => {
            const isSelected = index === selectedIndex;
            const prefix = isSelected ? "> " : "  ";
            return (
              <box key={project.name} flexDirection="column" marginBottom={1}>
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
      </box>
    </box>
  );
}
