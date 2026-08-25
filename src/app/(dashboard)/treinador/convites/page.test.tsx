import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listInvitations: vi.fn(),
}));

vi.mock("@/lib/services/invitation.service", () => ({
  listInvitations: mocks.listInvitations,
}));

vi.mock("@/components/dashboard/invitation-form", () => ({
  InvitationForm: () => <form aria-label="formulário de convite" />,
}));

vi.mock("@/components/dashboard/invitation-list", () => ({
  InvitationList: ({ invitations }: { invitations: readonly { email: string }[] }) => (
    <div>{invitations.map((invitation) => invitation.email).join(", ")}</div>
  ),
}));

import ConvitesPage from "./page";

describe("ConvitesPage", () => {
  it("renders trainer invitation management", async () => {
    mocks.listInvitations.mockResolvedValueOnce({
      data: [
        {
          id: "invite-1",
          email: "ativo@example.com",
          status: "pendente",
          state: "active",
          expira_em: "2026-08-31T12:00:00.000Z",
          usado_em: null,
          revogado_em: null,
          created_at: "2026-08-24T12:00:00.000Z",
        },
      ],
    });

    render(await ConvitesPage());

    expect(screen.getByRole("heading", { name: "Convites" })).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "formulário de convite" }))
      .toBeInTheDocument();
    expect(screen.getByText("ativo@example.com")).toBeInTheDocument();
  });
});
