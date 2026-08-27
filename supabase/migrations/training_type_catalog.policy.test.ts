import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function readTrainingTypeCatalogMigration() {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const fileName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_training_type_catalog.sql"),
  );

  if (!fileName) {
    throw new Error("training type catalog migration not found");
  }

  return readFileSync(join(migrationsDir, fileName), "utf8").toLowerCase();
}

describe("training type catalog migration", () => {
  const sql = readTrainingTypeCatalogMigration();

  it("creates a global read-only catalog protected by RLS", () => {
    expect(sql).toContain("create table public.tipos_treino_catalogo");
    expect(sql).toContain(
      "alter table public.tipos_treino_catalogo enable row level security",
    );
    expect(sql).toContain(
      "alter table public.tipos_treino_catalogo force row level security",
    );
    expect(sql).toContain("for select");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain(
      "grant select on table public.tipos_treino_catalogo to authenticated",
    );
  });

  it("does not grant client writes and keeps the structure bounded", () => {
    expect(sql).toContain(
      "revoke all on table public.tipos_treino_catalogo from public, anon, authenticated",
    );
    expect(sql).not.toMatch(
      /grant\s+(insert|update|delete)[\s\S]+public\.tipos_treino_catalogo\s+to\s+authenticated/,
    );
    expect(sql).not.toContain("for insert");
    expect(sql).not.toContain("for update");
    expect(sql).not.toContain("for delete");
    expect(sql).toContain("jsonb_typeof(estrutura_schema) = 'object'");
    expect(sql).toContain("jsonb_array_length(estrutura_schema -> 'blocos') between 1 and 8");
  });

  it("seeds the ten initial running training types", () => {
    for (const code of [
      "corrida_facil",
      "regenerativo",
      "longao",
      "tempo_limiar",
      "intervalado",
      "subidas",
      "fartlek",
      "progressivo",
      "ritmo_prova",
      "tecnica_strides",
    ]) {
      expect(sql).toContain(`'${code}'`);
    }
  });
});
