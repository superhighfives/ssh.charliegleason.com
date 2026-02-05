// src/views/MoreView.tsx

import { TextAttributes, type ScrollBoxRenderable } from "@opentui/core";
import type { RefObject } from "react";
import { awards, talks, education, certifications, volunteering, races } from "../data/content";
import { colors } from "../theme";

type MoreViewProps = {
  onBack: () => void;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

const MAX_WIDTH = 80;
const MAX_HEIGHT = 24;

export function MoreView({ onBack, scrollRef }: MoreViewProps) {
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={MAX_WIDTH} height={MAX_HEIGHT}>
        <text fg={colors.dim} content="← Back (esc)  •  Scroll: ↑/↓" />
        <box marginTop={2} marginBottom={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="More" />
        </box>
        <box marginTop={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox ref={scrollRef} flexGrow={1}>
          <box flexDirection="column">
            {/* Awards */}
            <box>
              <text fg={colors.yellow} content="Awards" />
            </box>
            <box marginBottom={1} />
            {awards.map((award, idx) => (
              <box key={`award-${idx}`} flexDirection="row" gap={2}>
                <text fg={colors.dim} content={award.year} />
                <text fg={colors.white} content={award.title} maxWidth={60} />
              </box>
            ))}

            {/* Talks */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Talks" />
            </box>
            <box marginBottom={1} />
            {talks.map((talk, idx) => (
              <box key={`talk-${idx}`} flexDirection="row" gap={2}>
                <text fg={colors.dim} content={talk.year} />
                <text fg={colors.white} content={talk.title} maxWidth={60} />
              </box>
            ))}

            {/* Education */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Education" />
            </box>
            <box marginBottom={1} />
            {education.map((edu, idx) => (
              <box key={`edu-${idx}`} flexDirection="column" marginBottom={1}>
                <text fg={colors.white} content={`${edu.degree}${edu.note ? ` (${edu.note})` : ""}`} />
                <text fg={colors.dim} content={edu.school} />
                <text fg={colors.dim} content={edu.years} />
              </box>
            ))}

            {/* Certifications */}
            <box marginTop={1}>
              <text fg={colors.yellow} content="Certifications" />
            </box>
            <box marginBottom={1} />
            {certifications.map((cert, idx) => (
              <box key={`cert-${idx}`} flexDirection="row" gap={2}>
                <text fg={colors.dim} content={cert.year} />
                <text fg={colors.white} content={cert.title} />
              </box>
            ))}

            {/* Volunteering */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Volunteering" />
            </box>
            <box marginBottom={1} />
            {volunteering.map((vol, idx) => (
              <box key={`vol-${idx}`} flexDirection="column" marginBottom={1}>
                <text fg={colors.white} content={vol.org} />
                <text fg={colors.dim} content={vol.years} />
              </box>
            ))}

            {/* Triathlons */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Triathlons" />
            </box>
            <box marginBottom={1} />
            {races.triathlons.map((race, idx) => (
              <box key={`tri-${idx}`} flexDirection="row" gap={2}>
                <text fg={colors.dim} content={race.year} />
                <text fg={colors.white} content={race.title} />
              </box>
            ))}

            {/* Half Marathons */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Half Marathons" />
            </box>
            <box marginBottom={1} />
            {races.halfMarathons.map((race, idx) => (
              <box key={`half-${idx}`} flexDirection="row" gap={2}>
                <text fg={colors.dim} content={race.year} />
                <box flexDirection="column">
                  {race.title.split(",").map((location) => (
                    <text key={location} fg={colors.white} content={location.trim()} />
                  ))}
                </box>
              </box>
            ))}

            {/* Marathons */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Marathons" />
            </box>
            <box marginBottom={1} />
            {races.marathons.map((race, idx) => (
              <box key={`marathon-${idx}`} flexDirection="row" gap={2}>
                <text fg={colors.dim} content={race.year} />
                <text fg={colors.white} content={race.title} />
              </box>
            ))}

            {/* Ultra Marathons */}
            <box marginTop={2}>
              <text fg={colors.yellow} content="Ultra Marathons" />
            </box>
            <box marginBottom={1} />
            <text fg={colors.dim} content="None" />

            <box marginBottom={2} />
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
