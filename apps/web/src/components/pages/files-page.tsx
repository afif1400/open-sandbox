import type { DiffEntry } from "@/types/events";
import { FilesTab } from "@/components/inspector/files-tab";

export function FilesPage({ diffEvents }: { diffEvents: DiffEntry[] }) {
  return (
    <div className="page-content">
      <h1>Workspace</h1>
      <div className="sub">
        Files generated in the current session. Everything here is sandboxed — deploy pushes to your repo.
      </div>
      <div className="card" style={{ padding: 0 }}>
        <FilesTab diffEvents={diffEvents} />
      </div>
    </div>
  );
}
