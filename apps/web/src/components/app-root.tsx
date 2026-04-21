"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentInfo,
  AgentName,
  DiffEntry,
  FeedEntry,
  Message,
  ToolEntry,
} from "@/types/events";
import { AGENT_ORDER } from "@/types/events";
import { SCRIPTED_STREAM, QA_FAIL_STREAM } from "@/lib/scripted-stream";
import { ChatPane, type Sample } from "@/components/chat/chat-pane";
import { PreviewPane, type Device, type PreviewMode } from "@/components/preview/preview-pane";
import { InspectorPane, type InspectorTab } from "@/components/inspector/inspector-pane";
import type { ActivityFilter } from "@/components/inspector/activity-tab";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar, type SessionState } from "@/components/shell/topbar";
import type { Route } from "@/components/shell/routes";
import { SessionsPage } from "@/components/pages/sessions-page";
import { AgentsPage } from "@/components/pages/agents-page";
import { FilesPage } from "@/components/pages/files-page";
import { DocsPage } from "@/components/pages/docs-page";
import { SettingsPage } from "@/components/pages/settings-page";
import { SetupWizard } from "@/components/modals/setup-wizard";
import { Palette } from "@/components/modals/palette";
import { TweaksPanel, DEFAULT_TWEAKS, ACCENTS, type Tweaks } from "@/components/modals/tweaks-panel";

const SAMPLES: Sample[] = [
  { tag: "TODO", text: "A todo app with lists, priorities, and due dates" },
  { tag: "WELLNESS", text: "A meditation timer with daily streaks and session history" },
  { tag: "JOURNAL", text: "A photo journal with automatic monthly collages" },
];

function initialAgents(): Record<AgentName, AgentInfo> {
  return Object.fromEntries(
    AGENT_ORDER.map((n) => [n, { state: "idle", task: "", tokens: 0 }])
  ) as Record<AgentName, AgentInfo>;
}

