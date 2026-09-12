import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn().mockResolvedValue(undefined),
  listClasses: vi.fn().mockResolvedValue({ data: [{ id: "class-1", name: "Iniciantes" }] }),
  listClassMeetings: vi.fn().mockResolvedValue({ data: [] }),
  ClassManagement: vi.fn(() => <div data-testid="class-management" />),
}))

vi.mock("@/lib/auth/session", () => ({ requireRole: mocks.requireRole }))
vi.mock("@/lib/services/class.service", () => ({ listClasses: mocks.listClasses, listClassMeetings: mocks.listClassMeetings }))
vi.mock("@/components/dashboard/class-management", () => ({ ClassManagement: mocks.ClassManagement }))

import ClassesPage from "./page"

describe("ClassesPage", () => {
  it("loads classes and meetings for the operational portal", async () => {
    const page = await ClassesPage()
    expect(mocks.requireRole).toHaveBeenCalledWith("socio", "professor")
    expect(mocks.listClasses).toHaveBeenCalled()
    expect(mocks.listClassMeetings).toHaveBeenCalled()
    expect(page).toBeTruthy()
  })
})
