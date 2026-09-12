import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const migrationPath = join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260912150000_flernk_preregistration_september.sql",
)
const sql = readFileSync(migrationPath, "utf8")

describe("FLERNK September pre-registration data contract", () => {
  it("contains the 44 supplied students with the expected payment split", () => {
    const sourceBlock = sql.match(
      /with source\(student_name, class_name, payment_status\) as \(\s*values([\s\S]*?)\), target as/i,
    )?.[1]

    expect(sourceBlock).toBeTruthy()

    const rows = [...(sourceBlock ?? "").matchAll(/\('([^']*)', '([^']*)', '(pago|pendente)'\)/g)]
    expect(rows).toHaveLength(44)
    expect(rows.filter((row) => row[3] === "pago")).toHaveLength(16)
    expect(rows.filter((row) => row[3] === "pendente")).toHaveLength(28)
  })

  it("targets the principal FLERNK assessoria and all four classes", () => {
    expect(sql).toContain("b8b49b94-ce66-49b6-8e4c-2dd98081abcf")
    for (const className of [
      "Turma Adaptado",
      "Turma 1 — Iniciantes",
      "Turma 2 — Iniciantes Intermediários",
      "Turma 3 — Iniciantes Avançados",
    ]) {
      expect(sql).toContain(className)
    }
  })

  it("is safe to re-run and does not create official charges or payments", () => {
    expect(sql.match(/not exists/gi)?.length).toBeGreaterThanOrEqual(3)
    expect(sql).toContain("enrollment_history")
    expect(sql).toContain("class_memberships")
    expect(sql).not.toMatch(/insert\s+into\s+public\.(charges|payments)\b/i)
  })
})
