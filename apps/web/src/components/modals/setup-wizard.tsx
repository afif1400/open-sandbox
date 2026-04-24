"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { PROVIDER_ORDER, PROVIDERS, type ProviderId } from "@/lib/providers";

export function SetupWizard({
  onComplete,
}: {
  onComplete: (provider: ProviderId, key: string) => void;
}) {
  const [provider, setProvider] = useState<ProviderId>("anthropic");
  const [key, setKey] = useState("");
  const trimmed = key.trim();
  const info = PROVIDERS[provider];
  const ok = trimmed.length >= 12;
  return (
    <div className="setup-ov">
      <div className="setup-card">
        <div className="eyebrow">
          <span className="step">STEP 01 / 02</span>
          <span>workspace setup</span>
        </div>
        <h2>Connect your key</h2>
        <p className="sub">
          Open Crew runs a crew of AI specialists on your own API key. You stay in control of costs and data.
        </p>
        <div className="provider-picker">
          {PROVIDER_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              className={`p-chip ${provider === p ? "on" : ""}`}
              onClick={() => {
                setProvider(p);
                setKey("");
              }}
            >
              {PROVIDERS[p].label}
            </button>
          ))}
        </div>
        <label>
          <div className="lbl">
            <span>{info.label} API key</span>
            <span className="req">required</span>
          </div>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={info.keyPlaceholder}
            type="password"
            autoFocus
          />
          <div className="help">
            Get one at <span className="mono">{info.keyHint}</span>
          </div>
        </label>
        <div className="notice">
          <span className="ic">{Icon.lock}</span>
          <span>
            Stored in this browser only. Sent to our server only in the request body when an agent calls your provider.
          </span>
        </div>
        <div className="actions">
          <button
            className="ghost"
            onClick={() => onComplete(provider, `${provider}-demo-key-for-preview`)}
          >
            try with demo key
          </button>
          <span className="spacer" />
          <button className="primary" disabled={!ok} onClick={() => onComplete(provider, trimmed)}>
            continue →
          </button>
        </div>
      </div>
    </div>
  );
}
