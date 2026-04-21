import type { AgentName, DiffOp } from "@/types/events";
import { diffLines } from "@/lib/fmt";

export function DiffCard({
  agent: _agent,
  path,
  op,
  diff,
}: {
  agent: AgentName;
  path: string;
  op: DiffOp;
  diff: string;
}) {
  const lines = diffLines(diff);
  return (
    <details className="diff-card">
      <summary>
        <span className={`op ${op}`}>{op}</span>
        <span className="path">{path}</span>
        <span className="caret">›</span>
      </summary>
      <div className="diff-body">
        {lines.map((l, i) => (
          <span key={i} className={`dl ${l.cls}`}>
            {l.text}
          </span>
        ))}
      </div>
    </details>
  );
}
