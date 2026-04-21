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

/**
 * Meditation timer variant — different screens, different data model,
 * different copy. Same shape so the UI reads naturally.
 */
export const MEDITATION_STREAM: ScriptedEntry[] = [
  { delayMs: 400, event: { type: "agent.state", agent: "orchestrator", state: "working", task: "routing request" } },
  { delayMs: 600, event: { type: "agent.message", agent: "orchestrator", text: "Meditation timer — clean shape. Product defines the screens and the streak logic, then Mobile and Backend work in parallel." } },

  { delayMs: 400, event: { type: "agent.state", agent: "product", state: "working", task: "writing app-spec.json" } },
  { delayMs: 700, event: { type: "tool.call", agent: "product", tool: "write_app_spec", args: { screens: ["Home", "Timer", "History"], dataModel: ["sessions"] }, state: "start" } },
  { delayMs: 900, event: { type: "agent.message", agent: "product", text: "Three screens: Home (streak + start button), Timer (breath-following circle), History (past sessions by day)." } },
  { delayMs: 500, event: { type: "file.diff", agent: "product", path: "workspace/app-spec.json", op: "create", diff: "+{\n+  \"screens\": [\"Home\", \"Timer\", \"History\"],\n+  \"dataModel\": {\n+    \"sessions\": [\"id\", \"user_id\", \"started_at\", \"duration_s\", \"mood\"]\n+  }\n+}" } },
  { delayMs: 200, event: { type: "tool.call", agent: "product", tool: "write_app_spec", args: {}, state: "end" } },
  { delayMs: 100, event: { type: "agent.state", agent: "product", state: "done", tokens: 1180, task: "spec committed" } },

  { delayMs: 300, event: { type: "agent.state", agent: "backend", state: "working", task: "migrations + streaks view" } },
  { delayMs: 400, event: { type: "agent.state", agent: "mobile", state: "working", task: "scaffolding Expo" } },
  { delayMs: 600, event: { type: "tool.call", agent: "backend", tool: "create_migration", args: { name: "001_sessions" }, state: "start" } },
  { delayMs: 700, event: { type: "file.diff", agent: "backend", path: "workspace/migrations/001_sessions.sql", op: "create", diff: "+create table sessions (\n+  id uuid primary key default gen_random_uuid(),\n+  user_id uuid references auth.users(id) on delete cascade,\n+  started_at timestamptz not null default now(),\n+  duration_s int not null,\n+  mood text check (mood in ('calm','ok','stressed'))\n+);" } },
  { delayMs: 200, event: { type: "tool.call", agent: "backend", tool: "create_migration", args: {}, state: "end" } },

  { delayMs: 400, event: { type: "tool.call", agent: "mobile", tool: "expo_init", args: { template: "expo-router" }, state: "start" } },
  { delayMs: 900, event: { type: "file.diff", agent: "mobile", path: "workspace/app/_layout.tsx", op: "create", diff: "+import { Stack } from 'expo-router';\n+\n+export default function RootLayout() {\n+  return <Stack screenOptions={{ headerShown: false }} />;\n+}" } },
  { delayMs: 300, event: { type: "tool.call", agent: "mobile", tool: "expo_init", args: {}, state: "end" } },

  { delayMs: 500, event: { type: "tool.call", agent: "backend", tool: "deploy_edge_function", args: { name: "compute_streak" }, state: "start" } },
  { delayMs: 700, event: { type: "file.diff", agent: "backend", path: "workspace/functions/compute_streak/index.ts", op: "create", diff: "+// Returns consecutive days ending today where the user logged a session.\n+export const handler = async (req) => {\n+  const { user_id } = await req.json();\n+  const { data } = await sb.rpc('streak_days', { uid: user_id });\n+  return new Response(JSON.stringify({ streak: data }));\n+};" } },
  { delayMs: 200, event: { type: "tool.call", agent: "backend", tool: "deploy_edge_function", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "agent.state", agent: "backend", state: "done", tokens: 2050, task: "schema + streak live" } },

  { delayMs: 400, event: { type: "tool.call", agent: "mobile", tool: "write_screen", args: { name: "Timer" }, state: "start" } },
  { delayMs: 800, event: { type: "file.diff", agent: "mobile", path: "workspace/app/timer.tsx", op: "create", diff: "+import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';\n+import { useEffect } from 'react';\n+\n+export default function Timer() {\n+  const scale = useSharedValue(1);\n+  useEffect(() => { scale.value = withTiming(1.35, { duration: 4000 }); }, []);\n+  return <Animated.View style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: '#f6f5f2' }} />;\n+}" } },
  { delayMs: 300, event: { type: "tool.call", agent: "mobile", tool: "write_screen", args: {}, state: "end" } },

  { delayMs: 400, event: { type: "agent.message", agent: "mobile", text: "Preview is up — the timer breathes on loop. Scan the QR to feel it on a real device." } },
  { delayMs: 300, event: { type: "preview.ready", url: "https://preview.example.dev/session-meditation" } },

  { delayMs: 600, event: { type: "agent.state", agent: "mobile", state: "done", tokens: 3650, task: "3 screens shipped" } },

  { delayMs: 400, event: { type: "agent.state", agent: "qa", state: "working", task: "typecheck + smoke" } },
  { delayMs: 700, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "start" } },
  { delayMs: 800, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "start" } },
  { delayMs: 900, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "end" } },
  { delayMs: 300, event: { type: "qa.report", pass: true, checks: { typecheck: { pass: true }, lint: { pass: true }, smoke: { pass: true, detail: "3 screens rendered" } } } },
  { delayMs: 200, event: { type: "agent.state", agent: "qa", state: "done", tokens: 460, task: "all checks pass" } },

  { delayMs: 300, event: { type: "agent.message", agent: "orchestrator", text: "Done. Tap to start a session — the streak bumps once you cross 3 minutes." } },
  { delayMs: 100, event: { type: "agent.state", agent: "orchestrator", state: "done", tokens: 590, task: "build complete" } },
];

