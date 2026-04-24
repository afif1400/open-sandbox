"use client";

import { PROVIDER_ORDER, PROVIDERS, type ProviderId, defaultModelByProvider } from "@/lib/providers";

export type Tweaks = {
  chatDensity: "compact" | "comfortable" | "spacious";
  defaultDevice: "ios" | "android";
  accent: "amber" | "mint" | "iris";
  streamSpeed: "0.5" | "1" | "2" | "4" | "8";
  scenario: "happy" | "qa-fail";
  provider: ProviderId;
  modelByProvider: Record<ProviderId, string>;
  theme: "dark" | "light";
};

export const DEFAULT_TWEAKS: Tweaks = {
  chatDensity: "comfortable",
  defaultDevice: "android",
  accent: "amber",
  streamSpeed: "1",
  scenario: "happy",
  provider: "anthropic",
  modelByProvider: defaultModelByProvider(),
  theme: "dark",
};

export const ACCENTS: Record<Tweaks["accent"], { brand: string; ink: string }> = {
  amber: { brand: "oklch(80% 0.14 70)", ink: "oklch(18% 0.02 70)" },
  mint: { brand: "oklch(80% 0.14 160)", ink: "oklch(18% 0.02 160)" },
  iris: { brand: "oklch(80% 0.14 270)", ink: "oklch(18% 0.02 270)" },
};

export function TweaksPanel({
  tweaks,
  setTweak,
  onClose,
}: {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
  onClose: () => void;
}) {
  const activeModel = tweaks.modelByProvider[tweaks.provider];
  const providerModels = PROVIDERS[tweaks.provider].models;
  return (
    <div className="tweaks-panel">
      <h3>
        <span className="dot" />
        Tweaks
        <span className="x" onClick={onClose}>
          ✕
        </span>
      </h3>
      <div className="grp">
        <div className="lbl">Chat density</div>
        <div className="opts">
          {(["compact", "comfortable", "spacious"] as const).map((v) => (
            <button
              key={v}
              className={tweaks.chatDensity === v ? "on" : ""}
              onClick={() => setTweak("chatDensity", v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Default device</div>
        <div className="opts">
          {(["ios", "android"] as const).map((v) => (
            <button
              key={v}
              className={tweaks.defaultDevice === v ? "on" : ""}
              onClick={() => setTweak("defaultDevice", v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Accent</div>
        <div className="opts">
          {(["amber", "mint", "iris"] as const).map((v) => (
            <button key={v} className={tweaks.accent === v ? "on" : ""} onClick={() => setTweak("accent", v)}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Stream speed</div>
        <div className="opts">
          {(["0.5", "1", "2", "4", "8"] as const).map((v) => (
            <button
              key={v}
              className={tweaks.streamSpeed === v ? "on" : ""}
              onClick={() => setTweak("streamSpeed", v)}
            >
              {v}×
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Scenario</div>
        <div className="opts">
          {(
            [
              ["happy", "happy path"],
              ["qa-fail", "qa failure"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              className={tweaks.scenario === v ? "on" : ""}
              onClick={() => setTweak("scenario", v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Provider</div>
        <div className="opts">
          {PROVIDER_ORDER.map((p) => (
            <button
              key={p}
              className={tweaks.provider === p ? "on" : ""}
              onClick={() => setTweak("provider", p)}
            >
              {PROVIDERS[p].label}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Model</div>
        <div className="opts">
          {providerModels.map((m) => (
            <button
              key={m.id}
              className={activeModel === m.id ? "on" : ""}
              onClick={() =>
                setTweak("modelByProvider", { ...tweaks.modelByProvider, [tweaks.provider]: m.id })
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grp">
        <div className="lbl">Theme</div>
        <div className="opts">
          {(["dark", "light"] as const).map((v) => (
            <button
              key={v}
              className={tweaks.theme === v ? "on" : ""}
              onClick={() => setTweak("theme", v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
