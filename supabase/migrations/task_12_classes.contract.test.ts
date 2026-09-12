import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "20260912130000_task_12_classes_meetings.sql"), "utf8").toLowerCase()

describe("Task 12 classes and meetings contract", () => {
  it("supports class, membership and meeting operations", () => {
    expect(sql).toContain("create or replace function public.create_class")
    expect(sql).toContain("create or replace function public.add_class_member")
    expect(sql).toContain("create or replace function public.create_class_meeting")
    expect(sql).toContain("create or replace function public.cancel_class_meeting")
    expect(sql).toContain("target_ends_at <= target_starts_at")
  })

  it("requires active team membership and protects tenant boundaries", () => {
    expect(sql).toContain("tm.profile_id = auth.uid()")
    expect(sql).toContain("tm.status = 'active'")
    expect(sql).toContain("c.assessoria_id = aid")
    expect(sql).toContain("revoke all on function public.create_class")
  })
})
