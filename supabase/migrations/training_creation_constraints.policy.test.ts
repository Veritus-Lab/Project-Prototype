import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function readTrainingCreationMigration() {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const fileName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_training_creation_constraints.sql"),
  );

  if (!fileName) {
    throw new Error("training creation migration not found");
  }

  return readFileSync(join(migrationsDir, fileName), "utf8").toLowerCase();
}

describe("training creation migration", () => {
  const sql = readTrainingCreationMigration();

  it("links a training to an optional catalog type without loosening tenant ownership", () => {
    expect(sql).toContain("add column tipo_treino_id uuid");
    expect(sql).toContain("references public.tipos_treino_catalogo (id)");
    expect(sql).not.toContain("disable row level security");
    expect(sql).not.toContain("grant all on table public.treinos");
  });

  it("requires a bounded structured block array in persisted trainings", () => {
    expect(sql).toContain("drop constraint if exists treinos_estrutura_check");
    expect(sql).toContain("jsonb_typeof(estrutura -> 'blocos') = 'array'");
    expect(sql).toContain("jsonb_array_length(estrutura -> 'blocos') between 1 and 8");
    expect(sql).toContain("char_length(btrim(descricao)) <= 500");
  });
});