/**
 * Photo journal variant — tab navigator, photos table, monthly-collage edge
 * function. Thematically distinct content and tool calls.
 */
export const PHOTO_JOURNAL_STREAM: ScriptedEntry[] = [
  { delayMs: 400, event: { type: "agent.state", agent: "orchestrator", state: "working", task: "routing request" } },
  { delayMs: 600, event: { type: "agent.message", agent: "orchestrator", text: "Photo journal with monthly collages. The collage is the interesting part — Backend will handle it as an edge function so Mobile stays thin." } },

  { delayMs: 400, event: { type: "agent.state", agent: "product", state: "working", task: "writing app-spec.json" } },
  { delayMs: 700, event: { type: "tool.call", agent: "product", tool: "write_app_spec", args: { screens: ["Feed", "Detail", "Months"], dataModel: ["photos"] }, state: "start" } },
  { delayMs: 900, event: { type: "agent.message", agent: "product", text: "Tab nav: Feed (chronological) and Months (collage grid). Detail screen for a single photo. Photos store uri + taken_at + optional caption." } },
  { delayMs: 500, event: { type: "file.diff", agent: "product", path: "workspace/app-spec.json", op: "create", diff: "+{\n+  \"nav\": \"tabs\",\n+  \"screens\": [\"Feed\", \"Detail\", \"Months\"],\n+  \"dataModel\": {\n+    \"photos\": [\"id\", \"user_id\", \"uri\", \"taken_at\", \"caption\", \"location\"]\n+  }\n+}" } },
  { delayMs: 200, event: { type: "tool.call", agent: "product", tool: "write_app_spec", args: {}, state: "end" } },
  { delayMs: 100, event: { type: "agent.state", agent: "product", state: "done", tokens: 1090, task: "spec committed" } },

  { delayMs: 300, event: { type: "agent.state", agent: "backend", state: "working", task: "photos table + storage" } },
  { delayMs: 400, event: { type: "agent.state", agent: "mobile", state: "working", task: "scaffolding Expo" } },
  { delayMs: 600, event: { type: "tool.call", agent: "backend", tool: "create_migration", args: { name: "001_photos" }, state: "start" } },
  { delayMs: 700, event: { type: "file.diff", agent: "backend", path: "workspace/migrations/001_photos.sql", op: "create", diff: "+create table photos (\n+  id uuid primary key default gen_random_uuid(),\n+  user_id uuid references auth.users(id),\n+  uri text not null,\n+  taken_at timestamptz not null,\n+  caption text,\n+  location jsonb\n+);\n+create index on photos (user_id, taken_at desc);" } },
  { delayMs: 200, event: { type: "tool.call", agent: "backend", tool: "create_migration", args: {}, state: "end" } },

  { delayMs: 400, event: { type: "tool.call", agent: "mobile", tool: "expo_init", args: { template: "expo-router-tabs" }, state: "start" } },
  { delayMs: 900, event: { type: "file.diff", agent: "mobile", path: "workspace/app/(tabs)/_layout.tsx", op: "create", diff: "+import { Tabs } from 'expo-router';\n+\n+export default function TabsLayout() {\n+  return (\n+    <Tabs>\n+      <Tabs.Screen name=\"feed\" options={{ title: 'Feed' }} />\n+      <Tabs.Screen name=\"months\" options={{ title: 'Months' }} />\n+    </Tabs>\n+  );\n+}" } },
  { delayMs: 300, event: { type: "tool.call", agent: "mobile", tool: "expo_init", args: {}, state: "end" } },

  { delayMs: 500, event: { type: "tool.call", agent: "backend", tool: "add_storage_bucket", args: { name: "photos", public: false }, state: "start" } },
  { delayMs: 500, event: { type: "tool.call", agent: "backend", tool: "add_storage_bucket", args: {}, state: "end" } },
  { delayMs: 400, event: { type: "tool.call", agent: "backend", tool: "deploy_edge_function", args: { name: "monthly_collage" }, state: "start" } },
  { delayMs: 700, event: { type: "file.diff", agent: "backend", path: "workspace/functions/monthly_collage/index.ts", op: "create", diff: "+// Builds a 3x3 collage for a given user/month from their 9 highest-rated photos.\n+export const handler = async (req) => {\n+  const { user_id, month } = await req.json();\n+  const photos = await fetchTopPhotos(user_id, month);\n+  const jpeg = await composeCollage(photos, { cols: 3, padding: 8 });\n+  return new Response(jpeg, { headers: { 'content-type': 'image/jpeg' } });\n+};" } },
  { delayMs: 200, event: { type: "tool.call", agent: "backend", tool: "deploy_edge_function", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "agent.state", agent: "backend", state: "done", tokens: 2280, task: "storage + collage live" } },

  { delayMs: 400, event: { type: "tool.call", agent: "mobile", tool: "write_screen", args: { name: "Feed" }, state: "start" } },
  { delayMs: 800, event: { type: "file.diff", agent: "mobile", path: "workspace/app/(tabs)/feed.tsx", op: "create", diff: "+import { FlatList, Image } from 'react-native';\n+import { usePhotos } from '@/hooks/usePhotos';\n+\n+export default function Feed() {\n+  const { photos } = usePhotos();\n+  return (\n+    <FlatList\n+      data={photos}\n+      renderItem={({ item }) => <Image source={{ uri: item.uri }} style={{ width: '100%', aspectRatio: 1 }} />}\n+    />\n+  );\n+}" } },
  { delayMs: 300, event: { type: "tool.call", agent: "mobile", tool: "write_screen", args: {}, state: "end" } },

  { delayMs: 400, event: { type: "agent.message", agent: "mobile", text: "Preview is up — Feed and Months tabs, Detail screen on tap. Collages are lazy-rendered by the edge function when you scroll into a new month." } },
  { delayMs: 300, event: { type: "preview.ready", url: "https://preview.example.dev/session-photos" } },

  { delayMs: 600, event: { type: "agent.state", agent: "mobile", state: "done", tokens: 4120, task: "tabs + 3 screens shipped" } },

  { delayMs: 400, event: { type: "agent.state", agent: "qa", state: "working", task: "typecheck + smoke" } },
  { delayMs: 700, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "start" } },
  { delayMs: 800, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "start" } },
  { delayMs: 900, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "end" } },
  { delayMs: 300, event: { type: "qa.report", pass: true, checks: { typecheck: { pass: true }, lint: { pass: true }, smoke: { pass: true, detail: "3 screens rendered" } } } },
  { delayMs: 200, event: { type: "agent.state", agent: "qa", state: "done", tokens: 510, task: "all checks pass" } },

  { delayMs: 300, event: { type: "agent.message", agent: "orchestrator", text: "Done. Start dropping photos in — the first monthly collage builds once you have 9 in a month." } },
  { delayMs: 100, event: { type: "agent.state", agent: "orchestrator", state: "done", tokens: 620, task: "build complete" } },
];

