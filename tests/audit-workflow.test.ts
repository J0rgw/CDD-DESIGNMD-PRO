import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

const REPO_ROOT = resolve(__dirname, "..");
const AUDIT_DIR = resolve(REPO_ROOT, "examples/audit");
const SCHEMA_DOC = resolve(REPO_ROOT, "templates/extension-schema.md");
const TEMPLATE_DESIGN = resolve(REPO_ROOT, "templates/DESIGN.template.md");
const AUDIT_DOC = resolve(REPO_ROOT, "skill-workflows/audit.md");
const SARIF_SCHEMA_DOC = resolve(REPO_ROOT, "skill-workflows/audit/sarif-schema.md");

interface LintReport {
  findings: Array<{ severity: string; message: string; path?: string }>;
  summary: { errors: number; warnings: number; infos: number };
}

interface SarifResult {
  ruleId: string;
  level: "error" | "warning" | "note";
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region: {
        startLine: number;
        startColumn: number;
        snippet: { text: string };
      };
    };
  }>;
}

interface SarifReport {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
      };
    };
    results: SarifResult[];
  }>;
}

interface DesignMdFrontMatter {
  audit?: {
    failOn?: string[];
    excludePaths?: string[];
    excludeRules?: string[];
    additionalPaths?: string[];
  };
  invariants?: Array<{
    id: string;
    enforcement: "manual" | "automated" | "ci-only";
    severity: "error" | "warning" | "info";
  }>;
  antiPatterns?: Array<{ id: string; severity: "error" | "warning" | "info" }>;
}

function runUpstreamLint(filePath: string): LintReport {
  const result = spawnSync("bunx", ["@google/design.md", "lint", filePath, "--format=json"], {
    encoding: "utf8",
  });
  if (result.error) {
    throw new Error(`Lint failed: ${result.error.message}`);
  }
  return JSON.parse(result.stdout.trim()) as LintReport;
}

function readFrontMatter(designMdPath: string): DesignMdFrontMatter {
  const raw = readFileSync(designMdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    throw new Error(`No front matter in ${designMdPath}`);
  }
  return yaml.load(match[1]) as DesignMdFrontMatter;
}

function severityFromSarifLevel(level: SarifResult["level"]): "error" | "warning" | "info" {
  return level === "note" ? "info" : level;
}

function summaryCountsFromMarkdown(report: string): {
  error: number;
  warning: number;
  info: number;
} {
  const counts = { error: 0, warning: 0, info: 0 };
  for (const sev of ["error", "warning", "info"] as const) {
    const re = new RegExp(`\\|\\s*${sev}\\s*\\|\\s*(\\d+)\\s*\\|`, "i");
    const m = report.match(re);
    if (m) counts[sev] = Number.parseInt(m[1], 10);
  }
  return counts;
}

const AUDIT_EXAMPLES = readdirSync(AUDIT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => resolve(AUDIT_DIR, d.name));

