import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const repositoryRoot = process.cwd();
const require = createRequire(import.meta.url);
const semver = require("semver") as {
  satisfies(version: string, range: string): boolean;
  subset(subRange: string, domRange: string): boolean;
};
const jsdomNodeRange = "^22.22.2 || ^24.15.0 || >=26.0.0";

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

describe("project runtime configuration", () => {
  it("keeps the legacy server in a CommonJS package scope", () => {
    const legacyPackagePath = path.join(repositoryRoot, "legacy", "package.json");

    expect(existsSync(legacyPackagePath)).toBe(true);
    expect(readJson(legacyPackagePath).type).toBe("commonjs");
  });

  it("formalizes a Node.js range fully supported by jsdom", () => {
    const rootPackage = readJson(path.join(repositoryRoot, "package.json"));
    const nodeRange = (rootPackage.engines as Record<string, string>).node;
    const lockfile = readJson(path.join(repositoryRoot, "package-lock.json"));
    const lockfileRootPackage = (lockfile.packages as Record<string, Record<string, unknown>>)[""];

    expect(nodeRange).toBe(jsdomNodeRange);
    expect((lockfileRootPackage.engines as Record<string, string>).node).toBe(nodeRange);
    expect(semver.subset(nodeRange, jsdomNodeRange)).toBe(true);
    expect(semver.satisfies("22.22.2", nodeRange)).toBe(true);
    expect(semver.satisfies("24.15.0", nodeRange)).toBe(true);
    expect(semver.satisfies("26.0.0", nodeRange)).toBe(true);
    expect(semver.satisfies("23.0.0", nodeRange)).toBe(false);
    expect(semver.satisfies("24.14.0", nodeRange)).toBe(false);
    expect(semver.satisfies("25.0.0", nodeRange)).toBe(false);
  });
});
