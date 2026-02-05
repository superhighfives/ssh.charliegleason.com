// src/views/MainMenu.tsx

import { bio, type MenuItem } from "../data/content";
import { colors } from "../theme";
import { AsciiTitle } from "../components/AsciiTitle";
import { ShaderArt } from "../components/ShaderArt";
import { Menu } from "../components/Menu";
import { Metadata } from "../components/Metadata";

type MainMenuProps = {
  selectedIndex: number;
  onNavigate: (item: MenuItem) => void;
};

const MAX_WIDTH = 80;

export function MainMenu({ selectedIndex, onNavigate }: MainMenuProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1} alignItems="center">
      <box flexDirection="column" width={MAX_WIDTH}>
        {/* Header: Shader + Title */}
        <box flexDirection="row" gap={2} marginBottom={1} alignItems="center">
          
          <AsciiTitle />
        </box>

        <ShaderArt width={MAX_WIDTH} />

        {/* Main content: Two columns */}
        <box flexDirection="row" flexGrow={1} gap={1}>
          {/* Left column: Bio + Menu */}
          <box
            flexDirection="column"
            border
            borderColor={colors.border}
            padding={1}
            flexGrow={1}
          >
            <text fg={colors.white}>{bio.short}</text>
            <box marginTop={1} marginBottom={1}>
              <text fg={colors.border}>────────────────────────────────────────────</text>
            </box>
            <Menu selectedIndex={selectedIndex} onSelect={onNavigate} />
          </box>

          {/* Right column: Metadata */}
          <box
            flexDirection="column"
            border
            borderColor={colors.border}
            padding={1}
            width={26}
          >
            <Metadata />
          </box>
        </box>
      </box>
    </box>
  );
}
