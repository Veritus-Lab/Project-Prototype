import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const migrationsDirectory = join(process.cwd(), "supabase", "migrations")

const expectedTables = [
  "team_members",
  "students",
  "enrollments",
  "enrollment_history",
  "classes",
  "class_memberships",
  "class_meetings",
  "attendances",
  "absence_justifications",
  "plans",
  "plan_versions",
  "subscriptions",
  "subscription_history",
  "billing_cycles",
  "billing_generation_runs",
  "billing_generation_watermarks",
  "charges",
  "charge_adjustments",
  "payment_checkouts",
  "payments",
  "payment_settlements",
  "payment_refunds",
  "payment_disputes",
  "financial_categories",
  "expenses",
  "other_revenues",
  "cash_movements",
  "provider_events",
  "integration_attempts",
  "contact_preferences",
  "message_templates",
  "message_jobs",
  "message_events",
  "leads",
  "lead_history",
  "audit_entries",
] as const

function loadFoundationSql() {
  const files = readdirSync(migrationsDirectory)
    .filter((file) => file.endsWith(".sql") && file.includes("mvp_foundation"))
    .sort()

  return {
    files,
    sql: files
      .map((file) => readFileSync(join(migrationsDirectory, file), "utf8"))
      .join("\n")
      .toLowerCase(),
  }
}

describe("Task 06 additive database foundation", () => {
  it("defines the complete target model without destructive data statements", () => {
    const { files, sql } = loadFoundationSql()

    expect(files.length).toBeGreaterThan(0)
    expect(sql).not.toMatch(/\b(drop\s+table|truncate|delete\s+from|update\s+public\.|insert\s+into\s+public\.)\b/)

    for (const table of expectedTables) {
      expect(sql, `missing table ${table}`).toMatch(
        new RegExp(`create\\s+table\\s+public\\.${table}\\b`),
      )
    }
  })

  it("keeps every new Data API table closed until role policies land", () => {
    const { sql } = loadFoundationSql()

    for (const table of expectedTables) {
      expect(sql, `${table} must enable RLS`).toMatch(
        new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`),
      )
      expect(sql, `${table} must force RLS`).toMatch(
        new RegExp(`alter\\s+table\\s+public\\.${table}\\s+force\\s+row\\s+level\\s+security`),
      )
    }

    expect(sql).toContain("revoke all")
    expect(sql).toContain("from public, anon, authenticated")
    expect(sql).not.toMatch(/grant\s+.+\s+to\s+(anon|authenticated)/)
  })
})
