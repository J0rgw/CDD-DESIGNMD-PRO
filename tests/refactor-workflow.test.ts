import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

const REPO_ROOT = resolve(__dirname, "..");
const REFACTOR_DIR = resolve(REPO_ROOT, "examples/refactor");
const REFACTOR_DOC = resolve(REPO_ROOT, "skill-workflows/refactor.md");
const PLAN_SCHEMA_DOC = resolve(REPO_ROOT, "skill-workflows/refactor/plan-schema.md");

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/i;
const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

interface PlanFrontMatter {
  "plan-id": string;
  "generated-at": string;
  "source-design-md": string;
  "source-audit-report": string;
  "target-codebase-hash": string;
  "plan-version": string;
}

interface SarifReport {
  $schema: string;
  version: string;
  runs: Array<{ results: Array<{ ruleId: string; level: string }> }>;
}

interface DesignMdFrontMatter {
  colors?: Record<string, string>;
  typography?: Record<string, unknown>;
  spacing?: Record<string, string>;
  rounded?: Record<string, string>;
  components?: Record<string, unknown>;
  invariants?: Array<{ id: string; description: string }>;
}

function runUpstreamLint(filePath: string): { summary: { errors: number } } {
  const result = spawnSync("bunx", ["@google/design.md", "lint", filePath, "--format=json"], {
    encoding: "utf8",
  });
  if (result.error) throw new Error(`Lint failed: ${result.error.message}`);
  return JSON.parse(result.stdout.trim());
}

function readPlanFrontMatter(planPath: string): {
  frontMatter: PlanFrontMatter;
  body: string;
} {
  const raw = readFileSync(planPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`No front matter in ${planPath}`);
  return {
    frontMatter: yaml.load(match[1] ?? "", {
      schema: yaml.CORE_SCHEMA,
    }) as PlanFrontMatter,
    body: match[2] ?? "",
  };
}

function readDesignFrontMatter(designPath: string): DesignMdFrontMatter {
  const raw = readFileSync(designPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`No front matter in ${designPath}`);
  return yaml.load(match[1] ?? "") as DesignMdFrontMatter;
}

function tokenResolves(tokenPath: string, design: DesignMdFrontMatter): boolean {
  const segments = tokenPath.split(".");
  if (segments.length < 2) return false;
  const [root, ...rest] = segments;
  const rootMap = design[root as keyof DesignMdFrontMatter] as Record<string, unknown> | undefined;
  if (!rootMap) return false;
  let cursor: unknown = rootMap;
  for (const seg of rest) {
    if (typeof cursor !== "object" || cursor === null) return false;
    const next = (cursor as Record<string, unknown>)[seg];
    if (next === undefined) return false;
    cursor = next;
  }
  return true;
}

