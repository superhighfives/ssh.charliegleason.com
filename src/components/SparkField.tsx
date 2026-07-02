// src/components/SparkField.tsx
// A full-width band that reacts to the keyboard: every keypress (and every
// scroll — arrow keys route through the shared keyboard handler, wheel scroll
// through the ref'd burst() below) sends up a cluster of embers. They arc under
// gravity and fade out, so an idle field is just the horizon rule.
//
// Two tiers, by colour: interaction sparks (key/scroll) burn in `dim`; ambient
// sparks that pop at random on their own burn in the quieter `faint` grey.

import { StyledText, fg, type TextChunk } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { colors } from "../theme";

type SparkKind = "key" | "ambient";
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  kind: SparkKind;
};

// Brightest → faintest. There's one colour per tier, so the glyph carries the
// intensity: denser characters read as hotter, younger sparks.
const SPARK_CHARS = ["*", "•", "·"];

// Embers fountain up from the grey rule at the bottom; this gravity pulls them
// back down as they arc toward the header rule above.
const GRAVITY = 0.05;
const DECAY = 0.035; // life lost per tick (~28 ticks to burn out)
// A keypress sets off a row of little fireworks strung across the whole band
// at once (one cluster per ~12 columns, clamped), rather than a single big pile
// in one spot.
const PRESS_CLUSTER_SIZE = 10; // embers per cluster
const PRESS_COLS_PER_CLUSTER = 12; // width per cluster → count scales with width
const PRESS_MIN_CLUSTERS = 4;
const PRESS_MAX_CLUSTERS = 12;
const SCROLL_BURST = 14; // embers per wheel-scroll tick (single origin)
const MAX_SPARKS = 900; // safety cap so mashed keys can't pile up unbounded
const TICK_MS = 40;
// Chance per tick of an unprompted ambient ember (~one every ~2s at 40ms).
const AMBIENT_CHANCE = 0.02;

const TIER_COLOR: Record<SparkKind, string> = {
  key: colors.dim,
  ambient: colors.faint,
};

function sparkChar(life: number): string {
  if (life > 0.66) return SPARK_CHARS[0]!;
  if (life > 0.33) return SPARK_CHARS[1]!;
  return SPARK_CHARS[2]!;
}

export type SparkFieldHandle = {
  // Emit an interaction burst (used for wheel scroll; key presses spark
  // internally via the keyboard handler).
  burst: () => void;
};

type SparkFieldProps = {
  width: number;
  // Band height in rows. The bottom row is the baseline the sparks spring from.
  height?: number;
};

