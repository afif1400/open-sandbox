"use client";
import { useState } from "react";
import { PROVIDERS, PROVIDER_ORDER, type ProviderId } from "@/lib/providers";

function mask(key: string): string {
  if (!key) return "not set";
  if (key.length <= 14) return `${key.slice(0, 4)}…`;
  return `${key.slice(0, 10)}…${key.slice(-4)}`;
}

function KeyRow({
  providerId,
  active,
  currentKey,
  onSave,
  onMakeActive,
}: {
  providerId: ProviderId;
  active: boolean;
  currentKey: string;
  onSave: (v: string) => void;
  onMakeActive: () => void;
}) {
  const info = PROVIDERS[providerId];
  const [staged, setStaged] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div className="setting-row">
      <div className="k">
        <span className="row">
          {info.label}
          {active && (
            <span
              style={{
                marginLeft: 8,
                padding: "2px 6px",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                color: "var(--agent-done)",
              }}
            >
              active
            </span>
          )}
        </span>
        <span className="s">{info.keyHint}</span>
      </div>
      <div className="v">
        <input
          value={staged}
          onChange={(e) => setStaged(e.target.value)}
          placeholder={info.keyPlaceholder}
          type="password"
        />
        <div className="help">current: {mask(currentKey)}</div>
        <div className="row">
          <button
            className="btn-prim"
            disabled={!staged.trim()}
            onClick={() => {
              onSave(staged.trim());
              setStaged("");
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            save key
          </button>
          {!active && (
            <button className="btn-ghost" onClick={onMakeActive} disabled={!currentKey.trim()}>
              make active
            </button>
          )}
          {saved && (
            <span style={{ color: "var(--agent-done)", fontFamily: "var(--mono)", fontSize: 11 }}>
              ✓ saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SettingsPage({
  apiKeys,
  setApiKey,
  notifications,
  setNotifications,
  autosave,
  setAutosave,
  provider,
  setProvider,
  modelByProvider,
  setModel,
  onReset,
  onExport,
}: {
  apiKeys: Record<ProviderId, string>;
  setApiKey: (p: ProviderId, v: string) => void;
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  autosave: boolean;
  setAutosave: (v: boolean) => void;
  provider: ProviderId;
  setProvider: (p: ProviderId) => void;
  modelByProvider: Record<ProviderId, string>;
  setModel: (p: ProviderId, m: string) => void;
  onReset: () => void;
  onExport: () => void;
}) {
  const activeModel = modelByProvider[provider];
  return (
    <div className="page-content">
      <h1>Settings</h1>
      <div className="sub">Keys, preferences, and workspace configuration.</div>
      <div className="card">
        <h3>Providers &amp; keys</h3>
        <div className="desc">
          Bring your own key. Stored in this browser and sent only in the request body when the Orchestrator calls the provider.
        </div>
        {PROVIDER_ORDER.map((p) => (
          <KeyRow
            key={p}
            providerId={p}
            active={p === provider}
            currentKey={apiKeys[p] ?? ""}
            onSave={(v) => setApiKey(p, v)}
            onMakeActive={() => setProvider(p)}
          />
        ))}
      </div>
      <div className="card">
        <h3>Model</h3>
        <div className="desc">
          What the live Orchestrator calls. The other specialists are scripted for now.
        </div>
        <div className="setting-row">
          <div className="k">
            {PROVIDERS[provider].label} model
            <span className="s">
              Your {PROVIDERS[provider].label} account determines which of these you can actually use.
            </span>
          </div>
          <div className="v">
            <select value={activeModel} onChange={(e) => setModel(provider, e.target.value)}>
              {PROVIDERS[provider].models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
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
      </div>
      <div className="card">
        <h3>Export</h3>
        <div className="desc">Take the current session with you as readable markdown.</div>
        <div className="setting-row">
          <div className="k">
            Download session
            <span className="s">Chat, tool calls, and file diffs in chronological order.</span>
          </div>
          <div className="v">
            <div className="row">
              <button className="btn-prim" onClick={onExport}>
                download .md
              </button>
            </div>
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
