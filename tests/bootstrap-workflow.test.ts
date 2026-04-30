import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

const REPO_ROOT = resolve(__dirname, "..");
const PRESETS_DIR = resolve(REPO_ROOT, "skill-workflows/domain-presets");
const EXAMPLES_DIR = resolve(REPO_ROOT, "examples/bootstrap");
const BOOTSTRAP_DOC = resolve(REPO_ROOT, "skill-workflows/bootstrap.md");

const ENFORCEMENT_VALUES = new Set(["manual", "automated", "ci-only"]);
const SEVERITY_VALUES = new Set(["error", "warning", "info"]);

interface PresetInvariant {
  id: string;
  description: string;
  scope: string;
  enforcement: string;
  severity: string;
}

interface PresetFile {
  preset: {
    name: string;
    description: string;
    references: string[];
  };
  invariants: PresetInvariant[];
}

interface LintReport {
  findings: Array<{ severity: string; message: string; path?: string }>;
  summary: { errors: number; warnings: number; infos: number };
}

function loadPreset(filePath: string): PresetFile {
  return yaml.load(readFileSync(filePath, "utf8")) as PresetFile;
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

function readDesignMd(designMdPath: string): { frontMatter: string; body: string } {
  const raw = readFileSync(designMdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`No front matter in ${designMdPath}`);
  }
  return { frontMatter: match[1], body: match[2] };
}

const PRESET_FILES = readdirSync(PRESETS_DIR)
  .filter((f) => f.endsWith(".yml"))
  .map((f) => resolve(PRESETS_DIR, f));

describe("domain presets", () => {
  it("at least three presets exist", () => {
    expect(PRESET_FILES.length).toBeGreaterThanOrEqual(3);
  });

  for (const file of PRESET_FILES) {
    const name = file.split("/").pop();

    describe(name, () => {
      const preset = loadPreset(file);

      it("parses as valid YAML and matches the preset shape", () => {
        expect(preset.preset).toBeDefined();
        expect(typeof preset.preset.name).toBe("string");
        expect(typeof preset.preset.description).toBe("string");
        expect(Array.isArray(preset.preset.references)).toBe(true);
        expect(preset.preset.references.length).toBeGreaterThan(0);
        expect(Array.isArray(preset.invariants)).toBe(true);
        expect(preset.invariants.length).toBeGreaterThan(0);
      });

      it("preset.name matches its filename", () => {
        const filename = file
          .split("/")
          .pop()
          ?.replace(/\.yml$/, "");
        expect(preset.preset.name).toBe(filename);
      });

      it("every invariant has the required fields", () => {
        for (const inv of preset.invariants) {
          expect(inv.id).toMatch(/^[a-z0-9-]+$/);
          expect(typeof inv.description).toBe("string");
          expect(inv.description.length).toBeGreaterThan(0);
          expect(typeof inv.scope).toBe("string");
          expect(ENFORCEMENT_VALUES.has(inv.enforcement)).toBe(true);
          expect(SEVERITY_VALUES.has(inv.severity)).toBe(true);
        }
      });

      it("invariant ids are unique within the preset", () => {
        const ids = preset.invariants.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});

describe("bootstrap examples", () => {
  const exampleDirs = readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => resolve(EXAMPLES_DIR, d.name));

  it("at least two examples exist", () => {
    expect(exampleDirs.length).toBeGreaterThanOrEqual(2);
  });

  for (const dir of exampleDirs) {
    const designMdPath = resolve(dir, "expected-output/DESIGN.md");
    const exampleName = dir.split("/").pop();

    describe(exampleName, () => {
      it("ships an expected-output/DESIGN.md", () => {
        expect(existsSync(designMdPath)).toBe(true);
      });

      it("passes upstream lint with zero errors", () => {
        const report = runUpstreamLint(designMdPath);
        expect(report.summary.errors).toBe(0);
      });

      it("declares the expected extensions in front matter", () => {
        const { frontMatter } = readDesignMd(designMdPath);
        expect(frontMatter).toContain("themingAxes:");
        expect(frontMatter).toContain("tokenTiers:");
        expect(frontMatter).toContain("antiPatterns:");
        expect(frontMatter).toContain("runtime:");
      });
    });
  }

  describe("01-greenfield-react-saas — domain none/other", () => {
    const designMdPath = resolve(
      EXAMPLES_DIR,
      "01-greenfield-react-saas/expected-output/DESIGN.md",
    );

    it("does NOT include invariants (domain is none/other)", () => {
      const { frontMatter } = readDesignMd(designMdPath);
      expect(frontMatter).not.toMatch(/^invariants:/m);
    });

    it("declares a runtime branding axis", () => {
      const { frontMatter } = readDesignMd(designMdPath);
      expect(frontMatter).toMatch(/branding:[\s\S]*?runtime:\s*true/);
    });
  });

  describe("02-brownfield-with-tokens — industrial-scada preset applied", () => {
    const designMdPath = resolve(
      EXAMPLES_DIR,
      "02-brownfield-with-tokens/expected-output/DESIGN.md",
    );
    const preset = loadPreset(resolve(PRESETS_DIR, "industrial-scada.yml"));

    it("includes every invariant id from the industrial-scada preset", () => {
      const { frontMatter } = readDesignMd(designMdPath);
      for (const inv of preset.invariants) {
        expect(frontMatter).toContain(`id: ${inv.id}`);
      }
    });

    it("excludes status colors from the branding axis", () => {
      const { frontMatter } = readDesignMd(designMdPath);
      expect(frontMatter).toContain("excludedFrom:");
      expect(frontMatter).toMatch(/colors\.status-/);
    });
  });
});

describe("skill-workflows/bootstrap.md", () => {
  const body = readFileSync(BOOTSTRAP_DOC, "utf8");

  const expectedHeadings = [
    "## Purpose",
    "## When to invoke",
    "## Inputs",
    "## Phase 1 — Project state detection",
    "## Phase 2 — Structured interview",
    "## Phase 3 — Detection-only proposals",
    "## Phase 4 — Generation",
    "## Phase 5 — Handoff",
    "## Boundaries",
    "## Failure modes and recovery",
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
