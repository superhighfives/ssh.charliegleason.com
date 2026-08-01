import { expect, test } from "bun:test";
import { findDirectionalIndex } from "./contact-grid";

const items = [
  { x: 0, y: 0, width: 10, height: 20 },
  { x: 11, y: 0, width: 10, height: 9 },
  { x: 11, y: 10, width: 10, height: 9 },
  { x: 0, y: 21, width: 10, height: 9 },
  { x: 11, y: 21, width: 10, height: 9 },
];

test("moves through the contact grid spatially", () => {
  expect(findDirectionalIndex(items, 0, "right")).toBe(1);
  expect(findDirectionalIndex(items, 0, "down")).toBe(3);
  expect(findDirectionalIndex(items, 1, "down")).toBe(2);
  expect(findDirectionalIndex(items, 2, "left")).toBe(0);
  expect(findDirectionalIndex(items, 4, "up")).toBe(2);
});

test("stays put when there is no item in that direction", () => {
  expect(findDirectionalIndex(items, 0, "left")).toBe(0);
  expect(findDirectionalIndex(items, 1, "up")).toBe(1);
});
