// src/views/MoreView.tsx

import { type ScrollBoxRenderable } from "@opentui/core";
import type { ReactNode, RefObject } from "react";
import { useContent } from "../data/store";
import { colors } from "../theme";
import { useLayout } from "../components/useLayout";
import { ViewHeader } from "../components/ViewHeader";

type MoreViewProps = {
  scrollRef: RefObject<ScrollBoxRenderable | null>;
};

// Compact section wrapper. One blank row above the heading and one below it,
// for every section. Lets us drop ad-hoc marginTop/marginBottom on each block.
function Section({ title, isFirst, children }: { title: string; isFirst?: boolean; children: ReactNode }) {
  return (
    <box flexDirection="column" marginTop={isFirst ? 0 : 2}>
      <text fg={colors.yellow} content={title} />
      <box marginBottom={1} />
      {children}
    </box>
  );
}

// Year-prefixed row: 6-cell year column on the left, content on the right.
function YearRow({ year, children }: { year: string; children: ReactNode }) {
  return (
    <box flexDirection="row">
      <box width={6}>
        <text fg={colors.dim} content={year} />
      </box>
      <box flexGrow={1} flexDirection="column">
        {children}
      </box>
    </box>
  );
}

export function MoreView({ scrollRef }: MoreViewProps) {
  const { contentWidth, contentHeight } = useLayout();
  const { awards, talks, education, certifications, volunteering, races } =
    useContent();
  return (
    <box flexDirection="column" padding={1}>
      <box flexDirection="column" width={contentWidth} height={contentHeight}>
        <ViewHeader title="More" hint="Scroll: ↑/↓ · pgup/pgdn · home/end" />
        <scrollbox
          ref={scrollRef}
          flexGrow={1}
          contentOptions={{ paddingRight: 1 }}
        >
          <box flexDirection="column">
            <Section title="Awards" isFirst>
              {awards.map((award, idx) => (
                <YearRow key={`award-${idx}`} year={award.year}>
                  <text fg={colors.white} content={award.title} />
                </YearRow>
              ))}
            </Section>

            <Section title="Talks">
              {talks.map((talk, idx) => (
                <YearRow key={`talk-${idx}`} year={talk.year}>
                  <text fg={colors.white} content={talk.title} />
                </YearRow>
              ))}
            </Section>

            <Section title="Education">
              {education.map((edu, idx) => (
                <box key={`edu-${idx}`} flexDirection="column" marginBottom={idx === education.length - 1 ? 0 : 1}>
                  <text fg={colors.white} content={`${edu.degree}${edu.note ? ` (${edu.note})` : ""}`} />
                  <text fg={colors.dim} content={edu.school} />
                  <text fg={colors.dim} content={edu.years} />
                </box>
              ))}
            </Section>

            <Section title="Certifications">
              {certifications.map((cert, idx) => (
                <YearRow key={`cert-${idx}`} year={cert.year}>
                  <text fg={colors.white} content={cert.title} />
                </YearRow>
              ))}
            </Section>

            <Section title="Volunteering">
              {volunteering.map((vol, idx) => (
                <box key={`vol-${idx}`} flexDirection="column" marginBottom={idx === volunteering.length - 1 ? 0 : 1}>
                  <text fg={colors.white} content={vol.org} />
                  <text fg={colors.dim} content={vol.years} />
                </box>
              ))}
            </Section>

            <Section title="Triathlons">
              {races.triathlons.map((race, idx) => (
                <YearRow key={`tri-${idx}`} year={race.year}>
                  <text fg={colors.white} content={race.title} />
                </YearRow>
              ))}
            </Section>

            <Section title="Half Marathons">
              {races.halfMarathons.map((race, idx) => (
                <YearRow key={`half-${idx}`} year={race.year}>
                  {race.title.split(",").map((location) => (
                    <text key={location} fg={colors.white} content={location.trim()} />
                  ))}
                </YearRow>
              ))}
            </Section>

            <Section title="Marathons">
              {races.marathons.map((race, idx) => (
                <YearRow key={`marathon-${idx}`} year={race.year}>
                  <text fg={colors.white} content={race.title} />
                </YearRow>
              ))}
            </Section>

            <Section title="Ultra Marathons">
              <text fg={colors.dim} content="None" />
            </Section>
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
