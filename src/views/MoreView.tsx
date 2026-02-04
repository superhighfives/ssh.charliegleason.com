// src/views/MoreView.tsx

import { TextAttributes } from "@opentui/core";
import { awards, talks, education, certifications, volunteering, races } from "../data/content";
import { colors } from "../theme";

type MoreViewProps = {
  onBack: () => void;
};

export function MoreView({ onBack }: MoreViewProps) {
  return (
    <box flexDirection="column" flexGrow={1} padding={1} alignItems="center">
      <box flexDirection="column" width={80} flexGrow={1}>
        <text fg={colors.dim} content="← Back (esc)  •  Scroll: ↑/↓" />
        <box marginTop={1}>
          <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="More" />
        </box>
        <box marginTop={1} marginBottom={1}>
          <text fg={colors.border} content="────────────────────────────────────────────────────────────────────────────" />
        </box>
        <scrollbox flexGrow={1} focused style={{ flexGrow: 1 }}>
          <box flexDirection="column">
            {/* Awards */}
            <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="AWARDS" />
            <box marginBottom={1} />
            {awards.map((award, idx) => (
              <text key={`award-${idx}`} fg={colors.white} content={`  ${award.year}  ${award.title}`} />
            ))}

            {/* Talks */}
            <box marginTop={2}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="TALKS" />
            </box>
            <box marginBottom={1} />
            {talks.map((talk, idx) => (
              <text key={`talk-${idx}`} fg={colors.white} content={`  ${talk.year}  ${talk.title}`} />
            ))}

            {/* Education */}
            <box marginTop={2}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="EDUCATION" />
            </box>
            <box marginBottom={1} />
            {education.map((edu, idx) => (
              <box key={`edu-${idx}`} flexDirection="column" marginBottom={1}>
                <text fg={colors.white} content={`  ${edu.degree}${edu.note ? ` (${edu.note})` : ""}`} />
                <text fg={colors.dim} content={`  ${edu.school}`} />
                <text fg={colors.dim} content={`  ${edu.years}`} />
              </box>
            ))}

            {/* Certifications */}
            <box marginTop={1}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="CERTIFICATIONS" />
            </box>
            <box marginBottom={1} />
            {certifications.map((cert, idx) => (
              <text key={`cert-${idx}`} fg={colors.white} content={`  ${cert.year}  ${cert.title}`} />
            ))}

            {/* Volunteering */}
            <box marginTop={2}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="VOLUNTEERING" />
            </box>
            <box marginBottom={1} />
            {volunteering.map((vol, idx) => (
              <box key={`vol-${idx}`} flexDirection="column">
                <text fg={colors.white} content={`  ${vol.org}`} />
                <text fg={colors.dim} content={`  ${vol.years}`} />
              </box>
            ))}

            {/* Triathlons */}
            <box marginTop={2}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="TRIATHLONS" />
            </box>
            <box marginBottom={1} />
            {races.triathlons.map((race, idx) => (
              <text key={`tri-${idx}`} fg={colors.white} content={`  ${race.year}  ${race.title}`} />
            ))}

            {/* Half Marathons */}
            <box marginTop={2}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="HALF MARATHONS" />
            </box>
            <box marginBottom={1} />
            {races.halfMarathons.map((race, idx) => (
              <text key={`half-${idx}`} fg={colors.white} content={`  ${race.year}  ${race.title}`} />
            ))}

            {/* Marathons */}
            <box marginTop={2}>
              <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="MARATHONS" />
            </box>
            <box marginBottom={1} />
            {races.marathons.map((race, idx) => (
              <text key={`marathon-${idx}`} fg={colors.white} content={`  ${race.year}  ${race.title}`} />
            ))}

            <box marginBottom={2} />
          </box>
        </scrollbox>
      </box>
    </box>
  );
}
