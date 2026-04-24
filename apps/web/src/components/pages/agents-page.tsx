import { AGENT_DESC, AGENT_LABEL, AGENT_ORDER, AGENT_SHORT } from "@/types/events";

// Deterministic per-agent stats so SSR and client match.
const STATS: Record<string, { runs: number; tokens: number; success: number }> = {
  orchestrator: { runs: 31, tokens: 640, success: 97 },
  product: { runs: 24, tokens: 1240, success: 95 },
  mobile: { runs: 19, tokens: 3890, success: 93 },
  backend: { runs: 27, tokens: 2100, success: 96 },
  qa: { runs: 42, tokens: 480, success: 99 },
};

export function AgentsPage() {
  return (
    <div className="page-content">
      <h1>Agents</h1>
      <div className="sub">
        The specialists on your team. Each runs as an independent sub-agent with its own tools.
      </div>
      {AGENT_ORDER.map((name) => {
        const stats = STATS[name] || { runs: 0, tokens: 0, success: 0 };
        return (
          <div key={name} className="card">
            <h3>
              {AGENT_LABEL[name]}{" "}
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--text-3)",
                  marginLeft: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {AGENT_SHORT[name]}
              </span>
            </h3>
            <div className="desc">{AGENT_DESC[name]}</div>
            <div className="kv-grid">
              <div className="kv">
                <div className="k">Model</div>
                <div className="v mono" style={{ fontSize: 13 }}>
                  active provider
                </div>
              </div>
              <div className="kv">
                <div className="k">Runs this week</div>
                <div className="v">{stats.runs}</div>
              </div>
              <div className="kv">
                <div className="k">Avg tokens</div>
                <div className="v">
                  {stats.tokens.toLocaleString()}
                  <span className="u">/run</span>
                </div>
              </div>
              <div className="kv">
                <div className="k">Success rate</div>
                <div className="v">
                  {stats.success}
                  <span className="u">%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
