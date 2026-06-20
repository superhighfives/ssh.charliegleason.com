// src/components/UrlModal.tsx
//
// Centered overlay shown when the user presses enter on a link but we don't
// have a way to open it for them (i.e. running over SSH, where launching a
// browser would open it on the *server*). We just display the URL so they can
// triple-click to select and copy it.

import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { colors } from "../theme";

type UrlModalProps = {
  title: string;
  url: string;
  onClose: () => void;
};

export function UrlModal({ title, url, onClose }: UrlModalProps) {
  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "return" || key.name === "q") {
      onClose();
    }
  });

  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      zIndex={100}
    >
      <box
        flexDirection="column"
        border
        borderColor={colors.yellow}
        padding={2}
        backgroundColor={colors.background}
        minWidth={50}
      >
        <text fg={colors.yellow} attributes={TextAttributes.BOLD} content="Open link" />
        <box marginTop={1}>
          <text fg={colors.white} content={title} />
        </box>
        <box marginTop={1}>
          <text fg={colors.yellow} content={url.startsWith("http") ? url : `https://${url}`} />
        </box>
        <box marginTop={1}>
          <text fg={colors.dim} content="Select the URL above to copy it." />
        </box>
        <box marginTop={1}>
          <text fg={colors.dim} content="Press esc or enter to close." />
        </box>
      </box>
    </box>
  );
}
