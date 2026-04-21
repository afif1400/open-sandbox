const NAV = [
  { id: "getting-started", t: "Getting started" },
  { id: "crew", t: "The crew" },
  { id: "runtime", t: "Session runtime" },
  { id: "deploy", t: "Deploy targets" },
  { id: "events", t: "Events & webhooks" },
  { id: "billing", t: "Team & billing" },
];

export function DocsPage() {
  return (
    <div className="page-content">
      <h1>Docs</h1>
      <div className="sub">How the crew works, and how to steer it.</div>

      <div className="docs-layout">
        <nav className="docs-toc" aria-label="Docs navigation">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              {n.t}
            </a>
          ))}
        </nav>

        <article className="docs-prose">
          <section id="getting-started" className="card">
            <h2>Getting started</h2>
            <p>
              Open Crew runs locally in Docker. Everything stateful lives in Postgres, the sandboxes run in their own
              containers, and the dashboard talks to everything through a single Next.js app.
            </p>
            <pre>
              <code>{`git clone https://github.com/you/open-sandbox
cd open-sandbox
bun install
docker compose up`}</code>
            </pre>
            <p>
              Visit <span className="mono">http://localhost:3000</span>, paste your Anthropic key in the setup wizard,
              and describe an app. The first build takes about a minute end-to-end; subsequent runs reuse cached
              sandbox images.
            </p>
            <p className="note">
              Open Crew is BYOK. Your Anthropic key lives in an HTTP-only session cookie on your own server — it never
              leaves it.
            </p>
          </section>

          <section id="crew" className="card">
            <h2>The crew</h2>
            <p>
              Five specialists, each with its own prompt, tools, and default model. They coordinate through shared
              files in the sandbox (<span className="mono">app-spec.json</span>, <span className="mono">backend-spec.json</span>,
              <span className="mono"> qa-report.json</span>) — not shared memory.
            </p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Owns</th>
                    <th>Model</th>
                    <th>Tokens / run</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Orchestrator</td>
                    <td>Decomposes the ask; routes work</td>
                    <td>Sonnet</td>
                    <td>~640</td>
                  </tr>
                  <tr>
                    <td>Product</td>
                    <td>Screens, data model, flows</td>
                    <td>Sonnet</td>
                    <td>~1,200</td>
                  </tr>
                  <tr>
                    <td>Mobile</td>
                    <td>Expo / React Native code</td>
                    <td>Sonnet</td>
                    <td>~3,800</td>
                  </tr>
                  <tr>
                    <td>Backend</td>
                    <td>Supabase migrations, RLS, edge functions</td>
                    <td>Sonnet</td>
                    <td>~2,100</td>
                  </tr>
                  <tr>
                    <td>QA</td>
                    <td>Typecheck, lint, smoke</td>
                    <td>Haiku</td>
                    <td>~500</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Token counts are rough averages for the scripted demo. Real runs depend on the complexity of your prompt
              and the chosen model tier.
            </p>
          </section>

          <section id="runtime" className="card">
            <h2>Session runtime</h2>
            <p>
              Each build gets its own sandbox. Which kind depends on how you deploy Open Crew:
            </p>
            <ul>
              <li>
                <strong>Local dev</strong> — plain Docker. Fast, low-ceremony. Single-user on your own machine.
              </li>
              <li>
                <strong>Production self-host</strong> — gVisor-backed Docker (<span className="mono">runsc</span>).
                Kernel-level isolation without KVM. Works on any Linux VM.
              </li>
              <li>
                <strong>Public SaaS / regulated</strong> — Firecracker microVMs via E2B or a DIY fleet. Full hypervisor
                boundary per tenant.
              </li>
            </ul>
            <p>
              Every sandbox runs non-root, read-only rootfs, dropped caps, seccomp allowlist, CPU/RAM/PID quotas, and a
              hard idle-kill. Outbound traffic goes through an egress allowlist — npm, Supabase, Expo, GitHub, your
              LLM provider. Nothing else.
            </p>
            <p>
              Sandboxes are destroyed when a session ends. Source of truth for your build is the workspace snapshot in
              Postgres, so a crashed container doesn't lose work.
            </p>
          </section>

          <section id="deploy" className="card">
            <h2>Deploy targets</h2>
            <p>
              Once the crew ships a passing build, you can ship it further. Currently shipped:
            </p>
            <ul>
              <li>
                <strong>Download repo</strong> — grab the generated Expo project as a zip.
              </li>
              <li>
                <strong>GitHub push</strong> — commit the session to a new or existing repo.
              </li>
            </ul>
            <p>On the roadmap:</p>
            <ul>
              <li>
                <strong>Expo EAS Build</strong> — signed iOS / Android artefacts, TestFlight + Play submission.
              </li>
              <li>
                <strong>Your own Docker host</strong> — push the generated backend container to any target.
              </li>
            </ul>
          </section>

          <section id="events" className="card">
            <h2>Events &amp; webhooks</h2>
            <p>
              The dashboard is just a subscriber. Everything the crew does is emitted as a typed SSE stream you can tap
              from anywhere — CI, Slack, your own tools.
            </p>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>When it fires</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="mono">agent.state</span></td>
                    <td>Idle → working → done / blocked / error</td>
                  </tr>
                  <tr>
                    <td><span className="mono">agent.message</span></td>
                    <td>Natural-language progress from an agent</td>
                  </tr>
                  <tr>
                    <td><span className="mono">tool.call</span></td>
                    <td>Tool invoked — start / end / error</td>
                  </tr>
                  <tr>
                    <td><span className="mono">file.diff</span></td>
                    <td>File created, modified, or deleted, with diff</td>
                  </tr>
                  <tr>
                    <td><span className="mono">preview.ready</span></td>
                    <td>Expo dev server is serving the app</td>
                  </tr>
                  <tr>
                    <td><span className="mono">qa.report</span></td>
                    <td>Typecheck / lint / smoke results, pass or fail</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <pre>
              <code>{`curl -N https://your-open-crew/api/session/\${id}/events \\
  -H 'Authorization: Bearer \${token}'`}</code>
            </pre>
          </section>

          <section id="billing" className="card">
            <h2>Team &amp; billing</h2>
            <p>
              Open Crew is BYOK. Every agent call goes against your own Anthropic account; costs show up on your
              Anthropic bill. Open Crew itself charges nothing and never sees your tokens.
            </p>
            <p>Still to come:</p>
            <ul>
              <li>Multi-seat support with per-seat audit logs.</li>
              <li>Per-project rate limits and daily cost caps.</li>
              <li>Team-level usage dashboards on top of Anthropic's API.</li>
            </ul>
            <p className="note">
              If you're running Open Crew for a team, the self-hosted deployment gives each member their own session +
              their own key. No shared compute, no shared spend.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
