import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "20260829221000_invitation_delete_policy.sql"), "utf8").toLowerCase();

describe("invitation delete migration", () => {
  it("allows only the owning trainer to delete invitations", () => {
    expect(sql).toContain("grant delete on table public.convites_atletas to authenticated");
    expect(sql).toContain("create policy convites_delete_trainer");
    expect(sql).toContain("treinador_id = (select auth.uid())");
    expect(sql).toContain("private.is_treinador(assessoria_id)");
  });
});
