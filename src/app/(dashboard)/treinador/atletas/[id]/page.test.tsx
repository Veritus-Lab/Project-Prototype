import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import StudentDetailPage from "./page";

describe("StudentDetailPage", () => {
  it("removes the legacy training detail route", () => {
    StudentDetailPage();

    expect(mocks.redirect).toHaveBeenCalledWith("/treinador/atletas");
  });
});
