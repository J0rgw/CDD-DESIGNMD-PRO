import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const TEMPLATE_PATH = resolve(__dirname, "../templates/DESIGN.template.md");

interface Finding {
  severity: "error" | "warning" | "info";
  path?: string;
  message: string;
}

interface LintReport {
  findings: Finding[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

function runUpstreamLint(filePath: string): LintReport {
  const result = spawnSync("bunx", ["@google/design.md", "lint", filePath, "--format=json"], {
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(`Failed to invoke upstream linter: ${result.error.message}`);
  }

  const stdout = result.stdout?.trim() ?? "";
  if (!stdout) {
    throw new Error(`Upstream linter produced no stdout. stderr: ${result.stderr}`);
  }

  const parsed = JSON.parse(stdout) as LintReport;
  return parsed;
}

describe("templates/DESIGN.template.md", () => {
  it("exists at the expected path", () => {
    expect(existsSync(TEMPLATE_PATH)).toBe(true);
  });

  describe("upstream linter (@google/design.md lint)", () => {
    const report = runUpstreamLint(TEMPLATE_PATH);

    it("has zero errors", () => {
      expect(report.summary.errors).toBe(0);
    });

    it("has no broken-ref findings", () => {
      const broken = report.findings.filter(
        (f) =>
          f.message.toLowerCase().includes("broken") ||
          f.message.toLowerCase().includes("unresolved") ||
          f.message.toLowerCase().includes("undefined reference"),
      );
      expect(broken).toHaveLength(0);
    });

    it("has no contrast-ratio errors", () => {
      const contrastErrors = report.findings.filter(
        (f) => f.severity === "error" && f.message.toLowerCase().includes("contrast"),
      );
      expect(contrastErrors).toHaveLength(0);
    });

    it("only emits findings whose severity is warning or info", () => {
      const errors = report.findings.filter((f) => f.severity === "error");
      expect(errors).toHaveLength(0);
    });

    it("tolerates section-order warnings from extension sections", () => {
      const sectionOrderFindings = report.findings.filter((f) =>
        f.message.toLowerCase().includes("section"),
      );
      for (const finding of sectionOrderFindings) {
        expect(finding.severity).not.toBe("error");
      }
    });
  });
});
