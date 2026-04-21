"use client";

export function SessionsPage({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="page-content">
      <h1>Sessions</h1>
      <div className="sub">Every build is an isolated session. Old ones live here; new ones start from the Dashboard.</div>
      <div
        style={{
          border: "1px dashed var(--border)",
          borderRadius: "var(--r-lg)",
          padding: "48px 24px",
          textAlign: "center",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--bg-elev)",
            marginBottom: 16,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "var(--agent-idle)",
              display: "inline-block",
            }}
          />
        </div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>No sessions yet</h3>
        <p style={{ margin: "0 auto 20px", maxWidth: 360, color: "var(--text-2)", fontSize: 13 }}>
          Brief the crew from the Dashboard and your first session appears here.
        </p>
        <button className="btn-prim" onClick={() => onOpen("dashboard")}>
          go to dashboard
        </button>
      </div>
    </div>
  );
}
