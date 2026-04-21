const SECTIONS = [
  { t: "Getting started", d: "Zero to first deploy in 10 minutes. BYOK or use a managed key." },
  { t: "Agents reference", d: "Each specialist's tools, prompts, and cost profile." },
  { t: "Session runtime", d: "How sessions are isolated, resource limits, and data retention." },
  { t: "Deploy targets", d: "Push to Vercel, Fly, Expo EAS, or your own Docker host." },
  { t: "API & webhooks", d: "Trigger builds from Slack, GitHub, Linear — wire the event stream anywhere." },
  { t: "Team & billing", d: "Seats, rate limits, and how BYOK usage is metered." },
];

export function DocsPage() {
  return (
    <div className="page-content">
      <h1>Docs</h1>
      <div className="sub">Guides, references, and examples.</div>
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
