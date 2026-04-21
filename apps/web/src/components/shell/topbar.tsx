"use client";
import { Icon } from "@/components/icons";
import { ROUTE_TITLE, type Route } from "./routes";

export type SessionState = "idle" | "running" | "done";

export function Topbar({
  route,
  sessionState,
  onRunToggle,
  onOpenPalette,
  onToggleChat,
  onToggleInsp,
  chatHidden,
  inspHidden,
  onToggleTweaks,
}: {
  route: Route;
  sessionState: SessionState;
  onRunToggle: () => void;
  onOpenPalette: () => void;
  onToggleChat: () => void;
  onToggleInsp: () => void;
  chatHidden: boolean;
  inspHidden: boolean;
  onToggleTweaks: () => void;
}) {
  const statusClass = sessionState === "running" ? "" : sessionState === "done" ? "done" : "idle";
  const statusLabel = sessionState === "running" ? "streaming" : sessionState === "done" ? "complete" : "idle";

  return (
    <header className="topbar">
      <div>
        <div className="page-title">{ROUTE_TITLE[route]}</div>
        <div className="crumbs">
          <a>todo-companion</a> / <span>{route}</span>
        </div>
      </div>
      <div className="spacer" />
      <div className="search" onClick={onOpenPalette}>
        <span>{Icon.search}</span>
        <span>Search sessions, agents, files…</span>
        <span className="spacer" />
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </div>
      {route === "dashboard" && (
        <>
          <button
            className="iconbtn"
            onClick={onToggleChat}
            title={chatHidden ? "Show chat pane" : "Hide chat pane"}
          >
            {Icon.panelL}
          </button>
          <button
            className="iconbtn"
            onClick={onToggleInsp}
            title={inspHidden ? "Show inspector pane" : "Hide inspector pane"}
          >
            {Icon.panelR}
          </button>
          <span className={`live-pill ${statusClass}`} title="Session status">
            <span className="d" /> {statusLabel}
          </span>
          <button className={`run-btn ${sessionState === "running" ? "stop" : ""}`} onClick={onRunToggle}>
            {sessionState === "running" ? Icon.stop : Icon.play}
            {sessionState === "running" ? "stop" : sessionState === "done" ? "restart" : "run"}
          </button>
        </>
      )}
      <button className="iconbtn" onClick={onToggleTweaks} title="Tweaks">
        {Icon.tweaks}
      </button>
      <button className="iconbtn" title="Notifications">
        {Icon.bell}
      </button>
    </header>
  );
}
