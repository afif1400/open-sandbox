import type { ReactNode } from "react";

export function PhoneFrame({ variant, children }: { variant: "ios" | "android"; children: ReactNode }) {
  return (
    <div className={`phone ${variant}`}>
      <div className="notch" />
      <div className="screen">{children}</div>
    </div>
  );
}
