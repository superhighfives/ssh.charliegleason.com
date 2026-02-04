// src/views/MoreView.tsx

import { awards, talks, education, certifications, volunteering, races } from "../data/content";
import { colors } from "../theme";

type MoreViewProps = {
  selectedIndex: number;
  onBack: () => void;
};

// Combine all items into a single scrollable list with section headers
type MoreItem = 
  | { type: "header"; title: string }
  | { type: "item"; year?: string; title: string; subtitle?: string };

function buildMoreItems(): MoreItem[] {
  const items: MoreItem[] = [];

  // Awards
  items.push({ type: "header", title: "AWARDS" });
  awards.forEach((a) => items.push({ type: "item", year: a.year, title: a.title }));

  // Talks
  items.push({ type: "header", title: "TALKS" });
  talks.forEach((t) => items.push({ type: "item", year: t.year, title: t.title }));

  // Education
  items.push({ type: "header", title: "EDUCATION" });
  education.forEach((e) => items.push({ 
    type: "item", 
    title: e.degree + (e.note ? ` (${e.note})` : ""),
    subtitle: `${e.school} • ${e.years}`
  }));

  // Certifications
  items.push({ type: "header", title: "CERTIFICATIONS" });
  certifications.forEach((c) => items.push({ type: "item", year: c.year, title: c.title }));

  // Volunteering
  items.push({ type: "header", title: "VOLUNTEERING" });
  volunteering.forEach((v) => items.push({ type: "item", title: v.org, subtitle: v.years }));

  // Triathlons
  items.push({ type: "header", title: "TRIATHLONS" });
  races.triathlons.forEach((r) => items.push({ type: "item", year: r.year, title: r.title }));

  // Half Marathons
  items.push({ type: "header", title: "HALF MARATHONS" });
  races.halfMarathons.forEach((r) => items.push({ type: "item", year: r.year, title: r.title }));

  // Marathons
  items.push({ type: "header", title: "MARATHONS" });
  races.marathons.forEach((r) => items.push({ type: "item", year: r.year, title: r.title }));

  return items;
}

const moreItems = buildMoreItems();

// Get only navigable items (not headers)
export const navigableMoreItems = moreItems.filter((item) => item.type === "item");

export function MoreView({ selectedIndex, onBack }: MoreViewProps) {
  let navigableIndex = 0;

  return (
    <box flexDirection="column" flexGrow={1} padding={1}>
      <text fg={colors.dim}>← Back</text>
      <box marginTop={1}>
        <text fg={colors.yellow}>More</text>
      </box>
      <box marginTop={1} marginBottom={1}>
        <text fg={colors.border}>───────────────────────────────────────────────────────────────────────────</text>
      </box>
      <scrollbox flexGrow={1} focused>
        <box flexDirection="column">
          {moreItems.map((item, idx) => {
            if (item.type === "header") {
              return (
                <box key={`header-${idx}`} marginTop={idx > 0 ? 1 : 0} marginBottom={1}>
                  <text fg={colors.yellow}>{item.title}</text>
                </box>
              );
            }

            const isSelected = navigableIndex === selectedIndex;
            const currentNavIndex = navigableIndex;
            navigableIndex++;

            return (
              <box key={`item-${currentNavIndex}`} flexDirection="column" marginBottom={item.subtitle ? 1 : 0}>
                <box flexDirection="row">
                  <text fg={isSelected ? colors.yellow : colors.white}>
                    {isSelected ? "> " : "  "}
                  </text>
                  {item.year && (
                    <text fg={colors.yellow}>{item.year}  </text>
                  )}
                  <text fg={isSelected ? colors.yellow : colors.white}>{item.title}</text>
                </box>
                {item.subtitle && (
                  <text fg={colors.dim}>    {item.subtitle}</text>
                )}
              </box>
            );
          })}
        </box>
      </scrollbox>
    </box>
  );
}
