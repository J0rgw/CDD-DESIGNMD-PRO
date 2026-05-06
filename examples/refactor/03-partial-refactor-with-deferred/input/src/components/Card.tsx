import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <section
      className="rounded p-6"
      style={{ background: "#F8FAFC", color: "#0F172A" }}
    >
      {children}
    </section>
  );
}