// src/views/ProjectsView.tsx

import { projects } from "../data/content";
import { colors } from "../theme";

type ProjectsViewProps = {
  selectedIndex: number;
  onBack: () => void;
};

export function ProjectsView({ selectedIndex, onBack }: ProjectsViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>Projects</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <box flexDirection="column">
        {projects.map((project, index) => {
          const isSelected = index === selectedIndex;
          return (
            <box key={project.name} flexDirection="column" marginBottom={1}>
              <box flexDirection="row">
                <text fg={isSelected ? colors.yellow : colors.white}>
                  {isSelected ? "> " : "  "}
                </text>
                <text fg={isSelected ? colors.yellow : colors.white}>{project.name}</text>
              </box>
              <text fg={colors.dim}>    {project.description}</text>
              <text fg={colors.dim}>    {project.url}</text>
            </box>
          );
        })}
      </box>
    </box>
  );
}
