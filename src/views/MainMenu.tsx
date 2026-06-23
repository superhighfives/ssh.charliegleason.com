// src/views/MainMenu.tsx

import { menuItems } from "../data/content";
import { useLive } from "../data/live";
import { useSessionCount } from "../data/sessions";
import { useContent } from "../data/store";
import { colors } from "../theme";
import { AsciiTitle } from "../components/AsciiTitle";
import { nowPlayingContent, ShaderArt } from "../components/ShaderArt";
import { Menu } from "../components/Menu";
import { Metadata } from "../components/Metadata";
import { Divider } from "../components/Divider";
import { useLayout } from "../components/useLayout";
import { ContentStatusNote } from "../components/ContentStatusNote";

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
// Shader caption: top margin (1) + the row itself (1) + bottom margin (1).
const SHADER_CAPTION_ROWS = 3;
// Compressed shader on the shortest terminals.
const SHADER_MIN = 2;

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
  const { contentWidth, contentHeight, isStacked, showShader } = useLayout();
  const { bio } = useContent();
  const { nowPlaying } = useLive();
  // Others in the terminal besides you (the count includes this session).
  const alsoHere = Math.max(0, useSessionCount() - 1);

  // Width inside the bio/menu column, used both for the divider rule and for
  // figuring out how many lines the bio text will actually take.
  const bioInnerWidth = isStacked
    ? contentWidth - COLUMN_CHROME
    : contentWidth - METADATA_COLUMN_WIDTH - 1 - COLUMN_CHROME;

  // The bio/menu column needs: border+padding (4) + bio wrap lines + the
  // separator + every menu item. The separator is the divider plus its two
  // margins when wide (3 rows); when stacked we drop the rule and keep just the
  // margins (2 rows). This is the actual height it'll consume; everything above
  // (title + shader) has to fit in what's left.
  const bioLines = estimateWrappedLines(bio.short, bioInnerWidth);
  const separatorRows = isStacked ? 1 : 3;
  const bioColumnRows =
    COLUMN_CHROME + bioLines + separatorRows + menuItems.length;

  // Title takes the bold name plus however many lines the tagline wraps to.
  const taglineLines = estimateWrappedLines(TAGLINE, contentWidth);
  const titleRows = TITLE_FIXED_ROWS + taglineLines;

  // Available rows for the shader = terminal height − everything else. The
  // now-playing line shares the shader's caption row, so it costs no extra rows.
  // No upper cap: the shader fills whatever's left.
  const available =
    contentHeight - titleRows - SHADER_CAPTION_ROWS - bioColumnRows;
  const shaderHeight = Math.max(SHADER_MIN, available);

  return (
    <box flexDirection="column" padding={1}>
      {/* Capped to terminal height so children can't overflow off the bottom.
          The shader takes whatever rows aren't claimed by the title and the
          bio/menu column below. */}
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        {/* Header: title on the left, live presence on the right, top-aligned
            so "Also here" sits on the same row as the name. */}
        <box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
          marginBottom={1}
          flexShrink={0}
        >
          <AsciiTitle />
          {/* Only surface presence when someone else is actually connected. */}
          {alsoHere > 0 && (
            <text fg={colors.dim} content={`Also here: ${alsoHere}`} />
          )}
        </box>

        {/* The now-playing track rides on the shader's caption row (left side);
            the shader name + controls sit on the right. Hidden on short
            terminals (below SHADER_BREAKPOINT) so the bio/menu box stays fully
            visible. */}
        {showShader && (
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
              song={nowPlaying}
            />
          </box>
        )}

        {/* Shader hidden but room for now-playing: render it on its own line so
            it isn't lost with the shader. */}
        {!showShader && nowPlaying && (
          <box flexShrink={0} marginBottom={1}>
            <text
              fg={colors.dim}
              content={nowPlayingContent(nowPlaying, contentWidth)}
            />
          </box>
        )}

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
            {bio.short ? (
              <text fg={colors.white} wrapMode="word" content={bio.short} />
            ) : (
              <ContentStatusNote />
            )}
            {/* Stacked: a single blank row, no rule. Wide: the divider with a
                margin above and below. */}
            {isStacked ? (
              <box height={1} flexShrink={0} />
            ) : (
              <box marginTop={1} marginBottom={1}>
                <Divider width={bioInnerWidth} />
              </box>
            )}
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
