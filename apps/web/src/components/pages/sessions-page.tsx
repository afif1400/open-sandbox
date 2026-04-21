"use client";

type Session = {
  id: string;
  state: "running" | "done" | "archived";
  title: string;
  desc: string;
  ts: string;
  tokens: number;
  files: number;
  agents: number;
};

const SESSIONS: Session[] = [
  { id: "todo-companion", state: "running", title: "todo-companion", desc: "Expo app with lists, priorities, due dates. Supabase backend with RLS.", ts: "12s ago", tokens: 8350, files: 6, agents: 5 },
  { id: "expense-split", state: "done", title: "expense-split", desc: "Group-based expense tracker with even/weighted splits and monthly digests.", ts: "2h ago", tokens: 14200, files: 11, agents: 4 },
  { id: "plant-diary", state: "done", title: "plant-diary", desc: "Photo + care-log app for indoor plants with reminders.", ts: "yesterday", tokens: 22900, files: 14, agents: 5 },
  { id: "dev-changelog", state: "done", title: "dev-changelog", desc: "Slack bot that writes weekly shipped-features digest from GitHub PRs.", ts: "3d ago", tokens: 6400, files: 4, agents: 3 },
  { id: "meal-plan", state: "archived", title: "meal-plan", desc: "Weekly meal-planning app with grocery-list export.", ts: "1w ago", tokens: 18200, files: 9, agents: 4 },
  { id: "focus-timer", state: "archived", title: "focus-timer", desc: "Pomodoro timer with task integration and daily review.", ts: "2w ago", tokens: 5100, files: 5, agents: 3 },
];

export function SessionsPage({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="page-content">
      <h1>Sessions</h1>
      <div className="sub">Every build is an isolated session. Click any to reopen it in the dashboard.</div>
      <div className="sessions-grid">
        {SESSIONS.map((s) => (
          <div key={s.id} className="sess-card" onClick={() => onOpen(s.id)}>
            <div className="s-top">
              <span className={`s-dot ${s.state}`} />
              <span className="s-state">{s.state}</span>
              <span className="s-time">{s.ts}</span>
            </div>
            <h3>{s.title}</h3>
            <div className="s-desc">{s.desc}</div>
            <div className="s-stats">
              <span>
                <span className="k">{s.tokens.toLocaleString()}</span> tokens
              </span>
              <span>
                <span className="k">{s.files}</span> files
              </span>
              <span>
                <span className="k">{s.agents}</span> agents
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
