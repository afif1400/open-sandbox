"use client";
import { Icon } from "@/components/icons";
import { PhoneFrame } from "./phone-frame";
import { MockTodoApp } from "./mock-todo-app";
import { QRCodeSvg } from "./qr-code-svg";

export type Device = "ios" | "android";
export type PreviewMode = "web" | "qr";

export function PreviewPane({
  previewUrl,
  device,
  setDevice,
  mode,
  setMode,
  working,
}: {
  previewUrl: string | null;
  device: Device;
  setDevice: (d: Device) => void;
  mode: PreviewMode;
  setMode: (m: PreviewMode) => void;
  working: number;
}) {
  return (
    <section className="pane" aria-label="Preview">
      <div className="preview-topbar">
        <div className="seg">
          <button className={device === "ios" ? "on" : ""} onClick={() => setDevice("ios")}>
            iPhone
          </button>
          <button className={device === "android" ? "on" : ""} onClick={() => setDevice("android")}>
            Android
          </button>
        </div>
        <div className="seg">
          <button className={mode === "web" ? "on" : ""} onClick={() => setMode("web")}>
            Preview
          </button>
          <button className={mode === "qr" ? "on" : ""} onClick={() => setMode("qr")}>
            Device QR
          </button>
        </div>
        <div className="url-bar">
          <span className="lock">{Icon.lock}</span>
          <span className="u">{previewUrl || "waiting for first build…"}</span>
        </div>
      </div>
      <div className="preview-body">
        <div className="preview-meta">
          <span>
            <span className={`m-dot ${previewUrl ? "" : "idle"}`} />
            {previewUrl ? "connected" : "waiting"}
          </span>
          <span>expo · metro 0.80</span>
          <span>{previewUrl ? "bundled in 4.2s" : working ? `${working} working…` : "idle"}</span>
        </div>
        {mode === "qr" && previewUrl ? (
          <div className="qr-wrap">
            <div className="qr-box">
              <QRCodeSvg value={previewUrl} size={160} />
            </div>
            <p>
              Open <span className="mono">Expo Go</span> and scan to launch natively.
            </p>
            <span className="url">{previewUrl}</span>
          </div>
        ) : (
          <PhoneFrame variant={device}>
            {previewUrl ? (
              <MockTodoApp />
            ) : (
              <div className="waiting">
                <div className="spinner" />
                <span>
                  {working > 0
                    ? `${working} agent${working > 1 ? "s" : ""} working…`
                    : "waiting for first build"}
                </span>
              </div>
            )}
          </PhoneFrame>
        )}
      </div>
    </section>
  );
}
