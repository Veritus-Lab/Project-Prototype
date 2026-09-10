import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import LegacyStudentInvitationPage from "./page";

describe("LegacyStudentInvitationPage", () => {
  it("removes the legacy student invitation route", () => {
    LegacyStudentInvitationPage();

    expect(mocks.redirect).toHaveBeenCalledWith("/treinador/atletas");
  });
});
