"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import type { Route } from "@/components/shell/routes";

type Item = { t: string; s: string; id: Route };

const ALL_ITEMS: Item[] = [
  { t: "Go to Dashboard", s: "navigate", id: "dashboard" },
  { t: "Go to Sessions", s: "navigate", id: "sessions" },
  { t: "Go to Agents", s: "navigate", id: "agents" },
  { t: "Go to Workspace", s: "navigate", id: "files" },
  { t: "Go to Docs", s: "navigate", id: "docs" },
  { t: "Go to Settings", s: "navigate", id: "settings" },
  { t: "New build…", s: "action", id: "dashboard" },
];

export function Palette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (r: Route) => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const items = useMemo(
    () => ALL_ITEMS.filter((x) => x.t.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const it = items[sel];
        if (it) {
          onNavigate(it.id);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, sel, onClose, onNavigate]);

  return (
    <div className="palette-ov" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          placeholder="Jump to…"
        />
        <div className="results">
          {items.map((it, i) => (
            <div
              key={i}
              className={`res ${i === sel ? "sel" : ""}`}
              onClick={() => {
                onNavigate(it.id);
                onClose();
              }}
            >
              <span className="ic">{Icon.chevR}</span>
              <span className="t">{it.t}</span>
              <span className="s">{it.s}</span>
            </div>
          ))}
          {items.length === 0 && (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--text-3)",
                fontFamily: "var(--mono)",
                fontSize: 11,
              }}
            >
              no matches
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
