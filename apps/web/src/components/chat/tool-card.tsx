import type { AgentName, ToolCallState } from "@/types/events";
import { AGENT_SHORT } from "@/types/events";

export function ToolCard({
  agent,
  tool,
  state,
  args,
}: {
  agent: AgentName;
  tool: string;
  state: ToolCallState;
  args?: Record<string, unknown>;
}) {
  const stCls = state === "start" ? "running" : state === "end" ? "done" : "error";
  const stLabel = state === "start" ? "running" : state === "end" ? "complete" : "error";
  const argKeys = args ? Object.keys(args).filter((k) => args[k] !== undefined) : [];
  return (
    <div className="tool-card">
      <div className="row">
        <span className="tool-agent">{AGENT_SHORT[agent]}</span>
        <span className="tool-agent">·</span>
        <span className="tool-name">{tool}()</span>
        <span className={`state ${stCls}`}>{stLabel}</span>
      </div>
      {argKeys.length > 0 && state === "start" && <pre>{JSON.stringify(args, null, 2)}</pre>}
    </div>
  );
}
