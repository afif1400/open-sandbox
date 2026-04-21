"use client";
import { useState } from "react";

export function SettingsPage({
  apiKey,
  setApiKey,
  notifications,
  setNotifications,
  autosave,
  setAutosave,
  onReset,
}: {
  apiKey: string;
  setApiKey: (v: string) => void;
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  autosave: boolean;
  setAutosave: (v: boolean) => void;
  onReset: () => void;
}) {
  const [key, setKey] = useState(apiKey || "");
  const [saved, setSaved] = useState(false);
  return (
    <div className="page-content">
      <h1>Settings</h1>
      <div className="sub">Keys, preferences, and workspace configuration.</div>
      <div className="card">
        <h3>API key</h3>
        <div className="desc">Anthropic API key. Stored in this browser only — never sent to our servers.</div>
        <div className="setting-row">
          <div className="k">
            Anthropic key<span className="s">Every agent call uses this. Costs land on your Anthropic bill.</span>
          </div>
          <div className="v">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-api03-…"
              type="password"
            />
            <div className="help">
              Current: {apiKey ? `${apiKey.slice(0, 10)}…${apiKey.slice(-4)}` : "not set"}
            </div>
            <div className="row">
              <button
                className="btn-prim"
                onClick={() => {
                  setApiKey(key);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }}
                disabled={!key.trim()}
              >
                save key
              </button>
              {saved && (
                <span style={{ color: "var(--agent-done)", fontFamily: "var(--mono)", fontSize: 11 }}>
                  ✓ saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Preferences</h3>
        <div className="desc">Little things.</div>
        <div className="setting-row">
          <div className="k">
            Desktop notifications
            <span className="s">Ping you when a long-running session finishes or fails.</span>
          </div>
          <div className="v">
            <div className={`switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)} />
          </div>
        </div>
        <div className="setting-row">
          <div className="k">
            Autosave workspace
            <span className="s">Persist file changes to your repo as they happen.</span>
          </div>
          <div className="v">
            <div className={`switch ${autosave ? "on" : ""}`} onClick={() => setAutosave(!autosave)} />
          </div>
        </div>
        <div className="setting-row">
          <div className="k">
            Default model
            <span className="s">What new sessions start with. Override per-session later.</span>
          </div>
          <div className="v">
            <select defaultValue="sonnet-4-5">
              <option value="sonnet-4-5">claude-sonnet-4-5</option>
              <option value="opus-4">claude-opus-4</option>
              <option value="haiku-4-5">claude-haiku-4-5</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Danger zone</h3>
        <div className="desc">Destructive actions. No undo.</div>
        <div className="setting-row">
          <div className="k">
            Reset current session
            <span className="s">Clears chat, agents, and preview for the current session.</span>
          </div>
          <div className="v">
            <div className="row">
              <button className="btn-ghost" onClick={onReset}>
                reset session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
