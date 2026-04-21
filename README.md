# Open Crew

> Ship mobile apps with a crew of AI specialists.

A browser-based builder where a team of specialist AI agents — orchestrator, product, mobile, backend, QA — spec, build, and test an Expo mobile app while you watch. Open-source, BYOK, self-hostable.

## Status

Early. The dashboard is real (Next.js 15 + React 19 + Tailwind v4), and every UI surface works end-to-end against a scripted event stream. The **real agent backend is not yet connected** — it's the subject of a separate design doc and implementation plan. Today you can:

- Walk through the setup wizard (BYOK into an iron-session cookie)
- Prompt the crew (todo, meditation, photo-journal are all wired with distinct scripted streams)
- Watch agents transition states, emit tool calls, write file diffs, and ship a preview
- Pause / resume mid-stream, stop and restart, trigger a scripted QA-failure scenario
- Refresh the page — your session is persisted
- Tweak accent, chat density, device, stream speed, and the scenario live
- Use ⌘K for the command palette, ⌘B for sidebar, ⌘⏎ to send, `?` for the full shortcut list

What you cannot yet do: actually run a real LLM-driven agent that writes real code to a real sandbox. That's Plan #3 in `docs/superpowers/plans/` (untracked in git, but on disk).

## Quickstart

Prereqs: [Bun](https://bun.sh) ≥ 1.2, Node ≥ 20.

```
git clone https://github.com/afif1400/open-sandbox
cd open-sandbox
bun install
bun --cwd apps/web run dev
```

Open http://localhost:3000 and paste any string that starts with `sk-ant-` (20+ chars) into the setup wizard, or click **try with demo key**. Describe an app in the chat; the crew takes it from there.

## Architecture

This monorepo currently contains one workspace.

```
apps/web/                     Next.js 15 dashboard (client-heavy SPA)
  app/                        App Router entrypoints + globals.css
  src/
    components/
      app-root.tsx            Root client component; holds all session state
      shell/                  sidebar, topbar, route types
      chat/                   bubble, tool card, diff card, chat pane
      preview/                phone frame, mock todo app, QR, preview pane
      inspector/              agents tab, activity tab, files tab, pane
      modals/                 setup wizard, palette, tweaks, shortcuts help
      pages/                  sessions, agents, files, docs, settings
      icons.tsx               hand-rolled SVG icons
    lib/
      scripted-stream.ts      the 3 demo fixtures + pickScript dispatcher
      fmt.ts                  time / diff formatters
    types/
      events.ts               Zod/TS types for the crew event stream
```

Full architecture spec lives in `docs/superpowers/specs/` (untracked; local only).

## Design choices

- **Pixel-faithful port** of a [Claude Design](https://claude.ai/design) prototype. The prototype itself is in `.playwright-mcp/` artifacts; the CSS here is a near-verbatim port in a production-shaped codebase.
- **Voice**: calm / technical. Every label is lowercase monospace. Every agent description is a single sentence. No hype.
- **Theme**: OKLCH warm-black with a single amber accent. `prefers-reduced-motion` respected.
- **No Zustand / TanStack**. Session state is plain `useState` + localStorage. The app is modest enough that adding a state library would be premature.
- **Direct API over CLI runtimes**. When the real backend lands, agents will drive LLMs through Vercel AI SDK, not via shelling out to Claude Code / Codex. This is a deliberate research bet on multi-agent coordination.

## What's next

In rough order of usefulness:

1. **Real orchestrator + specialist agents** — AI SDK tool loops, one per role, coordinating through shared spec files.
2. **Sandbox adapter** — Docker (local) and gVisor-backed Docker (production self-host) as first implementations.
3. **Real preview** — Expo Web from the sandbox proxied into the iframe.
4. **Supabase agent** — real migrations, RLS, and edge functions from the backend specialist.
5. **Session persistence** in Postgres, so sessions survive beyond a browser.
6. **Deploy targets** — GitHub push, Expo EAS build.
7. **Evaluation harness** — benchmark tasks for agent-built apps (separate publishable artifact).

## License

[MIT](./LICENSE). Do what you want; don't sue.
