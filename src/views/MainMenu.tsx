// src/views/MainMenu.tsx

import { bio } from "../data/content";
import { colors } from "../theme";
import { AsciiTitle } from "../components/AsciiTitle";
import { ShaderArt } from "../components/ShaderArt";
import { Menu } from "../components/Menu";
import { Metadata } from "../components/Metadata";
import { Divider } from "../components/Divider";
import { useLayout } from "../components/useLayout";

type MainMenuProps = {
  selectedIndex: number;
};

// Width of the metadata column in the side-by-side layout.
const METADATA_COLUMN_WIDTH = 26;
// Each bordered column adds 2 cells of border + 2 of padding around its content.
const COLUMN_CHROME = 4;

export function MainMenu({ selectedIndex }: MainMenuProps) {
  const { contentWidth, isStacked } = useLayout();

  // Width inside the bio/menu column, used to stretch the divider rule. When
  // the metadata column is hidden the bio column takes the full content width.
  const bioInnerWidth = isStacked
    ? contentWidth - COLUMN_CHROME
    : contentWidth - METADATA_COLUMN_WIDTH - 1 - COLUMN_CHROME;

  return (
    <box flexDirection="column" padding={1}>
      {/* No explicit height: let the menu size to its content so menu items
          never get clipped. The shader is the only element that responds to
          terminal height (it has its own min/max sizing). */}
      <box flexDirection="column" width={contentWidth}>
        {/* Header: Title */}
        <box flexDirection="row" gap={2} marginBottom={1} alignItems="center">
          <AsciiTitle />
        </box>

        <ShaderArt
          width={contentWidth}
          height={16}
          minHeight={3}
          maxHeight={16}
          type="waves"
        />

        {/* Main content. Two columns when wide enough, single column when not.
            On narrow terminals the metadata moves to the top of the About view
            instead of stacking here (where it pushes the menu offscreen). */}
        <box flexDirection="row" gap={1} alignItems="stretch">
          {/* Bio + Menu */}
          <box
            flexDirection="column"
            border
            borderColor={colors.border}
            padding={1}
            flexGrow={1}
          >
            <text fg={colors.white} wrapMode="word" content={bio.short} />
            <box marginTop={1} marginBottom={1}>
              <Divider width={bioInnerWidth} />
            </box>
            <Menu selectedIndex={selectedIndex} />
          </box>

          {!isStacked && (
            <box
              flexDirection="column"
              border
              borderColor={colors.border}
              padding={1}
              width={METADATA_COLUMN_WIDTH}
            >
              <Metadata />
            </box>
          )}
        </box>
      </box>
    </box>
  );
}
