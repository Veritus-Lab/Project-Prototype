import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getProfessorStudentFinancialStatus: vi.fn(),
}));

vi.mock("@/lib/services/professor-financial-status.service", () => ({
  getProfessorStudentFinancialStatus: mocks.getProfessorStudentFinancialStatus,
}));

import { GET } from "./route";

const validStudentId = "70000000-0000-4000-8000-000000000021";

function context(studentId = validStudentId) {
  return { params: Promise.resolve({ studentId }) } as RouteContext<
    "/api/v1/professor/students/[studentId]/financial-status"
  >;
}

describe("GET /api/v1/professor/students/[studentId]/financial-status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the aggregate status", async () => {
    mocks.getProfessorStudentFinancialStatus.mockResolvedValue({
      data: { status: "pendente" },
    });

    const response = await GET(new Request("https://flernk.app/api"), context());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: "pendente" } });
  });

  it("rejects an unauthenticated request without exposing details", async () => {
    const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/login;307;",
    });
    mocks.getProfessorStudentFinancialStatus.mockRejectedValue(redirectError);

    const response = await GET(new Request("https://flernk.app/api"), context());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Financial status unavailable" });
  });

  it("denies an athlete or a cross-tenant target", async () => {
    mocks.getProfessorStudentFinancialStatus.mockResolvedValue({ error: "FORBIDDEN" });

    const response = await GET(new Request("https://flernk.app/api"), context());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Financial status unavailable" });
  });

  it("reports an internal lookup failure without leaking it", async () => {
    mocks.getProfessorStudentFinancialStatus.mockResolvedValue({ error: "UNAVAILABLE" });

    const response = await GET(new Request("https://flernk.app/api"), context());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Financial status unavailable" });
  });

  it("rejects an invalid path identifier before the service call", async () => {
    const response = await GET(
      new Request("https://flernk.app/api"),
      context("not-a-uuid"),
    );

    expect(response.status).toBe(400);
    expect(mocks.getProfessorStudentFinancialStatus).not.toHaveBeenCalled();
  });
});
