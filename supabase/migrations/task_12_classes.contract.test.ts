import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const migrationDirectory = join(process.cwd(), "supabase", "migrations")
const sql = [
  "20260912130000_task_12_classes_meetings.sql",
  "20260912143000_task_12_recurring_meetings_memberships.sql",
].map((file) => readFileSync(join(migrationDirectory, file), "utf8")).join("\n").toLowerCase()

describe("Task 12 classes and meetings contract", () => {
  it("supports class, membership and meeting operations", () => {
    expect(sql).toContain("create or replace function public.create_class")
    expect(sql).toContain("create or replace function public.add_class_member")
    expect(sql).toContain("create or replace function public.create_class_meeting")
    expect(sql).toContain("create or replace function public.cancel_class_meeting")
    expect(sql).toContain("create or replace function public.create_class_meeting_series")
    expect(sql).toContain("on conflict (class_id, starts_at) do nothing")
    expect(sql).toContain("create or replace function public.add_class_member")
    expect(sql).toContain("target_ends_at <= target_starts_at")
  })

  it("requires active team membership and protects tenant boundaries", () => {
    expect(sql).toContain("tm.profile_id = auth.uid()")
    expect(sql).toContain("tm.status = 'active'")
    expect(sql).toContain("c.assessoria_id = aid")
    expect(sql).toContain("revoke all on function public.create_class")
  })
})
