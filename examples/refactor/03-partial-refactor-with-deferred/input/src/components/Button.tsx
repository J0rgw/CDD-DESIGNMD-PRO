import type { PropsWithChildren } from "react";

export function Button({ children }: PropsWithChildren) {
  return (
    <button
      type="button"
      className="rounded px-3 py-2"
      style={{ background: "#2563EB", color: "#F8FAFC" }}
    >
      {children}
    </button>
  );
}