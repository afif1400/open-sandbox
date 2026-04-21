import type { ScriptedEntry } from "@/types/events";

export const SCRIPTED_STREAM: ScriptedEntry[] = [
  { delayMs: 400, event: { type: "agent.state", agent: "orchestrator", state: "working", task: "routing request" } },
  { delayMs: 600, event: { type: "agent.message", agent: "orchestrator", text: "Got it. I'll break this into four parallel tracks: Product will spec the screens and data model, Backend sets up migrations and RLS, Mobile scaffolds the Expo app, and QA validates at the end." } },
  { delayMs: 800, event: { type: "agent.message", agent: "orchestrator", text: "Starting Product first so Mobile and Backend have a spec to work from." } },

  { delayMs: 400, event: { type: "agent.state", agent: "product", state: "working", task: "writing app-spec.json" } },
  { delayMs: 700, event: { type: "tool.call", agent: "product", tool: "write_app_spec", args: { screens: ["Home", "ListDetail", "AddTodo"], dataModel: ["lists", "todos"] }, state: "start" } },
  { delayMs: 900, event: { type: "agent.message", agent: "product", text: "Three screens, two tables. Todos have priority + due date. Lists are shareable later but single-user for v1." } },
  { delayMs: 500, event: { type: "file.diff", agent: "product", path: "workspace/app-spec.json", op: "create", diff: "+{\n+  \"screens\": [\"Home\", \"ListDetail\", \"AddTodo\"],\n+  \"dataModel\": {\n+    \"lists\": [\"id\", \"title\", \"created_at\"],\n+    \"todos\": [\"id\", \"list_id\", \"title\", \"done\", \"priority\", \"due\"]\n+  }\n+}" } },
  { delayMs: 200, event: { type: "tool.call", agent: "product", tool: "write_app_spec", args: {}, state: "end" } },
  { delayMs: 100, event: { type: "agent.state", agent: "product", state: "done", tokens: 1240, task: "spec committed" } },

  { delayMs: 300, event: { type: "agent.state", agent: "backend", state: "working", task: "migrations + RLS" } },
  { delayMs: 400, event: { type: "agent.state", agent: "mobile", state: "working", task: "scaffolding Expo" } },
  { delayMs: 600, event: { type: "tool.call", agent: "backend", tool: "create_migration", args: { name: "001_lists_todos" }, state: "start" } },
  { delayMs: 700, event: { type: "file.diff", agent: "backend", path: "workspace/migrations/001_lists_todos.sql", op: "create", diff: "+create table lists (\n+  id uuid primary key default gen_random_uuid(),\n+  title text not null,\n+  created_at timestamptz default now()\n+);\n+\n+create table todos (\n+  id uuid primary key default gen_random_uuid(),\n+  list_id uuid references lists(id) on delete cascade,\n+  title text not null,\n+  done boolean default false,\n+  priority int default 0\n+);" } },
  { delayMs: 200, event: { type: "tool.call", agent: "backend", tool: "create_migration", args: {}, state: "end" } },

  { delayMs: 400, event: { type: "tool.call", agent: "mobile", tool: "expo_init", args: { template: "expo-router" }, state: "start" } },
  { delayMs: 900, event: { type: "file.diff", agent: "mobile", path: "workspace/app/_layout.tsx", op: "create", diff: "+import { Stack } from 'expo-router';\n+\n+export default function RootLayout() {\n+  return (\n+    <Stack screenOptions={{ headerShown: false }}>\n+      <Stack.Screen name=\"index\" />\n+      <Stack.Screen name=\"list/[id]\" />\n+    </Stack>\n+  );\n+}" } },
  { delayMs: 300, event: { type: "tool.call", agent: "mobile", tool: "expo_init", args: {}, state: "end" } },

  { delayMs: 500, event: { type: "tool.call", agent: "backend", tool: "apply_rls", args: { tables: ["lists", "todos"] }, state: "start" } },
  { delayMs: 600, event: { type: "file.diff", agent: "backend", path: "workspace/migrations/002_rls.sql", op: "create", diff: "+alter table lists enable row level security;\n+alter table todos enable row level security;\n+\n+create policy \"own lists\" on lists\n+  for all using (auth.uid() = user_id);" } },
  { delayMs: 200, event: { type: "tool.call", agent: "backend", tool: "apply_rls", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "agent.state", agent: "backend", state: "done", tokens: 2100, task: "schema live" } },

  { delayMs: 400, event: { type: "tool.call", agent: "mobile", tool: "write_screen", args: { name: "HomeScreen" }, state: "start" } },
  { delayMs: 800, event: { type: "file.diff", agent: "mobile", path: "workspace/app/index.tsx", op: "create", diff: "+import { FlatList, Text, View } from 'react-native';\n+import { useLists } from '@/hooks/useLists';\n+\n+export default function HomeScreen() {\n+  const { lists } = useLists();\n+  return (\n+    <View style={{ flex: 1, padding: 16 }}>\n+      <Text style={{ fontSize: 28, fontWeight: '700' }}>Today</Text>\n+      <FlatList data={lists} renderItem={ListRow} />\n+    </View>\n+  );\n+}" } },
  { delayMs: 300, event: { type: "tool.call", agent: "mobile", tool: "write_screen", args: {}, state: "end" } },

  { delayMs: 400, event: { type: "agent.message", agent: "mobile", text: "Expo Web preview is up. You can toggle the phone frame or scan the QR to open it on your device through Expo Go." } },
  { delayMs: 300, event: { type: "preview.ready", url: "https://preview.example.dev/session-demo" } },

  { delayMs: 600, event: { type: "agent.state", agent: "mobile", state: "done", tokens: 3890, task: "3 screens shipped" } },

  { delayMs: 400, event: { type: "agent.state", agent: "qa", state: "working", task: "typecheck + smoke" } },
  { delayMs: 700, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "start" } },
  { delayMs: 800, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "start" } },
  { delayMs: 900, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "end" } },
  { delayMs: 300, event: { type: "qa.report", pass: true, checks: { typecheck: { pass: true }, lint: { pass: true }, smoke: { pass: true, detail: "3 screens rendered" } } } },
  { delayMs: 200, event: { type: "agent.state", agent: "qa", state: "done", tokens: 480, task: "all checks pass" } },

  { delayMs: 300, event: { type: "agent.message", agent: "orchestrator", text: "Done. The app is live in the preview — you can see lists, add todos, and mark them complete. What would you like to change?" } },
  { delayMs: 100, event: { type: "agent.state", agent: "orchestrator", state: "done", tokens: 640, task: "build complete" } },
];
