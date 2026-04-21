import type { AgentInfo, AgentName } from "@/types/events";
import { AGENT_DESC, AGENT_LABEL, AGENT_ORDER, AGENT_SHORT } from "@/types/events";

export function AgentsTab({ agents }: { agents: Record<AgentName, AgentInfo> }) {
  return (
    <div className="agents-list">
      {AGENT_ORDER.map((name) => {
        const info = agents[name];
        const bars = Array.from({ length: 14 }, (_, i) => {
          const seed = name.length + (info.tokens || 0) + i * 3;
          const active = info.state !== "idle" && (seed + i * 7) % 10 > 3;
          return <span key={i} className={`b ${active ? "a" : ""}`} style={{ height: 4 + (seed % 8) }} />;
        });
        return (
          <div key={name} className={`agent-row ${info.state}`}>
            <div className="lhs">
              <div className="ico">
                {AGENT_SHORT[name].slice(0, 2)}
                <span className="ring" />
              </div>
            </div>
            <div className="body">
              <div className="n">
                {AGENT_LABEL[name]} <span className="state">{info.state}</span>
              </div>
              <div className="task">{info.task || (info.state === "idle" ? AGENT_DESC[name] : "—")}</div>
            </div>
            <div className="rhs">
              <span className="tk">{(info.tokens || 0).toLocaleString()}t</span>
              <div className="spark">{bars}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
