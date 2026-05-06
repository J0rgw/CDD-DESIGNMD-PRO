import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <section
      style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 24 }}
    >
      {children}
    </section>
  );
}