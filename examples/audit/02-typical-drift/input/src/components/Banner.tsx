import type { PropsWithChildren } from "react";

export function Banner({ children }: PropsWithChildren) {
  return (
    <aside
      className="banner"
      style={{ background: "#FEF3C7", color: "#78350F" }}
    >
      {children}
    </aside>
  );
}
</content>
</invoke>