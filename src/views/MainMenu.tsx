// src/views/MainMenu.tsx

import { menuItems } from "../data/content";
import { useContent } from "../data/store";
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
// Tagline shown under the bold name in AsciiTitle. Kept here so the line-wrap
// math below stays close to the source of truth.
const TAGLINE = "Designer, developer, creative coder, and musician.";
// Rows that aren't the tagline: the bold name (1) + bottom margin (1).
const TITLE_FIXED_ROWS = 2;
// Shader caption: the row itself (1) + bottom margin (1).
const SHADER_CAPTION_ROWS = 2;
// Compressed shader on the shortest terminals.
const SHADER_MIN = 3;
// Preferred shader height when there's plenty of room.
const SHADER_MAX = 16;

// Cheap line-count estimator. Splits on whitespace and greedy-fills each line
// up to `width` characters — close enough to OpenTUI's word-wrap output for
// sizing purposes.
function estimateWrappedLines(text: string, width: number): number {
  if (width <= 0) return 1;
  const words = text.split(/\s+/);
  let lines = 1;
  let col = 0;
  for (const word of words) {
    const needed = col === 0 ? word.length : word.length + 1;
    if (col + needed > width) {
      lines += 1;
      col = word.length;
    } else {
      col += needed;
    }
  }
  return lines;
}

export function MainMenu({ selectedIndex }: MainMenuProps) {
  const { contentWidth, contentHeight, isStacked } = useLayout();
  const { bio } = useContent();

  // Width inside the bio/menu column, used both for the divider rule and for
  // figuring out how many lines the bio text will actually take.
  const bioInnerWidth = isStacked
    ? contentWidth - COLUMN_CHROME
    : contentWidth - METADATA_COLUMN_WIDTH - 1 - COLUMN_CHROME;

  // The bio/menu column needs: border+padding (4) + bio wrap lines + divider
  // row + 2 row margins around it + every menu item. This is the actual height
  // it'll consume; everything above (title + shader) has to fit in what's left.
  const bioLines = estimateWrappedLines(bio.short, bioInnerWidth);
  const bioColumnRows = COLUMN_CHROME + bioLines + 1 /*divider*/ + 2 /*margins*/ + menuItems.length;

  // Title takes the bold name plus however many lines the tagline wraps to.
  const taglineLines = estimateWrappedLines(TAGLINE, contentWidth);
  const titleRows = TITLE_FIXED_ROWS + taglineLines;

  // Available rows for the shader = terminal height − everything else.
  const available = contentHeight - titleRows - SHADER_CAPTION_ROWS - bioColumnRows;
  const shaderHeight = Math.max(SHADER_MIN, Math.min(SHADER_MAX, available));

  return (
    <box flexDirection="column" padding={1}>
      {/* Capped to terminal height so children can't overflow off the bottom.
          The shader takes whatever rows aren't claimed by the title and the
          bio/menu column below. */}
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        {/* Header: Title */}
        <box flexDirection="row" gap={2} marginBottom={1} alignItems="center" flexShrink={0}>
          <AsciiTitle />
        </box>

        <box flexShrink={0}>
          <ShaderArt
            width={contentWidth}
            height={shaderHeight}
            minHeight={shaderHeight}
            maxHeight={shaderHeight}
            // We've already computed the available height; disable the
            // component's own terminal-based shrinking.
            chromeRows={0}
            type="waves"
          />
        </box>

        {/* Main content. Two columns when wide enough, single column when not.
            On narrow terminals the metadata moves to the top of the About view
            instead of stacking here (where it pushes the menu offscreen). */}
        <box flexDirection="row" gap={1} alignItems="stretch" flexShrink={0}>
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
