export type GridDirection = "up" | "down" | "left" | "right";

type GridItem = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function findDirectionalIndex(
  items: GridItem[],
  currentIndex: number,
  direction: GridDirection,
): number {
  const current = items[currentIndex];
  if (!current) return currentIndex;

  let bestIndex = currentIndex;
  let bestScore = Number.POSITIVE_INFINITY;

  items.forEach((item, index) => {
    if (index === currentIndex) return;

    let primaryGap: number;
    let crossAxisGap: number;

    switch (direction) {
      case "up":
        if (item.y + item.height > current.y) return;
        primaryGap = current.y - (item.y + item.height);
        crossAxisGap = Math.abs(item.x - current.x);
        break;
      case "down":
        if (item.y < current.y + current.height) return;
        primaryGap = item.y - (current.y + current.height);
        crossAxisGap = Math.abs(item.x - current.x);
        break;
      case "left":
        if (item.x + item.width > current.x) return;
        primaryGap = current.x - (item.x + item.width);
        crossAxisGap = Math.abs(item.y - current.y);
        break;
      case "right":
        if (item.x < current.x + current.width) return;
        primaryGap = item.x - (current.x + current.width);
        crossAxisGap = Math.abs(item.y - current.y);
        break;
    }

    const score = crossAxisGap * 1_000 + primaryGap;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}
