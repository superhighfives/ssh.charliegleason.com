// src/components/Menu.tsx

import { menuItems } from "../data/content";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type MenuProps = {
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
};

export function Menu({ selectedIndex, onSelectedIndexChange }: MenuProps) {
  return (
    <RadioGroup
      value={menuItems[selectedIndex]}
      onValueChange={(value) => {
        const index = menuItems.indexOf(value as (typeof menuItems)[number]);
        if (index >= 0) onSelectedIndexChange(index);
      }}
    >
      {menuItems.map((item) => (
        <RadioGroupItem key={item} value={item} label={item} />
      ))}
    </RadioGroup>
  );
}
