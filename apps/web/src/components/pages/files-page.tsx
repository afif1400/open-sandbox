import type { DiffEntry } from "@/types/events";
import { FilesTab } from "@/components/inspector/files-tab";

export function FilesPage({
  diffEvents,
  onGoToDashboard,
}: {
  diffEvents: DiffEntry[];
  onGoToDashboard?: () => void;
}) {
  const empty = diffEvents.length === 0;

  return (
    <div className="page-content">
      <h1>Workspace</h1>
      <div className="sub">
        Every file the crew creates or modifies in this session. Destroyed with the sandbox; a fresh copy lives in
        Postgres.
      </div>
      {empty ? (
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
          <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>No files yet</h3>
          <p style={{ margin: "0 auto 20px", maxWidth: 380, color: "var(--text-2)", fontSize: 13 }}>
            Brief the crew from the Dashboard. Every file they create or change shows up here as it lands.
          </p>
          {onGoToDashboard && (
            <button className="btn-prim" onClick={onGoToDashboard}>
              go to dashboard
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <FilesTab diffEvents={diffEvents} />
        </div>
      )}
    </div>
  );
}
