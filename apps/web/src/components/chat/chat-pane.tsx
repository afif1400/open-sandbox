"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AgentName, DiffEntry, Message, ToolEntry } from "@/types/events";
import { AGENT_LABEL } from "@/types/events";
import { Bubble } from "./bubble";
import { ToolCard } from "./tool-card";
import { DiffCard } from "./diff-card";

export type Sample = { tag: string; text: string };

export function ChatPane({
  messages,
  toolEvents,
  diffEvents,
  thinking,
  liveAgent,
  onSample,
  onSubmit,
  samples,
  modelLabel,
}: {
  messages: Message[];
  toolEvents: ToolEntry[];
  diffEvents: DiffEntry[];
  thinking: AgentName | null;
  liveAgent: AgentName | null;
  onSample: (text: string) => void;
  onSubmit: (text: string) => void;
  samples: Sample[];
  modelLabel: string;
}) {
  const streamRef = useRef<HTMLDivElement>(null);
  const stuckToBottom = useRef(true);
  const [draft, setDraft] = useState("");

  const timeline = useMemo(() => {
    const items = [
      ...messages.map((m, i) => ({ sort: m.ts, kind: "msg" as const, data: m, id: `m${i}` })),
      ...toolEvents.map((t, i) => ({ sort: t.ts, kind: "tool" as const, data: t, id: `t${i}` })),
      ...diffEvents.map((d, i) => ({ sort: d.ts, kind: "diff" as const, data: d, id: `d${i}` })),
    ];
    items.sort((a, b) => a.sort - b.sort);
    return items;
  }, [messages, toolEvents, diffEvents]);

  // Only auto-scroll if the user is already near the bottom. Lets them scroll
  // up to re-read older events without being yanked back on every new event.
  const onStreamScroll = () => {
    const el = streamRef.current;
    if (!el) return;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    stuckToBottom.current = distance < 48;
  };

  useEffect(() => {
    const el = streamRef.current;
    if (el && stuckToBottom.current) el.scrollTop = el.scrollHeight;
  }, [timeline.length, thinking]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onSubmit(t);
    setDraft("");
  };

  const empty = timeline.length === 0;

  return (
    <section className="pane" aria-label="Chat">
      <div className="pane-head">
        <span className="label">chat</span>
        {!empty && <span className="count">{messages.length}</span>}
        <div className="right" />
      </div>
      {empty ? (
        <div className="empty-chat">
          <h2>What should we build?</h2>
          <p>Describe the app. A crew of specialists will spec it, build it, and test it while you watch.</p>
          <div className="samples">
            {samples.map((s, i) => (
              <button key={i} className="sample" onClick={() => onSample(s.text)}>
                <span className="tag">{s.tag}</span>
                <span>{s.text}</span>
                <span className="arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-body" ref={streamRef} onScroll={onStreamScroll}>
          <div className="chat-list">
            {timeline.map((item) => {
              if (item.kind === "msg") {
                const live = item.data.kind === "agent" && item.data.agent === liveAgent;
                return <Bubble key={item.id} {...item.data} live={live} />;
              }
              if (item.kind === "tool") return <ToolCard key={item.id} {...item.data} />;
              return <DiffCard key={item.id} {...item.data} />;
            })}
            {thinking && (
              <div className="turn agent">
                <div className="meta">
                  <span className="chip">{AGENT_LABEL[thinking]}</span>
                  {liveAgent === thinking && <span className="chip live">● LIVE</span>}
                </div>
                <div className="thinking">
                  <span className="d" />
                  <span className="d" />
                  <span className="d" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="prompt">
        {!empty && !draft && (
          <div className="sample-chips" aria-label="Quick prompts">
            {samples.map((s, i) => (
              <button key={i} className="sample-chip" onClick={() => onSample(s.text)}>
                <span className="tag">{s.tag}</span>
                <span className="t">{s.text}</span>
              </button>
            ))}
          </div>
        )}
        <div className="wrap">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder={empty ? "Describe the app you want…" : "Reply or ask for a change…"}
            rows={2}
          />
          <div className="tools">
            <button className="chip">＋ attach</button>
            <button className="chip">{modelLabel}</button>
            <span className="spacer" />
            <span className="hint">
              <kbd>⌘</kbd>
              <kbd>⏎</kbd>
            </span>
            <button className="send" onClick={send} disabled={!draft.trim()}>
              send →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
