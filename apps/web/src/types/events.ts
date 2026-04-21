export const AGENT_ORDER = ["orchestrator", "product", "mobile", "backend", "qa"] as const;
export type AgentName = (typeof AGENT_ORDER)[number];

export const AGENT_LABEL: Record<AgentName, string> = {
  orchestrator: "Orchestrator",
  product: "Product",
  mobile: "Mobile Eng",
  backend: "Backend Eng",
  qa: "QA",
};

export const AGENT_SHORT: Record<AgentName, string> = {
  orchestrator: "ORCH",
  product: "PROD",
  mobile: "MOBL",
  backend: "BACK",
  qa: "QA",
};

export const AGENT_DESC: Record<AgentName, string> = {
  orchestrator: "Plans and routes work to specialists",
  product: "Writes specs, screens, data model",
  mobile: "React Native / Expo implementation",
  backend: "Migrations, RLS, APIs",
  qa: "Typecheck, lint, smoke tests",
};

export type AgentState = "idle" | "working" | "blocked" | "done";
export type ToolCallState = "start" | "end" | "error";
export type DiffOp = "create" | "modify" | "delete";

export type BuilderEvent =
  | { type: "agent.state"; agent: AgentName; state: AgentState; task?: string; tokens?: number }
  | { type: "agent.message"; agent: AgentName; text: string }
  | { type: "agent.thinking"; agent: AgentName; note?: string }
  | { type: "tool.call"; agent: AgentName; tool: string; state: ToolCallState; args?: Record<string, unknown>; error?: string }
  | { type: "file.diff"; agent: AgentName; path: string; op: DiffOp; diff: string }
  | { type: "preview.ready"; url: string }
  | { type: "qa.report"; pass: boolean; checks: Record<string, { pass: boolean; detail?: string }> };

export type ScriptedEntry = { delayMs: number; event: BuilderEvent };

export type AgentInfo = { state: AgentState; task: string; tokens: number };

export type Message =
  | { kind: "user"; text: string; ts: number }
  | { kind: "agent"; agent: AgentName; text: string; ts: number };

export type ToolEntry = {
  agent: AgentName;
  tool: string;
  state: ToolCallState;
  args?: Record<string, unknown>;
  ts: number;
};

export type DiffEntry = {
  agent: AgentName;
  path: string;
  op: DiffOp;
  diff: string;
  ts: number;
};

export type FeedEntry =
  | ({ kind: "tool" } & ToolEntry)
  | ({ kind: "diff" } & DiffEntry);
