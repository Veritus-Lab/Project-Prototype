import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import LegacyStudentInvitePage from "./page";

describe("LegacyStudentInvitePage", () => {
  it("does not expose the retired invitation flow", () => {
    LegacyStudentInvitePage();

    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
