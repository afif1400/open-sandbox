import type { AgentName } from "@/types/events";
import { AGENT_LABEL } from "@/types/events";
import { fmtTs } from "@/lib/fmt";

const AGENT_HUE: Record<AgentName, number> = {
  orchestrator: 70,
  product: 320,
  mobile: 230,
  backend: 180,
  qa: 155,
};

export type BubbleProps =
  | { kind: "user"; text: string; ts: number; live?: boolean }
  | { kind: "agent"; agent: AgentName; text: string; ts: number; live?: boolean };

export function Bubble(props: BubbleProps) {
  if (props.kind === "user") {
    return (
      <div className="turn user">
        <div className="meta">
          <span>you</span>
          <span className="ts">{fmtTs(props.ts)}</span>
        </div>
        <div className="bubble user">{props.text}</div>
      </div>
    );
  }
  const isOrch = props.agent === "orchestrator";
  return (
    <div className="turn agent">
      <div className="meta">
        <span className="chip">
          <span className="sq" style={{ background: `oklch(74% 0.14 ${AGENT_HUE[props.agent]})` }} />
          {AGENT_LABEL[props.agent]}
        </span>
        {props.live && <span className="chip live">● LIVE</span>}
        <span className="ts">{fmtTs(props.ts)}</span>
      </div>
      <div className={`bubble agent ${isOrch ? "orch" : ""}`}>{props.text}</div>
    </div>
  );
}
