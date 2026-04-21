import type { ReactElement } from "react";

export function QRCodeSvg({ value, size = 160 }: { value: string; size?: number }) {
  const cells = 29;
  const cs = size / cells;

  const hash = (x: number, y: number): number => {
    let h = 2166136261;
    h ^= x * 16777619;
    h = Math.imul(h, 16777619);
    h ^= y * 2654435761;
    h = Math.imul(h, 16777619);
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) % 100;
  };

  const isFinder = (x: number, y: number): boolean => {
    const block = (cx: number, cy: number) =>
      x >= cx &&
      x < cx + 7 &&
      y >= cy &&
      y < cy + 7 &&
      !(
        x > cx &&
        x < cx + 6 &&
        y > cy &&
        y < cy + 6 &&
        !(x >= cx + 2 && x < cx + 5 && y >= cy + 2 && y < cy + 5)
      );
    return block(0, 0) || block(cells - 7, 0) || block(0, cells - 7);
  };

  const inFinder = (x: number, y: number): boolean =>
    (x < 8 && y < 8) || (x >= cells - 8 && y < 8) || (x < 8 && y >= cells - 8);

  const rects: ReactElement[] = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const fill = inFinder(x, y) ? isFinder(x, y) : hash(x, y) < 48;
      if (fill) {
        rects.push(<rect key={`${x}-${y}`} x={x * cs} y={y * cs} width={cs} height={cs} fill="#1a1a1a" />);
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#f6f5f2" />
      {rects}
    </svg>
  );
}
