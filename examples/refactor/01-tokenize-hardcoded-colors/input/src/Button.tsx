import type { PropsWithChildren } from "react";

export function Button({ children }: PropsWithChildren) {
  return (
    <button
      type="button"
      className="rounded bg-[#0EA5E9] px-3 py-2 text-sm text-white"
    >
      {children}
    </button>
  );
}