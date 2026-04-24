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
import { pickScript } from "@/lib/scripted-stream";
import {
  PROVIDERS,
  PROVIDER_ORDER,
  emptyKeyMap,
  modelLabelFor,
  type ProviderId,
} from "@/lib/providers";
import { LIVE_AGENT_ROLES, type LiveAgentRole } from "@/lib/agent-prompts";
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
import { ShortcutsHelp } from "@/components/modals/shortcuts-help";

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

function hasAnyKey(keys: Record<ProviderId, string>): boolean {
  return PROVIDER_ORDER.some((p) => keys[p]?.trim().length);
}

export function AppRoot() {
  const [hydrated, setHydrated] = useState(false);

  const [apiKeys, setApiKeys] = useState<Record<ProviderId, string>>(() => emptyKeyMap());
  const [route, setRoute] = useState<Route>("dashboard");
  const [sbCollapsed, setSbCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autosave, setAutosave] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    // Per-provider keys. Migrate the legacy single-key entry into the anthropic slot.
    const rawKeys = localStorage.getItem("opencrew_api_keys_v1");
    let keys = emptyKeyMap();
    if (rawKeys) {
      try {
        const parsed = JSON.parse(rawKeys) as Partial<Record<ProviderId, string>>;
        for (const p of PROVIDER_ORDER) {
          if (typeof parsed[p] === "string") keys[p] = parsed[p] as string;
        }
      } catch {
        // malformed; keep empty
      }
    } else {
      const legacy = localStorage.getItem("opencrew_api_key") || "";
      if (legacy) keys = { ...keys, anthropic: legacy };
    }
    setApiKeys(keys);

    const r = (localStorage.getItem("opencrew_route") as Route | null) || "dashboard";
    const sb = localStorage.getItem("opencrew_sb_collapsed") === "1";
    setRoute(r);
    setSbCollapsed(sb);

    // Restore tweaks (theme, accent, scenario, provider, model, etc.)
    const savedTweaks = localStorage.getItem("opencrew_tweaks");
    if (savedTweaks) {
      try {
        const parsed = JSON.parse(savedTweaks);
        setTweaks((prev) => ({
          ...prev,
          ...parsed,
          modelByProvider: { ...prev.modelByProvider, ...(parsed.modelByProvider ?? {}) },
        }));
      } catch {
        // malformed; ignore
      }
    }

    // Restore the last session if there is one. We persist final state, not
    // the scripted timeout loop — so a reload mid-stream shows a frozen
    // snapshot (sessionState gets downgraded to 'paused' below; the user can
    // restart from there).
    const savedSession = localStorage.getItem("opencrew_session_v1");
    if (savedSession) {
      try {
        const blob = JSON.parse(savedSession) as {
          messages: Message[];
          toolEvents: ToolEntry[];
          diffEvents: DiffEntry[];
          feed: FeedEntry[];
          agents: Record<AgentName, AgentInfo>;
          previewUrl: string | null;
          sessionState: SessionState;
        };
        if (Array.isArray(blob.messages)) setMessages(blob.messages);
        if (Array.isArray(blob.toolEvents)) setToolEvents(blob.toolEvents);
        if (Array.isArray(blob.diffEvents)) setDiffEvents(blob.diffEvents);
        if (Array.isArray(blob.feed)) setFeed(blob.feed);
        if (blob.agents) setAgents(blob.agents);
        if (blob.previewUrl !== undefined) setPreviewUrl(blob.previewUrl);
        // A reload kills the setTimeout loop, so a 'running' state can't be
        // resumed. Present it as 'paused' — the user can hit restart.
        if (blob.sessionState) {
          setSessionState(blob.sessionState === "running" ? "paused" : blob.sessionState);
        }
      } catch {
        // malformed blob; ignore
      }
    }

    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem("opencrew_api_keys_v1", JSON.stringify(apiKeys));
  }, [hydrated, apiKeys]);
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const setTweak = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
    setTweaks((prev) => ({ ...prev, [k]: v }));
  useEffect(() => {
    if (hydrated) localStorage.setItem("opencrew_tweaks", JSON.stringify(tweaks));
  }, [hydrated, tweaks]);

  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [toolEvents, setToolEvents] = useState<ToolEntry[]>([]);
  const [diffEvents, setDiffEvents] = useState<DiffEntry[]>([]);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [agents, setAgents] = useState<Record<AgentName, AgentInfo>>(() => initialAgents());
  const [thinking, setThinking] = useState<AgentName | null>(null);
  const [liveAgent, setLiveAgent] = useState<AgentName | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>(tweaks.defaultDevice);
  const [mode, setMode] = useState<PreviewMode>("web");
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [inspTab, setInspTab] = useState<InspectorTab>("agents");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDevice(tweaks.defaultDevice);
  }, [tweaks.defaultDevice]);

  // Persist session snapshot on every relevant change, so a browser refresh
  // doesn't wipe an in-flight build. localStorage writes are fast and session
  // state isn't huge.
  useEffect(() => {
    if (!hydrated) return;
    if (sessionState === "idle") {
      localStorage.removeItem("opencrew_session_v1");
      return;
    }
    const blob = {
      messages,
      toolEvents,
      diffEvents,
      feed,
      agents,
      previewUrl,
      // Store 'paused' when saving a running session, so a reload can't fake
      // a live state it can't resume.
      sessionState: sessionState === "running" ? "paused" : sessionState,
    };
    try {
      localStorage.setItem("opencrew_session_v1", JSON.stringify(blob));
    } catch {
      // Quota exhausted or serialization error — skip silently.
    }
  }, [hydrated, sessionState, messages, toolEvents, diffEvents, feed, agents, previewUrl]);

  // Accent via CSS var
  useEffect(() => {
    if (typeof document === "undefined") return;
    const a = ACCENTS[tweaks.accent];
    document.documentElement.style.setProperty("--brand", a.brand);
    document.documentElement.style.setProperty("--brand-ink", a.ink);
  }, [tweaks.accent]);

  // Theme (light / dark) as an attribute on <html>, consumed by CSS [data-theme="light"]
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = tweaks.theme;
  }, [tweaks.theme]);

  // Export current session to a readable markdown file (download triggered
  // via Blob + a synthetic <a>).
  const exportSession = useCallback(() => {
    const parts: string[] = [];
    parts.push(`# Open Crew session\n`);
    parts.push(`_Exported ${new Date().toISOString()}_\n`);
    const combined = [
      ...messages.map((m) => ({ sort: m.ts, kind: "msg" as const, data: m })),
      ...toolEvents.map((t) => ({ sort: t.ts, kind: "tool" as const, data: t })),
      ...diffEvents.map((d) => ({ sort: d.ts, kind: "diff" as const, data: d })),
    ].sort((a, b) => a.sort - b.sort);

    for (const entry of combined) {
      if (entry.kind === "msg") {
        const m = entry.data;
        if (m.kind === "user") {
          parts.push(`\n## You\n\n${m.text}`);
        } else {
          parts.push(`\n## ${m.agent}\n\n${m.text}`);
        }
      } else if (entry.kind === "tool") {
        const t = entry.data;
        parts.push(`\n\`${t.agent}.${t.tool}()\` — ${t.state}`);
        if (t.args && Object.keys(t.args).length) {
          parts.push("\n```json\n" + JSON.stringify(t.args, null, 2) + "\n```");
        }
      } else {
        const d = entry.data;
        parts.push(`\n**${d.op.toUpperCase()}** \`${d.path}\` _(by ${d.agent})_\n\n\`\`\`diff\n${d.diff}\n\`\`\``);
      }
    }

    const blob = new Blob([parts.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `open-crew-session-${stamp}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [messages, toolEvents, diffEvents]);

  // Script runner
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);
  const pausedRef = useRef(false);
  const pendingStepRef = useRef<null | (() => void)>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const resetSession = useCallback(() => {
    abortRef.current = true;
    pausedRef.current = false;
    pendingStepRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    fetchAbortRef.current = null;
    setSessionState("idle");
    setMessages([]);
    setToolEvents([]);
    setDiffEvents([]);
    setFeed([]);
    setAgents(initialAgents());
    setThinking(null);
    setLiveAgent(null);
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

  const runScriptedStream = useCallback(
    (userText: string, baseTs: number, skipRoles: AgentName[]) => {
      abortRef.current = false;
      pausedRef.current = false;
      pendingStepRef.current = null;
      const speed = parseFloat(tweaks.streamSpeed) || 1;
      let cursor = baseTs - Date.now();
      const virtualTs = () => Date.now() + cursor;

      // Drop events for roles that already ran live — avoids duplicate turns.
      const raw = pickScript(userText, tweaks.scenario);
      const skip = new Set<AgentName>(skipRoles);
      const stream = skip.size > 0 ? raw.filter((e) => !("agent" in e.event) || !skip.has(e.event.agent)) : raw;

      const endSession = (reason: "done" | "error") => {
        setThinking(null);
        setLiveAgent(null);
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

  const runStream = useCallback(
    async (userText: string) => {
      abortRef.current = false;
      pausedRef.current = false;
      pendingStepRef.current = null;
      setSessionState("running");
      const base = Date.now();
      setMessages([{ kind: "user", text: userText, ts: base }]);

      const provider = tweaks.provider;
      const model = tweaks.modelByProvider[provider];
      const key = apiKeys[provider]?.trim() ?? "";
      // Demo keys are placeholders — fall back to fully scripted.
      const useReal = key.length > 0 && !key.startsWith(`${provider}-demo`) && !key.startsWith("sk-ant-demo");

      if (!useReal) {
        runScriptedStream(userText, base, []);
        return;
      }

      // Live pipeline: orchestrator, then product. Each agent sees the
      // previous agent's output as its briefing context.
      const taskByRole: Record<LiveAgentRole, string> = {
        orchestrator: "Planning the build",
        product: "Writing the spec",
      };
      let contextText = "";
      const ranRoles: AgentName[] = [];

      for (const role of LIVE_AGENT_ROLES) {
        if (abortRef.current) return;

        setAgents((prev) => ({
          ...prev,
          [role]: { state: "working", task: taskByRole[role], tokens: 0 },
        }));
        setThinking(role);
        setLiveAgent(role);

        const msgTs = Date.now() + ranRoles.length + 1;
        setMessages((m) => [...m, { kind: "agent", agent: role, text: "", ts: msgTs }]);

        const ctrl = new AbortController();
        fetchAbortRef.current = ctrl;

        let resultText = "";
        try {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              provider,
              model,
              apiKey: key,
              role,
              prompt: userText,
              ...(role === "orchestrator" ? {} : { context: contextText }),
            }),
            signal: ctrl.signal,
          });
          if (!res.ok || !res.body) {
            const errText = await res.text().catch(() => "");
            throw new Error(errText || `${res.status} ${res.statusText}`);
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let firstChunk = true;
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (firstChunk && value) {
              // First byte arrived — move from thinking dots to live-streaming bubble.
              setThinking(null);
              firstChunk = false;
            }
            resultText += decoder.decode(value, { stream: true });
            setMessages((m) =>
              m.map((msg) => (msg.ts === msgTs && msg.kind === "agent" ? { ...msg, text: resultText } : msg)),
            );
          }
          resultText += decoder.decode();
          setMessages((m) =>
            m.map((msg) => (msg.ts === msgTs && msg.kind === "agent" ? { ...msg, text: resultText } : msg)),
          );
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          const reason = err instanceof Error ? err.message : "request failed";
          resultText = `[${role} call failed: ${reason}] — continuing with the rest of the crew.`;
          setMessages((m) =>
            m.map((msg) => (msg.ts === msgTs && msg.kind === "agent" ? { ...msg, text: resultText } : msg)),
          );
          setToast(`Live ${role} failed — continuing`);
          setTimeout(() => setToast(null), 3200);
        } finally {
          fetchAbortRef.current = null;
        }

        setAgents((prev) => ({ ...prev, [role]: { ...prev[role], state: "done" } }));
        setThinking(null);
        ranRoles.push(role);
        contextText = resultText;
      }

      setLiveAgent(null);
      // Continue scripted fixture for the agents that didn't run live.
      const nextBase = Date.now();
      runScriptedStream(userText, nextBase, ranRoles);
    },
    [tweaks.provider, tweaks.modelByProvider, tweaks.streamSpeed, tweaks.scenario, apiKeys, runScriptedStream]
  );

  // Global shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField = tag === "input" || tag === "textarea";
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSbCollapsed((c) => !c);
      } else if (!inField && e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setHelpOpen(true);
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

  if (!hasAnyKey(apiKeys)) {
    return (
      <SetupWizard
        onComplete={(provider, key) => {
          setApiKeys((prev) => ({ ...prev, [provider]: key }));
          setTweaks((prev) => ({ ...prev, provider }));
        }}
      />
    );
  }

  const activeModel = tweaks.modelByProvider[tweaks.provider];
  const modelDisplay = `${PROVIDERS[tweaks.provider].short.toLowerCase()}·${modelLabelFor(tweaks.provider, activeModel)}`;

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
                  liveAgent={liveAgent}
                  onSample={handleSample}
                  onSubmit={handleSubmit}
                  samples={SAMPLES}
                  modelLabel={modelDisplay}
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
          {route === "files" && (
            <FilesPage diffEvents={diffEvents} onGoToDashboard={() => setRoute("dashboard")} />
          )}
          {route === "docs" && <DocsPage />}
          {route === "settings" && (
            <SettingsPage
              apiKeys={apiKeys}
              setApiKey={(p, v) => setApiKeys((prev) => ({ ...prev, [p]: v }))}
              notifications={notifications}
              setNotifications={setNotifications}
              autosave={autosave}
              setAutosave={setAutosave}
              provider={tweaks.provider}
              setProvider={(p) => setTweak("provider", p)}
              modelByProvider={tweaks.modelByProvider}
              setModel={(p, m) =>
                setTweak("modelByProvider", { ...tweaks.modelByProvider, [p]: m })
              }
              onReset={resetSession}
              onExport={exportSession}
            />
          )}
        </div>
      </div>
      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} onNavigate={(id) => setRoute(id)} />}
      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOpen(false)} />}
      {helpOpen && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}
      {toast && (
        <div className={`toast ${/fail|error|halted/i.test(toast) ? "error" : ""}`}>
          <span className="d" />
          {toast}
        </div>
      )}
    </div>
  );
}
