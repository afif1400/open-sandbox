const SECTIONS = [
  { t: "Getting started", d: "Clone, docker compose up, paste your key, ship your first app." },
  { t: "The crew", d: "Each specialist's job, tools, prompt, and typical token cost." },
  { t: "Session runtime", d: "How sandboxes isolate your build, resource limits, and data retention." },
  { t: "Deploy targets", d: "Ship the generated app: GitHub push, Expo EAS, or your own Docker host." },
  { t: "Events & webhooks", d: "The stream the crew emits is just events. Tap it from CI, Slack, or your own tools." },
  { t: "Team & billing", d: "Seats, rate limits, and how BYOK usage is metered against your Anthropic account." },
];

export function DocsPage() {
  return (
    <div className="page-content">
      <h1>Docs</h1>
      <div className="sub">How the crew works, and how to steer it.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {SECTIONS.map((s) => (
          <div key={s.t} className="card" style={{ marginBottom: 0, cursor: "pointer" }}>
            <h3>{s.t}</h3>
            <div className="desc" style={{ marginBottom: 0 }}>
              {s.d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
