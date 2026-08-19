import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repositoryRoot = process.cwd();

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

describe("project runtime configuration", () => {
  it("keeps the legacy server in a CommonJS package scope", () => {
    const legacyPackagePath = path.join(repositoryRoot, "legacy", "package.json");

    expect(existsSync(legacyPackagePath)).toBe(true);
    expect(readJson(legacyPackagePath).type).toBe("commonjs");
  });

  it("formalizes the Node.js version required by development dependencies", () => {
    const rootPackage = readJson(path.join(repositoryRoot, "package.json"));

    expect(rootPackage.engines).toEqual({ node: ">=22.22.2" });
  });
});