/**
 * Pick the right fixture stream based on the user's prompt and the scenario
 * tweak. qa-fail overrides everything — it always replays the todo-app failure
 * path so the error UX stays predictable.
 */
export function pickScript(prompt: string, scenario: "happy" | "qa-fail"): ScriptedEntry[] {
  if (scenario === "qa-fail") return QA_FAIL_STREAM;
  const p = prompt.toLowerCase();
  if (/meditat|mindful|breath/.test(p)) return MEDITATION_STREAM;
  if (/photo|journal|collage|gallery/.test(p)) return PHOTO_JOURNAL_STREAM;
  return SCRIPTED_STREAM;
}

/**
 * QA-failure variant — up to preview.ready it's identical to the happy path,
 * then QA's smoke test catches a runtime error in HomeScreen. The session
 * stops in an error state so the error UX is visible.
 */
export const QA_FAIL_STREAM: ScriptedEntry[] = [
  ...SCRIPTED_STREAM.slice(0, SCRIPTED_STREAM.length - 9),

  { delayMs: 400, event: { type: "agent.state", agent: "qa", state: "working", task: "typecheck + smoke" } },
  { delayMs: 700, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "start" } },
  { delayMs: 800, event: { type: "tool.call", agent: "qa", tool: "run_typecheck", args: {}, state: "end" } },
  { delayMs: 300, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: { count: 3 }, state: "start" } },
  { delayMs: 1200, event: { type: "tool.call", agent: "qa", tool: "smoke_screens", args: {}, state: "error", error: "HomeScreen threw: useLists is not a function" } },
  { delayMs: 300, event: { type: "qa.report", pass: false, checks: { typecheck: { pass: true }, lint: { pass: true }, smoke: { pass: false, detail: "HomeScreen threw on mount: useLists is not a function" } } } },
  { delayMs: 200, event: { type: "agent.state", agent: "qa", state: "error", tokens: 520, task: "1 check failed" } },

  { delayMs: 400, event: { type: "agent.message", agent: "orchestrator", text: "QA caught a runtime error in HomeScreen — the useLists import is missing. Mobile will need to revisit the hooks wiring before we can ship." } },
  { delayMs: 100, event: { type: "agent.state", agent: "orchestrator", state: "blocked", tokens: 680, task: "awaiting mobile retry" } },
];
