export function fmtTs(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function relTime(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function diffLines(diff: string): Array<{ cls: "add" | "del" | "ctx"; text: string }> {
  return diff.split("\n").map((line) => {
    let cls: "add" | "del" | "ctx" = "ctx";
    if (line.startsWith("+")) cls = "add";
    else if (line.startsWith("-")) cls = "del";
    return { cls, text: line || "\u00A0" };
  });
}
