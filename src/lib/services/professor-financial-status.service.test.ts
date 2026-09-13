import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  createServerClient: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

import { getProfessorStudentFinancialStatus } from "./professor-financial-status.service";

describe("getProfessorStudentFinancialStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServerClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.requireRole.mockResolvedValue({ role: "professor" });
  });

  it("returns only the aggregate financial enum", async () => {
    mocks.rpc.mockResolvedValue({ data: "pendente", error: null });

    await expect(getProfessorStudentFinancialStatus("student-1")).resolves.toEqual({
      data: { status: "pendente" },
    });
    expect(mocks.rpc).toHaveBeenCalledWith("get_student_financial_status", {
      target_student_id: "student-1",
    });
    expect(mocks.requireRole).toHaveBeenCalledWith("socio", "professor");
  });

  it("does not expose the database error", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error("permission denied") });

    await expect(getProfessorStudentFinancialStatus("student-1")).resolves.toEqual({
      error: "UNAVAILABLE",
    });
  });

  it("maps authorization failures to a safe forbidden result", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501" } });

    await expect(getProfessorStudentFinancialStatus("student-1")).resolves.toEqual({
      error: "FORBIDDEN",
    });
  });
});
