import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const migration = readFileSync(
  join(process.cwd(), "supabase", "migrations", "20260912120000_task_11_enrollments_history.sql"),
  "utf8",
).toLowerCase()

describe("Task 11 enrollment lifecycle contract", () => {
  it("keeps lifecycle changes atomic and auditable", () => {
    expect(migration).toContain("create or replace function public.create_enrollment")
    expect(migration).toContain("create or replace function public.change_enrollment_status")
    expect(migration).toContain("insert into public.enrollment_history")
    expect(migration).toContain("for update")
    expect(migration).toContain("security definer")
  })

  it("limits mutations to active authenticated team members", () => {
    expect(migration).toContain("tm.profile_id = auth.uid()")
    expect(migration).toContain("tm.status = 'active'")
    expect(migration).toContain("grant execute on function public.create_enrollment")
    expect(migration).toContain("grant execute on function public.change_enrollment_status")
    expect(migration).toContain("revoke all on function public.create_enrollment")
  })
})
