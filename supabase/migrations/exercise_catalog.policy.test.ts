import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function readExerciseCatalogMigration() {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const fileName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_exercise_catalog.sql"),
  );

  if (!fileName) {
    throw new Error("exercise catalog migration not found");
  }

  return readFileSync(join(migrationsDir, fileName), "utf8").toLowerCase();
}

describe("exercise catalog migration", () => {
  const sql = readExerciseCatalogMigration();

  it("creates a global read-only catalog table", () => {
    expect(sql).toContain("create table public.exercicios_catalogo");
    expect(sql).toContain(
      "alter table public.exercicios_catalogo enable row level security",
    );
    expect(sql).toContain(
      "alter table public.exercicios_catalogo force row level security",
    );
    expect(sql).toContain("for select");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain(
      "grant select on table public.exercicios_catalogo to authenticated",
    );
  });

  it("does not grant client writes to the global catalog", () => {
    expect(sql).toContain(
      "revoke all on table public.exercicios_catalogo from public, anon, authenticated",
    );
    expect(sql).not.toMatch(
      /grant\s+(insert|update|delete)[\s\S]+public\.exercicios_catalogo\s+to\s+authenticated/,
    );
    expect(sql).not.toContain("for insert");
    expect(sql).not.toContain("for update");
    expect(sql).not.toContain("for delete");
  });

  it("seeds the initial running support categories and exercises", () => {
    for (const category of [
      "forca",
      "mobilidade",
      "core",
      "pliometria",
      "tecnica",
    ]) {
      expect(sql).toContain(`'${category}'`);
    }

    for (const exercise of [
      "agachamento",
      "afundo/passada",
      "levantamento terra romeno/hinge",
      "elevação de panturrilha",
      "prancha frontal",
      "mobilidade de tornozelo",
      "fortalecimento intrínseco do pé",
    ]) {
      expect(sql).toContain(exercise);
    }
  });
});
