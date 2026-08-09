import { type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import type { ContactMessage } from "../contact-email";
import type { ContactItem } from "../data/content";
import { ContactForm } from "../components/ContactForm";
import { useColors } from "../components/ThemeProvider";
import { useLayout } from "../components/useLayout";
import { ViewHeader } from "../components/ViewHeader";

type ContactViewProps = {
  mode: "options" | "form";
  contact: ContactItem[];
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
  onSubmit: (message: ContactMessage) => Promise<void>;
  onActivateForm?: () => void;
};

export function ContactView({
  mode,
  contact,
  selectedIndex,
  scrollRef,
  onSubmit,
  onActivateForm,
}: ContactViewProps) {
  const colors = useColors();
  const { contentWidth, contentHeight, isStacked } = useLayout();

  // The two-column grid's width is fixed to what's available once the
  // vertical scrollbar's column is reserved (1 for its track + the scrollbox's
  // own 1-col paddingRight below), rather than the 100% of viewport it'd get
  // by default. The scrollbar only occupies that column when content
  // overflows, reclaiming it otherwise — if the grid filled 100% of viewport,
  // its flexBasis-0/flexGrow-1 columns would redistribute that reclaimed
  // column the moment the bar toggles, visibly shifting every border. Fixing
  // the width means the grid never reacts to the toggle: on a scrollable view
  // it fits exactly, on one that fits there's a spare column of unused
  // padding on the right — imperceptible, and the bar is free to auto-hide
  // normally. Only the two-column layout needs this: the stacked (narrow)
  // layout is a single column with nothing to redistribute space with, so a
  // 1-col change there is as imperceptible as it is on every other
  // single-column view (About, Projects, etc.) — reserving it anyway just
  // made the form needlessly tight.
  const gridWidth = Math.max(0, contentWidth - 2);

  const contactCards = contact.map((item, index) => {
    const optionIndex = index + 1;
    const isSelected = optionIndex === selectedIndex;
    return (
      <box
        id={`contact-option-${optionIndex}`}
        key={item.label}
        flexDirection="column"
        border
        borderColor={isSelected ? colors.yellow : colors.border}
        title={item.label}
        titleColor={isSelected ? colors.yellow : colors.white}
        paddingX={1}
        minHeight={7}
      >
        <text fg={colors.dim} wrapMode="word" content={item.description} />
        <text fg={colors.dim} wrapMode="word" content={item.url} />
      </box>
    );
  });

  const remainingRows = Array.from(
    { length: Math.ceil(Math.max(0, contactCards.length - 2) / 2) },
    (_, rowIndex) => contactCards.slice(2 + rowIndex * 2, 4 + rowIndex * 2),
  );

  const form = (
    <ContactForm
      active={mode === "form"}
      selected={selectedIndex === 0}
      onSubmit={onSubmit}
      onActivate={onActivateForm}
    />
  );

  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader
          title="Contact"
          navigationLabel={mode === "form" ? "Editing message" : undefined}
          hint={
            mode === "form"
              ? "tab/shift-tab to move  •  esc to return to grid"
              : "arrow keys to move  •  enter/tab to select"
          }
        />
        <scrollbox
          ref={scrollRef}
          flexGrow={1}
          contentOptions={{ paddingRight: 1 }}
          viewportCulling={false}
        >
          {isStacked ? (
            <box flexDirection="column" gap={1}>
              {form}
              {contactCards}
            </box>
          ) : (
            <box flexDirection="column" width={gridWidth} gap={1}>
              <box flexDirection="row" gap={1} alignItems="flex-start">
                <box flexDirection="column" flexBasis={0} flexGrow={1}>
                  {form}
                </box>
                <box flexDirection="column" flexBasis={0} flexGrow={1} gap={1}>
                  {contactCards.slice(0, 2)}
                </box>
              </box>
              {remainingRows.map((row, rowIndex) => (
                <box key={rowIndex} flexDirection="row" gap={1} alignItems="flex-start">
                  {row.map((card, cardIndex) => (
                    <box key={cardIndex} flexDirection="column" flexBasis={0} flexGrow={1}>
                      {card}
                    </box>
                  ))}
                  {row.length === 1 && <box flexBasis={0} flexGrow={1} />}
                </box>
              ))}
            </box>
          )}
        </scrollbox>
      </box>
    </box>
  );
}
