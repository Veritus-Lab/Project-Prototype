import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  inspectInvitation: vi.fn(),
}));

vi.mock("@/lib/services/invitation.service", () => ({
  inspectInvitation: mocks.inspectInvitation,
}));

vi.mock("@/components/auth/invitation-signup-form", () => ({
  InvitationSignupForm: ({
    token,
    maskedEmail,
  }: {
    token: string;
    maskedEmail: string;
  }) => (
    <form aria-label="cadastro por convite">
      <input name="token" value={token} readOnly />
      <span>{maskedEmail}</span>
    </form>
  ),
}));

import InvitePage from "./page";

describe("InvitePage", () => {
  it("renders signup form for active invitations", async () => {
    mocks.inspectInvitation.mockResolvedValueOnce({
      data: {
        maskedEmail: "a***a@example.com",
        assessoriaNome: "Assessoria Alfa",
        state: "active",
      },
    });

    render(await InvitePage({ params: Promise.resolve({ token: "raw_token" }) }));

    expect(screen.getByRole("heading", { name: "Assessoria Alfa" }))
      .toBeInTheDocument();
    expect(screen.getByRole("form", { name: "cadastro por convite" }))
      .toBeInTheDocument();
    expect(screen.getByDisplayValue("raw_token")).toBeInTheDocument();
  });

  it("renders a definitive message for invalid invitations", async () => {
    mocks.inspectInvitation.mockResolvedValueOnce({
      data: {
        maskedEmail: null,
        assessoriaNome: null,
        state: "expired",
      },
    });

    render(await InvitePage({ params: Promise.resolve({ token: "raw_token" }) }));

    expect(screen.getByRole("heading", { name: "Convite expirado" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "cadastro por convite" }))
      .not.toBeInTheDocument();
  });
});
