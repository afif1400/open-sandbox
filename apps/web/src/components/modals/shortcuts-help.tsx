"use client";
import { useEffect } from "react";

type Shortcut = { keys: string[]; label: string };

const GROUPS: Array<{ title: string; items: Shortcut[] }> = [
  {
    title: "Global",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["⌘", "B"], label: "Toggle sidebar" },
      { keys: ["?"], label: "Show keyboard shortcuts" },
      { keys: ["Esc"], label: "Close palette, modal, or help" },
    ],
  },
  {
    title: "Chat",
    items: [
      { keys: ["⌘", "⏎"], label: "Send prompt" },
    ],
  },
  {
    title: "Command palette",
    items: [
      { keys: ["↑", "↓"], label: "Move selection" },
      { keys: ["⏎"], label: "Jump to selection" },
    ],
  },
];

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="help-ov" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow">
          <span>Keyboard shortcuts</span>
          <button className="help-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title} className="help-grp">
            <div className="help-grp-title">{g.title}</div>
            <div className="help-rows">
              {g.items.map((it, i) => (
                <div key={i} className="help-row">
                  <span className="help-label">{it.label}</span>
                  <span className="help-keys">
                    {it.keys.map((k, j) => (
                      <kbd key={j}>{k}</kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
