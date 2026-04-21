export const ROUTES = ["dashboard", "sessions", "agents", "files", "docs", "settings"] as const;
export type Route = (typeof ROUTES)[number];

export const ROUTE_TITLE: Record<Route, string> = {
  dashboard: "Dashboard",
  sessions: "Sessions",
  agents: "Agents",
  files: "Workspace",
  docs: "Docs",
  settings: "Settings",
};
