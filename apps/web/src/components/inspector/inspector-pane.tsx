"use client";
import type { AgentInfo, AgentName, DiffEntry, FeedEntry } from "@/types/events";
import { AgentsTab } from "./agents-tab";
import { ActivityTab, type ActivityFilter } from "./activity-tab";
import { FilesTab } from "./files-tab";

export type InspectorTab = "agents" | "activity" | "files";

export function InspectorPane({
  agents,
  feed,
  diffEvents,
  tab,
  setTab,
  filter,
  setFilter,
}: {
  agents: Record<AgentName, AgentInfo>;
  feed: FeedEntry[];
  diffEvents: DiffEntry[];
  tab: InspectorTab;
  setTab: (t: InspectorTab) => void;
  filter: ActivityFilter;
  setFilter: (f: ActivityFilter) => void;
}) {
  const working = Object.values(agents).filter((a) => a.state === "working").length;
  return (
    <section className="pane" aria-label="Inspector">
      <div className="insp-tabs">
        <button className={tab === "agents" ? "on" : ""} onClick={() => setTab("agents")}>
          Agents {working > 0 && <span className="badge">{working}</span>}
        </button>
        <button className={tab === "activity" ? "on" : ""} onClick={() => setTab("activity")}>
          Activity {feed.length > 0 && <span className="badge">{feed.length}</span>}
        </button>
        <button className={tab === "files" ? "on" : ""} onClick={() => setTab("files")}>
          Files {diffEvents.length > 0 && <span className="badge">{diffEvents.length}</span>}
        </button>
      </div>
      <div className="insp-body">
        {tab === "agents" && <AgentsTab agents={agents} />}
        {tab === "activity" && <ActivityTab feed={feed} filter={filter} setFilter={setFilter} />}
        {tab === "files" && <FilesTab diffEvents={diffEvents} />}
      </div>
    </section>
  );
}
