// src/components/UrlModal.tsx
//
// Centered overlay shown when the user presses enter on a link but we don't
// have a way to open it for them (i.e. running over SSH, where launching a
// browser would open it on the *server*). We display the URL and let the user
// copy it to their clipboard via OSC 52, which works back through the SSH pipe
// to the client terminal.

import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useRef, useState } from "react";
import { useColors } from "./ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

type UrlModalProps = {
  title: string;
  url: string;
  onClose: () => void;
};

export function UrlModal({ title, url, onClose }: UrlModalProps) {
  const colors = useColors();
  const renderer = useRenderer();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const href = url.startsWith("http") ? url : `https://${url}`;

  useKeyboard((key) => {
    if (key.name === "q") {
      onClose();
    } else if (key.name === "return") {
      renderer.copyToClipboardOSC52(href);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent borderColor={colors.yellow} padding={2} minWidth={50}>
        <DialogTitle
          fg={colors.yellow}
          attributes={TextAttributes.BOLD}
          content="Open link"
        />
        <box marginTop={1}>
          <text fg={colors.white} content={title} />
        </box>
        <box>
          <text
            fg={colors.yellow}
            attributes={TextAttributes.UNDERLINE}
            content={href}
          />
        </box>
        <box marginTop={1}>
          <DialogDescription
            fg={copied ? colors.yellow : colors.dim}
            content={copied ? "✔︎ Copied" : "Press enter to copy the URL"}
          />
        </box>
        <text fg={colors.dim} content="Press esc to close." />
      </DialogContent>
    </Dialog>
  );
}
