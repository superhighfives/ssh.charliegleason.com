// src/components/Menu.tsx

import { menuItems } from "../data/content";
import { colors } from "../theme";

type MenuProps = {
  selectedIndex: number;
};

export function Menu({ selectedIndex }: MenuProps) {
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
