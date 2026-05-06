import type { PropsWithChildren } from "react";

export function AlarmBanner({ children }: PropsWithChildren) {
  return (
    <div
      className="rounded px-3 py-2"
      style={{ background: "#7F1D1D", color: "#F8FAFC" }}
    >
      {children}
    </div>
  );
}