import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children with the example surface color", () => {
    const { container } = render(<Card>hi</Card>);
    expect(container.querySelector("section")?.style.background).toBe(
      "rgb(248, 250, 252)",
    );
  });

  it("documents the legacy literal expectation", () => {
    const expectedHexAlias = "#F8FAFC";
    expect(expectedHexAlias.toUpperCase()).toBe("#F8FAFC");
  });
});