// src/components/Metadata.tsx

import { useContent } from "../data/store";
import { colors } from "../theme";

type MetadataProps = {
  // How many columns to lay the four fields out in. 1 → a single stacked column
  // (the default, used by the main menu's narrow side column); 2 → a 2×2 grid;
  // 4 → a single 4-across row. Callers pick this from the available width.
  columns?: number;
};

export function Metadata({ columns = 1 }: MetadataProps) {
  const { metadata } = useContent();

  const items = [
    { label: "Location", value: metadata.location, color: colors.white },
    { label: "Work", value: metadata.company, color: colors.white },
    { label: "Web", value: metadata.website, color: colors.yellow },
    { label: "GitHub", value: `@${metadata.github}`, color: colors.yellow },
  ];

  // Chunk the fields into rows of `columns`, so the same four items reflow from
  // 4×1 → 2×2 → 1×4 as the caller narrows the column count.
  const cols = Math.max(1, columns);
  const rows: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols));
  }

  return (
    <box flexDirection="column">
      {rows.map((row, ri) => (
        <box
          key={ri}
          flexDirection="row"
          marginBottom={ri < rows.length - 1 ? 1 : 0}
        >
          {row.map((item, ci) => (
            // flexBasis 0 + flexGrow 1 → every cell takes an equal share of the
            // row width regardless of its text length.
            <box
              key={item.label}
              flexDirection="column"
              flexGrow={1}
              flexBasis={0}
              marginRight={ci < row.length - 1 ? 2 : 0}
            >
              <text fg={colors.dim} content={item.label} />
              <text fg={item.color} content={item.value} />
            </box>
          ))}
        </box>
      ))}
    </box>
  );
}