describe("audit examples", () => {
  it("at least three examples exist", () => {
    expect(AUDIT_EXAMPLES.length).toBeGreaterThanOrEqual(3);
  });

  for (const dir of AUDIT_EXAMPLES) {
    const name = dir.split("/").pop();
    const designMdPath = resolve(dir, "input/DESIGN.md");
    const reportMdPath = resolve(dir, "expected-output/audit-report.md");
    const sarifPath = resolve(dir, "expected-output/audit-report.sarif.json");

    describe(name, () => {
      it("ships the expected file layout", () => {
        expect(existsSync(designMdPath)).toBe(true);
        expect(existsSync(reportMdPath)).toBe(true);
        expect(existsSync(sarifPath)).toBe(true);
      });

      it("input/DESIGN.md passes upstream lint with zero errors", () => {
        const report = runUpstreamLint(designMdPath);
        expect(report.summary.errors).toBe(0);
      });

      it("input/DESIGN.md declares the audit extension", () => {
        const fm = readFrontMatter(designMdPath);
        expect(fm.audit).toBeDefined();
        expect(Array.isArray(fm.audit?.failOn)).toBe(true);
      });

      it("audit.excludeRules ids resolve to declared antiPatterns or invariants", () => {
        const fm = readFrontMatter(designMdPath);
        const declaredIds = new Set<string>([
          ...(fm.antiPatterns?.map((a) => a.id) ?? []),
          ...(fm.invariants?.map((i) => i.id) ?? []),
        ]);
        for (const id of fm.audit?.excludeRules ?? []) {
          expect(declaredIds.has(id)).toBe(true);
        }
      });

      it("expected-output/audit-report.sarif.json matches the documented SARIF subset", () => {
        const sarif = JSON.parse(readFileSync(sarifPath, "utf8")) as SarifReport;

        expect(sarif.$schema).toBe("https://json.schemastore.org/sarif-2.1.0.json");
        expect(sarif.version).toBe("2.1.0");
        expect(Array.isArray(sarif.runs)).toBe(true);
        expect(sarif.runs.length).toBe(1);

        const [run] = sarif.runs;
        expect(run.tool.driver.name).toBe("cdd-designmd-pro");
        expect(typeof run.tool.driver.version).toBe("string");
        expect(run.tool.driver.informationUri).toMatch(/^https:\/\//);
        expect(Array.isArray(run.results)).toBe(true);

        for (const r of run.results) {
          expect(typeof r.ruleId).toBe("string");
          expect(["error", "warning", "note"]).toContain(r.level);
          expect(typeof r.message.text).toBe("string");
          expect(r.message.text.length).toBeGreaterThan(0);
          expect(r.locations.length).toBeGreaterThanOrEqual(1);
          const loc = r.locations[0].physicalLocation;
          expect(typeof loc.artifactLocation.uri).toBe("string");
          expect(typeof loc.region.startLine).toBe("number");
          expect(loc.region.startLine).toBeGreaterThan(0);
          expect(typeof loc.region.startColumn).toBe("number");
          expect(loc.region.startColumn).toBeGreaterThan(0);
          expect(typeof loc.region.snippet.text).toBe("string");
        }
      });

      it("markdown summary counts match the SARIF results distribution", () => {
        const md = readFileSync(reportMdPath, "utf8");
        const counts = summaryCountsFromMarkdown(md);
        const sarif = JSON.parse(readFileSync(sarifPath, "utf8")) as SarifReport;
        const [run] = sarif.runs;

        const sarifCounts = { error: 0, warning: 0, info: 0 };
        for (const r of run.results) {
          sarifCounts[severityFromSarifLevel(r.level)] += 1;
        }
        expect(counts).toEqual(sarifCounts);
      });

      it("audit.failOn determines the documented exit code in the markdown report", () => {
        const fm = readFrontMatter(designMdPath);
        const failOn = new Set(fm.audit?.failOn ?? ["error"]);
        const sarif = JSON.parse(readFileSync(sarifPath, "utf8")) as SarifReport;
        const [run] = sarif.runs;
        const triggers = run.results.some((r) => failOn.has(severityFromSarifLevel(r.level)));
        const expected = triggers ? "1" : "0";

        const md = readFileSync(reportMdPath, "utf8");
        const exitMatch = md.match(/##\s+Exit code[\s\S]*?`(\d)`/);
        expect(exitMatch).not.toBeNull();
        expect(exitMatch?.[1]).toBe(expected);
      });
    });
  }
});

describe("audit-specific scenarios", () => {
  it("01-clean-repo has zero findings", () => {
    const sarif = JSON.parse(
      readFileSync(
        resolve(AUDIT_DIR, "01-clean-repo/expected-output/audit-report.sarif.json"),
        "utf8",
      ),
    ) as SarifReport;
    expect(sarif.runs[0].results.length).toBe(0);
  });

  it("02-typical-drift has only warning- and info-severity findings", () => {
    const sarif = JSON.parse(
      readFileSync(
        resolve(AUDIT_DIR, "02-typical-drift/expected-output/audit-report.sarif.json"),
        "utf8",
      ),
    ) as SarifReport;
    const levels = new Set(sarif.runs[0].results.map((r) => r.level));
    expect(levels.has("error")).toBe(false);
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });

  it("03-invariant-violation has at least one error-severity finding", () => {
    const sarif = JSON.parse(
      readFileSync(
        resolve(AUDIT_DIR, "03-invariant-violation/expected-output/audit-report.sarif.json"),
        "utf8",
      ),
    ) as SarifReport;
    const errors = sarif.runs[0].results.filter((r) => r.level === "error");
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it("03-invariant-violation surfaces manual-enforcement invariants in the markdown report", () => {
    const md = readFileSync(
      resolve(AUDIT_DIR, "03-invariant-violation/expected-output/audit-report.md"),
      "utf8",
    );
    const fm = readFrontMatter(resolve(AUDIT_DIR, "03-invariant-violation/input/DESIGN.md"));
    const manualIds = (fm.invariants ?? [])
      .filter((i) => i.enforcement === "manual")
      .map((i) => i.id);
    expect(manualIds.length).toBeGreaterThan(0);
    for (const id of manualIds) {
      expect(md).toContain(id);
    }
  });
});

describe("schema documents the audit extension", () => {
  const body = readFileSync(SCHEMA_DOC, "utf8");

  it("contains the audit extension section", () => {
    expect(body).toContain("## Extension: audit");
    expect(body).toMatch(/failOn/);
    expect(body).toMatch(/excludePaths/);
    expect(body).toMatch(/excludeRules/);
    expect(body).toMatch(/additionalPaths/);
  });

  it("declares the cross-extension rule about excludeRules coherence", () => {
    expect(body).toMatch(/audit\.excludeRules/);
  });

  it("templates/DESIGN.template.md exercises the audit extension", () => {
    const tmpl = readFileSync(TEMPLATE_DESIGN, "utf8");
    const fm = tmpl.match(/^---\n([\s\S]*?)\n---\n/);
    expect(fm).not.toBeNull();
    const parsed = yaml.load(fm?.[1] ?? "") as DesignMdFrontMatter;
    expect(parsed.audit).toBeDefined();
    expect(Array.isArray(parsed.audit?.failOn)).toBe(true);
  });
});

describe("skill-workflows/audit.md", () => {
  const body = readFileSync(AUDIT_DOC, "utf8");

  const expectedHeadings = [
    "## Purpose",
    "## When to invoke",
    "## Inputs",
    "## Phase 1 — Contract loading",
    "## Phase 2 — Scope determination",
    "## Phase 3 — Detection passes",
    "## Phase 4 — Severity ranking and report assembly",
    "## Phase 5 — Output emission",
    "## Phase 6 — Exit code",
    "## Boundaries",
    "## Known limitations (v0.1.x)",
    "## Failure modes",
  ];

  it("contains every expected H2 heading", () => {
    for (const heading of expectedHeadings) {
      expect(body).toContain(heading);
    }
  });

  it("emits the expected H2 headings in order", () => {
    let cursor = 0;
    for (const heading of expectedHeadings) {
      const idx = body.indexOf(heading, cursor);
      expect(idx).toBeGreaterThan(-1);
      cursor = idx + heading.length;
    }
  });
});

describe("skill-workflows/audit/sarif-schema.md", () => {
  const body = readFileSync(SARIF_SCHEMA_DOC, "utf8");

  const expectedHeadings = [
    "## Compatibility statement",
    "## Mandatory fields emitted",
    "## Per-result fields emitted",
    "## Fields NOT emitted (deferred to v0.2+)",
    "## Validation",
    "## Example output",
  ];

  it("contains every expected H2 heading", () => {
    for (const heading of expectedHeadings) {
      expect(body).toContain(heading);
    }
  });
});
