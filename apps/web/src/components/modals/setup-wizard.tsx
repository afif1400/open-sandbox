"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";

export function SetupWizard({ onComplete }: { onComplete: (key: string) => void }) {
  const [key, setKey] = useState("");
  const ok = key.trim().startsWith("sk-ant") && key.trim().length > 20;
  return (
    <div className="setup-ov">
      <div className="setup-card">
        <div className="eyebrow">
          <span className="step">STEP 01 / 02</span>
          <span>workspace setup</span>
        </div>
        <h2>Connect your key</h2>
        <p className="sub">Open Crew runs a crew of AI specialists on your own Anthropic key. You stay in control of costs and data.</p>
        <label>
          <div className="lbl">
            <span>Anthropic API key</span>
            <span className="req">required</span>
          </div>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-api03-…"
            type="password"
            autoFocus
          />
        </label>
        <div className="notice">
          <span className="ic">{Icon.lock}</span>
          <span>
            Stored in this browser only. Never transmitted. Revoke any time from your Anthropic console.
          </span>
        </div>
        <div className="actions">
          <button className="ghost" onClick={() => onComplete("sk-ant-demo-key-for-preview")}>
            try with demo key
          </button>
          <span className="spacer" />
          <button className="primary" disabled={!ok} onClick={() => onComplete(key.trim())}>
            continue →
          </button>
        </div>
      </div>
    </div>
  );
}