function countSection(body: string, heading: string): number {
  const sectionRe = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |\\Z)`, "m");
  const m = body.match(sectionRe);
  if (!m) return 0;
  const block = m[1] ?? "";
  if (/\(none\)/.test(block)) return 0;
  return (block.match(/^### /gm) ?? []).length;
}

const REFACTOR_EXAMPLES = readdirSync(REFACTOR_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => resolve(REFACTOR_DIR, d.name));

describe("refactor examples", () => {
  it("at least three examples exist", () => {
    expect(REFACTOR_EXAMPLES.length).toBeGreaterThanOrEqual(3);
  });

  for (const dir of REFACTOR_EXAMPLES) {
    const name = dir.split("/").pop() ?? "unknown";
    const designMdPath = resolve(dir, "input/DESIGN.md");
    const auditReportPath = resolve(dir, "input/audit-report.json");
    const planPath = resolve(dir, "expected-plan/refactor-plan.md");
    const reportPath = resolve(dir, "expected-output/refactor-report.md");
    const diffPath = resolve(dir, "expected-output/diff.patch");

    describe(name, () => {
      it("ships the expected file layout", () => {
        expect(existsSync(designMdPath)).toBe(true);
        expect(existsSync(auditReportPath)).toBe(true);
        expect(existsSync(planPath)).toBe(true);
        expect(existsSync(reportPath)).toBe(true);
        expect(existsSync(diffPath)).toBe(true);
      });

      it("input/DESIGN.md passes upstream lint with zero errors", () => {
        const report = runUpstreamLint(designMdPath);
        expect(report.summary.errors).toBe(0);
      });

      it("input/audit-report.json is valid JSON with SARIF shape", () => {
        const sarif = JSON.parse(readFileSync(auditReportPath, "utf8")) as SarifReport;
        expect(sarif.$schema).toBe("https://json.schemastore.org/sarif-2.1.0.json");
        expect(sarif.version).toBe("2.1.0");
        expect(Array.isArray(sarif.runs)).toBe(true);
        expect(sarif.runs.length).toBe(1);
      });

      it("plan front matter satisfies the documented schema", () => {
        const { frontMatter } = readPlanFrontMatter(planPath);
        expect(frontMatter["plan-id"]).toMatch(UUID_V4_RE);
        expect(frontMatter["generated-at"]).toMatch(ISO_8601_RE);
        expect(typeof frontMatter["source-design-md"]).toBe("string");
        expect(typeof frontMatter["source-audit-report"]).toBe("string");
        expect(frontMatter["target-codebase-hash"]).toMatch(SHA256_RE);
        expect(frontMatter["plan-version"]).toBe("1.0");
      });

      it("plan body has the expected H2 sections", () => {
        const { body } = readPlanFrontMatter(planPath);
        for (const heading of [
          "## Summary",
          "## Transformations",
          "## Deferred items",
          "## Rejected items",
          "## Validation",
        ]) {
          expect(body).toContain(heading);
        }
      });

      it("every Token used in the plan resolves to a token in DESIGN.md", () => {
        const { body } = readPlanFrontMatter(planPath);
        const design = readDesignFrontMatter(designMdPath);
        const tokenLines = body.match(/\*\*Token used:\*\*\s*([^\n]+)/g) ?? [];
        expect(tokenLines.length).toBeGreaterThan(0);
        const tokenRoots = ["colors", "typography", "spacing", "rounded", "components"];
        for (const line of tokenLines) {
          const refsMatch = line.match(/`([^`]+)`/g) ?? [];
          const tokenRefs = refsMatch
            .map((r) => r.replace(/`/g, ""))
            .filter((r) => tokenRoots.includes(r.split(".")[0] ?? ""));
          expect(tokenRefs.length).toBeGreaterThan(0);
          for (const path of tokenRefs) {
            expect(tokenResolves(path, design)).toBe(true);
          }
        }
      });

      it("rejected items reference invariant ids declared in DESIGN.md", () => {
        const { body } = readPlanFrontMatter(planPath);
        const design = readDesignFrontMatter(designMdPath);
        const rejectedSection = body.match(/## Rejected items\s*\n([\s\S]*?)(?=\n## |$)/);
        const block = rejectedSection?.[1] ?? "";
        if (/\(none\)/.test(block)) return;
        const declaredIds = new Set((design.invariants ?? []).map((i) => i.id));
        const headingIds = block.match(/### rejected-\d+:\s*([a-z0-9-]+)/g) ?? [];
        expect(headingIds.length).toBeGreaterThan(0);
        for (const h of headingIds) {
          const id = h.replace(/^### rejected-\d+:\s*/, "");
          expect(declaredIds.has(id)).toBe(true);
        }
      });

      it("deferred items have a documented reason", () => {
        const { body } = readPlanFrontMatter(planPath);
        const deferredSection = body.match(/## Deferred items\s*\n([\s\S]*?)(?=\n## |$)/);
        const block = deferredSection?.[1] ?? "";
        if (/\(none\)/.test(block)) return;
        const reasonLines = block.match(/\*\*Reason:\*\*\s*\S+/g) ?? [];
        const headers = block.match(/^### deferred-/gm) ?? [];
        expect(reasonLines.length).toBe(headers.length);
      });

      it("report exit code matches the report's residual status", () => {
        const reportBody = readFileSync(reportPath, "utf8");
        const exitMatch = reportBody.match(/##\s+Exit code[\s\S]*?`(\d)`/);
        expect(exitMatch).not.toBeNull();
        const exitCode = exitMatch?.[1];
        const residualSection = reportBody.match(/## Residual findings\s*\n([\s\S]*?)(?=\n## |$)/);
        const residualBlock = residualSection?.[1] ?? "";
        const hasResidual = residualBlock.length > 0 && !/\(none/.test(residualBlock);
        expect(exitCode).toBe(hasResidual ? "1" : "0");
      });
    });
  }
});

describe("refactor scenario invariants", () => {
  it("01 has zero deferred and zero rejected items", () => {
    const { body } = readPlanFrontMatter(
      resolve(REFACTOR_DIR, "01-tokenize-hardcoded-colors/expected-plan/refactor-plan.md"),
    );
    expect(countSection(body, "Deferred items")).toBe(0);
    expect(countSection(body, "Rejected items")).toBe(0);
  });

  it("02 transformations are all tier-promotion category", () => {
    const { body } = readPlanFrontMatter(
      resolve(REFACTOR_DIR, "02-fix-tier-inversion/expected-plan/refactor-plan.md"),
    );
    const categories = body.match(/\*\*Category:\*\*\s*([a-z-]+)/g) ?? [];
    expect(categories.length).toBeGreaterThan(0);
    for (const c of categories) {
      expect(c).toMatch(/tier-promotion/);
    }
  });

  it("03 has at least one transformation, one deferred, and one rejected", () => {
    const { body } = readPlanFrontMatter(
      resolve(REFACTOR_DIR, "03-partial-refactor-with-deferred/expected-plan/refactor-plan.md"),
    );
    expect(countSection(body, "Transformations")).toBeGreaterThanOrEqual(1);
    expect(countSection(body, "Deferred items")).toBeGreaterThanOrEqual(1);
    expect(countSection(body, "Rejected items")).toBeGreaterThanOrEqual(1);
  });
});

describe("skill-workflows/refactor.md", () => {
  const body = readFileSync(REFACTOR_DOC, "utf8");

  const expectedHeadings = [
    "## Purpose",
    "## When to invoke",
    "## Inputs",
    "## Phase 1 — Contract and finding loading",
    "## Phase 2 — Finding categorization",
    "## Phase 3 — Plan generation",
    "## Phase 4 — Plan validation",
    "## Phase 5 — Plan emission",
    "## Phase 6 — Plan re-validation",
    "## Phase 7 — Transformation application",
    "## Phase 8 — Re-audit verification",
    "## Phase 9 — Report emission",
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

describe("skill-workflows/refactor/plan-schema.md", () => {
  const body = readFileSync(PLAN_SCHEMA_DOC, "utf8");

  const expectedHeadings = [
    "## Compatibility statement",
    "## File structure",
    "## Front matter fields",
    "## Mandatory fields per transformation",
    "## Mandatory fields per deferred item",
    "## Mandatory fields per rejected item",
    "## Validation rules",
    "## Example minimal plan",
  ];

  it("contains every expected H2 heading", () => {
    for (const heading of expectedHeadings) {
      expect(body).toContain(heading);
    }
  });
});
