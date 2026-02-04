// src/components/Menu.tsx

import { menuItems, type MenuItem } from "../data/content";
import { colors } from "../theme";

type MenuProps = {
  selectedIndex: number;
  onSelect: (item: MenuItem) => void;
};

export function Menu({ selectedIndex, onSelect }: MenuProps) {
  return (
    <box flexDirection="column">
      {menuItems.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <text key={item} fg={isSelected ? colors.yellow : colors.dim}>
            {isSelected ? "> " : "  "}
            {item}
          </text>
        );
      })}
    </box>
  );
}
