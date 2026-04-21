"use client";
import { Icon } from "@/components/icons";
import { ROUTE_TITLE, type Route } from "./routes";

export type SessionState = "idle" | "running" | "paused" | "done" | "error";

export function Topbar({
  route,
  sessionState,
  onPrimaryAction,
  onStop,
  onOpenPalette,
  onToggleChat,
  onToggleInsp,
  chatHidden,
  inspHidden,
  onToggleTweaks,
}: {
  route: Route;
  sessionState: SessionState;
  onPrimaryAction: () => void;
  onStop: () => void;
  onOpenPalette: () => void;
  onToggleChat: () => void;
  onToggleInsp: () => void;
  chatHidden: boolean;
  inspHidden: boolean;
  onToggleTweaks: () => void;
}) {
  const statusClass =
    sessionState === "running"
      ? ""
      : sessionState === "paused"
        ? "paused"
        : sessionState === "done"
          ? "done"
          : sessionState === "error"
            ? "error"
            : "idle";
  const statusLabel =
    sessionState === "running"
      ? "streaming"
      : sessionState === "paused"
        ? "paused"
        : sessionState === "done"
          ? "complete"
          : sessionState === "error"
            ? "failed"
            : "idle";

  const primaryIcon =
    sessionState === "running" ? Icon.pause : sessionState === "paused" ? Icon.play : Icon.play;
  const primaryLabel =
    sessionState === "running"
      ? "pause"
      : sessionState === "paused"
        ? "resume"
        : sessionState === "done" || sessionState === "error"
          ? "restart"
          : "run";
  const primaryClass =
    sessionState === "running"
      ? "run-btn pause"
      : sessionState === "paused"
        ? "run-btn"
        : "run-btn";

  const stopVisible = sessionState === "running" || sessionState === "paused";

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
          {stopVisible && (
            <button className="run-btn stop" onClick={onStop} title="Stop and reset session">
              {Icon.stop}
              stop
            </button>
          )}
          <button className={primaryClass} onClick={onPrimaryAction}>
            {primaryIcon}
            {primaryLabel}
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
