# Open Crew

> Ship mobile apps with a crew of AI specialists.

A browser-based builder where a team of specialist AI agents — orchestrator, product, mobile, backend, QA — spec, build, and test an Expo mobile app while you watch. Open-source, BYOK, self-hostable.

## Status

Early. The dashboard is real (Next.js 15 + React 19 + Tailwind v4), and every UI surface works end-to-end. The **Orchestrator now makes real LLM calls** via Vercel AI SDK against Anthropic, Google (Gemini), or Groq (open models on LPU hardware — Llama 3.3, DeepSeek-R1 distill, Llama 3.1 Instant) — pick a provider, paste a key, run a prompt, and watch the opening plan stream back. The four specialists (Product, Mobile, Backend, QA) remain scripted for now. Today you can:

- Pick a provider (Anthropic / Google / Groq) in the setup wizard, paste a key, and run a real Orchestrator turn
- Stream the live opening message (a `LIVE` badge appears on the thinking chip)
- Prompt the crew (todo, meditation, photo-journal are all wired with distinct scripted specialists)
- Watch agents transition states, emit tool calls, write file diffs, and ship a preview
- Pause / resume mid-stream, stop and restart, trigger a scripted QA-failure scenario
- Refresh the page — your session is persisted
- Tweak provider, model, accent, chat density, device, stream speed, and the scenario live
- Use ⌘K for the command palette, ⌘B for sidebar, ⌘⏎ to send, `?` for the full shortcut list

What you cannot yet do: actually have the _specialists_ write real code to a real sandbox. That's the next plan.

## Quickstart

Prereqs: [Bun](https://bun.sh) ≥ 1.2, Node ≥ 20.

```
git clone https://github.com/afif1400/open-sandbox
cd open-sandbox
bun install
bun --cwd apps/web run dev
```

Open http://localhost:3000 and, in the setup wizard, pick a provider and paste a real API key:

- **Anthropic** — [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) (`sk-ant-…`)
- **Google** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (`AIza…`)
- **Groq** — [console.groq.com/keys](https://console.groq.com/keys) (`gsk_…`)

Or click **try with demo key** to explore the fully scripted flow without hitting any provider. Describe an app in the chat; the Orchestrator replies live, and the specialists take it from there. Keys live in `localStorage` and are sent to the app's `/api/orchestrate` route in the request body for every call — not persisted server-side.

## Architecture

This monorepo currently contains one workspace.

```
apps/web/                     Next.js 15 dashboard (client-heavy SPA)
  app/                        App Router entrypoints + globals.css
    api/orchestrate/          Live Orchestrator route — POST { provider, model, apiKey, prompt }
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
      providers.ts            Anthropic / Google / Groq registry, models, key metadata
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
- **Direct API over CLI runtimes**. Agents drive LLMs through Vercel AI SDK (Orchestrator is live today), not via shelling out to Claude Code / Codex. This is a deliberate research bet on multi-agent coordination.
- **Multi-provider BYOK**. The Orchestrator speaks to Anthropic, Google, or Groq through `@ai-sdk/*` — the call site is identical across providers; only the factory import changes. Keys are per-provider and stored in `localStorage`.

## What's next

In rough order of usefulness:

1. **Real specialist agents** — the Orchestrator now runs live; the next step is Product, then Mobile / Backend / QA on AI SDK tool loops coordinating through shared spec files.
2. **Sandbox adapter** — Docker (local) and gVisor-backed Docker (production self-host) as first implementations.
3. **Real preview** — Expo Web from the sandbox proxied into the iframe.
4. **Supabase agent** — real migrations, RLS, and edge functions from the backend specialist.
5. **Session persistence** in Postgres, so sessions survive beyond a browser.
6. **Deploy targets** — GitHub push, Expo EAS build.
7. **Evaluation harness** — benchmark tasks for agent-built apps (separate publishable artifact).

## License

[MIT](./LICENSE). Do what you want; don't sue.