export const SparkField = forwardRef<SparkFieldHandle, SparkFieldProps>(
  function SparkField({ width, height = 4 }, ref) {
    // Sparks live in a ref (mutated in place each tick); a frame counter forces
    // the re-render. Keeping them out of state avoids a new array allocation per
    // spark on every keypress.
    const sparksRef = useRef<Spark[]>([]);
    const [, setFrame] = useState(0);

    // Launch a cluster from around a random column on the baseline. Interaction
    // bursts (key/scroll) are a big, wide, fast spray; ambient ones are a small
    // cluster that lifts off more gently — more alive than a lone ember, but
    // still clearly the quieter tier. `count` lets keypresses (biggest) and
    // scroll ticks (steadier) share the energetic "key" look at different sizes.
    const spawn = (kind: SparkKind, count?: number, originX?: number) => {
      if (width <= 0) return;
      const energetic = kind === "key";
      const origin = originX ?? Math.random() * width;
      const sparks = sparksRef.current;
      // Ambient defaults to a small, slightly random cluster; callers override
      // count for the interaction tiers.
      const n = count ?? 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) {
        // Spray embers across a few columns around the origin so a burst reads
        // as a firework, not a single jet. Kept modest on purpose: the band is
        // only a few rows tall, so too much launch velocity ejects embers before
        // they can build up the dense, varied look (especially while scrolling).
        const spread = energetic ? 4 : 3;
        sparks.push({
          x: origin + (Math.random() - 0.5) * spread,
          y: height - 1, // spring up from the bottom rule; gravity arcs them back
          vx: (Math.random() - 0.5) * (energetic ? 1.8 : 1.2),
          vy: -(energetic ? 0.5 + Math.random() * 1.2 : 0.5 + Math.random() * 0.9),
          life: energetic ? 0.8 + Math.random() * 0.3 : 0.6 + Math.random() * 0.3,
          kind,
        });
      }
      if (sparks.length > MAX_SPARKS) {
        sparks.splice(0, sparks.length - MAX_SPARKS);
      }
    };

    // Any key sets off a row of clusters strung across the whole band at once —
    // including the ↑/↓/pgup/pgdn/home/end scroll keys. This is the showiest
    // trigger: the whole width lights up in one go.
    useKeyboard(() => {
      const clusters = Math.max(
        PRESS_MIN_CLUSTERS,
        Math.min(PRESS_MAX_CLUSTERS, Math.round(width / PRESS_COLS_PER_CLUSTER))
      );
      const slot = width / clusters;
      for (let c = 0; c < clusters; c++) {
        // One cluster per slot, jittered within it so the row doesn't look
        // evenly stamped.
        const originX = slot * (c + 0.5) + (Math.random() - 0.5) * slot;
        spawn("key", PRESS_CLUSTER_SIZE, originX);
      }
    });

    // Wheel scroll doesn't come through the keyboard, so the view wires the
    // scrollbox's onMouseScroll to this. Steadier than a keypress since a single
    // scroll gesture fires many ticks in quick succession.
    useImperativeHandle(
      ref,
      () => ({ burst: () => spawn("key", SCROLL_BURST) }),
      [width, height]
    );

    useEffect(() => {
      const interval = setInterval(() => {
        // Roll for an unprompted ambient ember first, so the field flickers to
        // life on its own even when nothing's being pressed.
        if (Math.random() < AMBIENT_CHANCE) spawn("ambient");

        const sparks = sparksRef.current;
        if (sparks.length === 0) return; // idle: nothing to animate, skip render
        for (const s of sparks) {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += GRAVITY;
          s.life -= DECAY;
        }
        // Drop sparks that have burnt out or drifted off the band.
        sparksRef.current = sparks.filter(
          (s) => s.life > 0 && s.y >= 0 && s.y < height && s.x >= 0 && s.x < width
        );
        setFrame((f) => (f + 1) % 1_000_000);
      }, TICK_MS);
      return () => clearInterval(interval);
      // spawn closes over width/height; both are stable for a given mount size.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    // Rasterise into per-cell char + colour grids. When several sparks share a
    // cell the brightest (youngest) one wins. The bottom row is a solid grey
    // rule (matching the Divider elsewhere in About) that embers rain down onto,
    // so the band still reads as full-width when nothing's happening.
    const chars: string[][] = Array.from({ length: height }, () =>
      Array(width).fill(" ")
    );
    const cellColor: string[][] = Array.from({ length: height }, () =>
      Array(width).fill(colors.dim)
    );
    const bright: number[][] = Array.from({ length: height }, () =>
      Array(width).fill(0)
    );
    if (height > 0) {
      for (let x = 0; x < width; x++) {
        chars[height - 1]![x] = "─";
        cellColor[height - 1]![x] = colors.border;
      }
    }
    for (const s of sparksRef.current) {
      const ix = Math.floor(s.x);
      const iy = Math.floor(s.y);
      if (iy < 0 || iy >= height || ix < 0 || ix >= width) continue;
      if (s.life > bright[iy]![ix]!) {
        bright[iy]![ix] = s.life;
        chars[iy]![ix] = sparkChar(s.life);
        cellColor[iy]![ix] = TIER_COLOR[s.kind];
      }
    }

    // Flatten to styled chunks, coalescing runs of same-colour cells per row so
    // we emit a handful of chunks rather than one per character.
    const styledChunks: TextChunk[] = [];
    for (let y = 0; y < height; y++) {
      let run = "";
      let runColor = cellColor[y]![0]!;
      const flush = () => {
        if (run) styledChunks.push(fg(runColor)(run));
        run = "";
      };
      for (let x = 0; x < width; x++) {
        const color = cellColor[y]![x]!;
        if (color !== runColor) {
          flush();
          runColor = color;
        }
        run += chars[y]![x]!;
      }
      flush();
      if (y < height - 1) styledChunks.push(fg(colors.dim)("\n"));
    }

    return <text content={new StyledText(styledChunks)} />;
  }
);
