"use client";
import { useEffect, useMemo, useRef } from "react";
import type { FeedEntry } from "@/types/events";
import { AGENT_SHORT } from "@/types/events";
import { fmtTs } from "@/lib/fmt";

export type ActivityFilter = "all" | "tools" | "files";

export function ActivityTab({
  feed,
  filter,
  setFilter,
}: {
  feed: FeedEntry[];
  filter: ActivityFilter;
  setFilter: (f: ActivityFilter) => void;
}) {
  const filtered = useMemo(() => {
    if (filter === "all") return feed;
    if (filter === "tools") return feed.filter((f) => f.kind === "tool");
    return feed.filter((f) => f.kind === "diff");
  }, [feed, filter]);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [filtered.length]);

  return (
    <>
      <div className="filter-row">
        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
          all
        </button>
        <button className={filter === "tools" ? "on" : ""} onClick={() => setFilter("tools")}>
          tools
        </button>
        <button className={filter === "files" ? "on" : ""} onClick={() => setFilter("files")}>
          files
        </button>
        <span className="spacer" />
        <span className="clear">{feed.length} events</span>
      </div>
      <div className="activity" ref={ref}>
        {filtered.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "var(--text-3)",
              fontFamily: "var(--mono)",
              fontSize: 11,
            }}
          >
            no activity yet
          </div>
        )}
        {filtered.map((e, i) => {
          if (e.kind === "tool") {
            return (
              <div key={i} className={`act-row ${e.agent}`}>
                <span className="ts">{fmtTs(e.ts)}</span>
                <span className="ag">{AGENT_SHORT[e.agent]}</span>
                <span className="desc">
                  <span className="k">{e.tool}</span>()
                </span>
                <span className="st">{e.state === "start" ? "→" : e.state === "end" ? "✓" : "✕"}</span>
              </div>
            );
          }
          return (
            <div key={i} className={`act-row ${e.agent}`}>
              <span className="ts">{fmtTs(e.ts)}</span>
              <span className="ag">{AGENT_SHORT[e.agent]}</span>
              <span className="desc">
                <span className="k">{e.op}</span> {e.path}
              </span>
              <span className="st">+{(e.diff.match(/^\+/gm) || []).length}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
