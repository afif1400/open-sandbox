"use client";
import { Icon } from "@/components/icons";
import type { Route } from "./routes";
import type { SessionState } from "./topbar";

type NavItem = { id: Route; label: string; icon: React.ReactElement; badge?: string | null };

export function Sidebar({
  route,
  setRoute,
  collapsed,
  setCollapsed,
  sessionState,
  streamCount,
}: {
  route: Route;
  setRoute: (r: Route) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  sessionState: SessionState;
  streamCount: number;
}) {
  const nav: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Icon.dash, badge: sessionState === "running" ? "live" : null },
    { id: "sessions", label: "Sessions", icon: Icon.sessions },
    { id: "agents", label: "Agents", icon: Icon.agents },
    { id: "files", label: "Workspace", icon: Icon.files, badge: streamCount > 0 ? "•" : null },
    { id: "docs", label: "Docs", icon: Icon.docs },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-top">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
            <circle cx="14" cy="14" r="3.2" fill="var(--brand)" />
            <circle cx="14" cy="5.5" r="2.2" fill="var(--brand)" opacity="0.55" />
            <circle cx="22.5" cy="14" r="2.2" fill="var(--brand)" opacity="0.55" />
            <circle cx="14" cy="22.5" r="2.2" fill="var(--brand)" opacity="0.55" />
            <circle cx="5.5" cy="14" r="2.2" fill="var(--brand)" opacity="0.55" />
          </svg>
        </div>
        <span className="name">open crew</span>
      </div>
      <div className="proj-switch" title="Switch project">
        <div className="proj-dot">T</div>
        <div className="proj-info">
          <div className="t">todo-companion</div>
          <div className="s">demo session</div>
        </div>
        <span className="chev">{Icon.chev}</span>
      </div>
      <div className="sb-section">Workspace</div>
      <nav className="sb-nav">
        {nav.map((item) => (
          <a
            key={item.id}
            className={route === item.id ? "on" : ""}
            onClick={() => setRoute(item.id)}
            title={item.label}
          >
            <span className="ic">{item.icon}</span>
            <span className="lbl">{item.label}</span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </a>
        ))}
      </nav>
      <div className="sb-section">Account</div>
      <nav className="sb-nav">
        <a className={route === "settings" ? "on" : ""} onClick={() => setRoute("settings")} title="Settings">
          <span className="ic">{Icon.settings}</span>
          <span className="lbl">Settings</span>
        </a>
      </nav>
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="av" aria-hidden="true" />
          <div className="detail">
            <div className="n">you</div>
            <div className="m">BYOK</div>
          </div>
        </div>
      </div>
      <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)} title="Collapse sidebar">
        {collapsed ? Icon.chevR : Icon.chevL}
        <span className="txt">Collapse</span>
      </button>
    </aside>
  );
}