export function AppRoot() {
  const [hydrated, setHydrated] = useState(false);

  const [apiKey, setApiKey] = useState<string>("");
  const [route, setRoute] = useState<Route>("dashboard");
  const [sbCollapsed, setSbCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autosave, setAutosave] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    const k = localStorage.getItem("opencrew_api_key") || "";
    const r = (localStorage.getItem("opencrew_route") as Route | null) || "dashboard";
    const sb = localStorage.getItem("opencrew_sb_collapsed") === "1";
    setApiKey(k);
    setRoute(r);
    setSbCollapsed(sb);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem("opencrew_api_key", apiKey);
  }, [hydrated, apiKey]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("opencrew_route", route);
  }, [hydrated, route]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("opencrew_sb_collapsed", sbCollapsed ? "1" : "0");
  }, [hydrated, sbCollapsed]);

  const [chatHidden, setChatHidden] = useState(false);
  const [inspHidden, setInspHidden] = useState(false);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
    setTweaks((prev) => ({ ...prev, [k]: v }));

  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolEvents, setToolEvents] = useState<ToolEntry[]>([]);
  const [diffEvents, setDiffEvents] = useState<DiffEntry[]>([]);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [agents, setAgents] = useState<Record<AgentName, AgentInfo>>(() => initialAgents());
  const [thinking, setThinking] = useState<AgentName | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>(tweaks.defaultDevice);
  const [mode, setMode] = useState<PreviewMode>("web");
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [inspTab, setInspTab] = useState<InspectorTab>("agents");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDevice(tweaks.defaultDevice);
  }, [tweaks.defaultDevice]);

  // Accent via CSS var
  useEffect(() => {
    if (typeof document === "undefined") return;
    const a = ACCENTS[tweaks.accent];
    document.documentElement.style.setProperty("--brand", a.brand);
    document.documentElement.style.setProperty("--brand-ink", a.ink);
  }, [tweaks.accent]);

  // Script runner
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);
  const pausedRef = useRef(false);
  const pendingStepRef = useRef<null | (() => void)>(null);

  const resetSession = useCallback(() => {
    abortRef.current = true;
    pausedRef.current = false;
    pendingStepRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSessionState("idle");
    setMessages([]);
    setToolEvents([]);
    setDiffEvents([]);
    setFeed([]);
    setAgents(initialAgents());
    setThinking(null);
    setPreviewUrl(null);
  }, []);

  const pauseSession = useCallback(() => {
    pausedRef.current = true;
    setSessionState("paused");
    setThinking(null);
  }, []);

  const resumeSession = useCallback(() => {
    pausedRef.current = false;
    setSessionState("running");
    const fn = pendingStepRef.current;
    pendingStepRef.current = null;
    if (fn) fn();
  }, []);

  const runStream = useCallback(
    (userText: string) => {
      abortRef.current = false;
      pausedRef.current = false;
      pendingStepRef.current = null;
      setSessionState("running");
      const speed = parseFloat(tweaks.streamSpeed) || 1;
      const base = Date.now();
      setMessages([{ kind: "user", text: userText, ts: base }]);

      const stream = tweaks.scenario === "qa-fail" ? QA_FAIL_STREAM : SCRIPTED_STREAM;
      let cursor = 0;
      const virtualTs = () => base + cursor;

      const endSession = (reason: "done" | "error") => {
        setThinking(null);
        if (reason === "error") {
          setSessionState("error");
          setToast("QA found a failure — session halted");
          setTimeout(() => setToast(null), 3200);
        } else {
          setSessionState("done");
        }
      };

      const step = (i: number) => {
        if (abortRef.current) return;
        if (i >= stream.length) {
          // Decide whether this run ended happily or in an error state.
          const sawError = tweaks.scenario === "qa-fail";
          endSession(sawError ? "error" : "done");
          return;
        }
        const entry = stream[i];
        if (!entry) return;
        const { delayMs, event } = entry;

        const apply = () => {
          if (abortRef.current) return;
          if (pausedRef.current) {
            // Pause fired while the timer was waiting. Stash this same callback
            // so resume can continue from here without losing the event.
            pendingStepRef.current = apply;
            return;
          }

          cursor += delayMs;
          const ts = virtualTs();

          if (event.type === "agent.state") {
            setAgents((prev) => ({
              ...prev,
              [event.agent]: {
                state: event.state,
                task: event.task ?? prev[event.agent].task,
                tokens: event.tokens ?? prev[event.agent].tokens,
              },
            }));
            if (event.state === "working") setThinking(event.agent);
            else setThinking((cur) => (cur === event.agent ? null : cur));
          } else if (event.type === "agent.message") {
            setMessages((m) => [...m, { kind: "agent", agent: event.agent, text: event.text, ts }]);
            setThinking(null);
          } else if (event.type === "tool.call") {
            const te: ToolEntry = {
              agent: event.agent,
              tool: event.tool,
              state: event.state,
              args: event.args,
              ts,
            };
            setToolEvents((t) => [...t, te]);
            setFeed((f) => [...f, { kind: "tool", ...te }]);
          } else if (event.type === "file.diff") {
            const de: DiffEntry = {
              agent: event.agent,
              path: event.path,
              op: event.op,
              diff: event.diff,
              ts,
            };
            setDiffEvents((d) => [...d, de]);
            setFeed((f) => [...f, { kind: "diff", ...de }]);
          } else if (event.type === "preview.ready") {
            setPreviewUrl(event.url);
            setToast("Preview ready");
            setTimeout(() => setToast(null), 2200);
          }
          step(i + 1);
        };

        timeoutRef.current = setTimeout(apply, delayMs / speed);
      };
      step(0);
    },
    [tweaks.streamSpeed, tweaks.scenario]
  );

  // Global shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSbCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const workingCount = Object.values(agents).filter((a) => a.state === "working").length;
  const streamCount = toolEvents.length + diffEvents.length;

  const handleSubmit = (text: string) => {
    if (sessionState !== "idle") resetSession();
    setTimeout(() => runStream(text), 50);
  };
  const handleSample = (text: string) => handleSubmit(text);

  const workspaceClass = [
    "workspace",
    chatHidden && "chat-hidden",
    inspHidden && "insp-hidden",
    chatHidden && inspHidden && "both-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  // Wait until localStorage hydration complete — avoids setup-wizard flicker
  if (!hydrated) return null;

  if (!apiKey) {
    return <SetupWizard onComplete={(k) => setApiKey(k)} />;
  }

  return (
    <div className={`shell ${sbCollapsed ? "collapsed" : ""}`}>
      <Sidebar
        route={route}
        setRoute={setRoute}
        collapsed={sbCollapsed}
        setCollapsed={setSbCollapsed}
        sessionState={sessionState}
        streamCount={streamCount}
      />
      <div className="main">
        <Topbar
          route={route}
          sessionState={sessionState}
          onPrimaryAction={() => {
            if (sessionState === "running") {
              pauseSession();
            } else if (sessionState === "paused") {
              resumeSession();
            } else {
              handleSubmit(SAMPLES[0]!.text);
            }
          }}
          onStop={resetSession}
          onOpenPalette={() => setPaletteOpen(true)}
          onToggleChat={() => setChatHidden((h) => !h)}
          onToggleInsp={() => setInspHidden((h) => !h)}
          chatHidden={chatHidden}
          inspHidden={inspHidden}
          onToggleTweaks={() => setTweaksOpen((o) => !o)}
        />
        <div className="page">
          {route === "dashboard" && (
            <div className={workspaceClass}>
              <div
                className={`pane ${chatHidden ? "collapsed" : ""}`}
                style={{ display: chatHidden ? "none" : "flex", gridColumn: 1 }}
              >
                <ChatPane
                  messages={messages}
                  toolEvents={toolEvents}
                  diffEvents={diffEvents}
                  thinking={thinking}
                  onSample={handleSample}
                  onSubmit={handleSubmit}
                  samples={SAMPLES}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  minHeight: 0,
                  borderRight: "1px solid var(--border)",
                }}
              >
                <PreviewPane
                  previewUrl={previewUrl}
                  device={device}
                  setDevice={setDevice}
                  mode={mode}
                  setMode={setMode}
                  working={workingCount}
                />
              </div>
              <div
                className={`pane ${inspHidden ? "collapsed" : ""}`}
                style={{ display: inspHidden ? "none" : "flex", borderRight: 0 }}
              >
                <InspectorPane
                  agents={agents}
                  feed={feed}
                  diffEvents={diffEvents}
                  tab={inspTab}
                  setTab={setInspTab}
                  filter={filter}
                  setFilter={setFilter}
                />
              </div>
            </div>
          )}
          {route === "sessions" && <SessionsPage onOpen={() => setRoute("dashboard")} />}
          {route === "agents" && <AgentsPage />}
          {route === "files" && <FilesPage diffEvents={diffEvents} />}
          {route === "docs" && <DocsPage />}
          {route === "settings" && (
            <SettingsPage
              apiKey={apiKey}
              setApiKey={setApiKey}
              notifications={notifications}
              setNotifications={setNotifications}
              autosave={autosave}
              setAutosave={setAutosave}
              onReset={resetSession}
            />
          )}
        </div>
      </div>
      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} onNavigate={(id) => setRoute(id)} />}
      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOpen(false)} />}
      {toast && (
        <div className={`toast ${/fail|error|halted/i.test(toast) ? "error" : ""}`}>
          <span className="d" />
          {toast}
        </div>
      )}
    </div>
  );
}
