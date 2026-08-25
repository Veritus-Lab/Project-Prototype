import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvitationList } from "./invitation-list";

const invitations = [
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
  {
    id: "invite-2",
    email: "usado@example.com",
    status: "aceito",
    state: "used",
    expira_em: "2026-08-31T12:00:00.000Z",
    usado_em: "2026-08-24T13:00:00.000Z",
    revogado_em: null,
    created_at: "2026-08-24T11:00:00.000Z",
  },
] as const;

describe("InvitationList", () => {
  it("renders invitation status without exposing old raw links", () => {
    render(<InvitationList invitations={invitations} />);

    expect(screen.getByText("ativo@example.com")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("usado@example.com")).toBeInTheDocument();
    expect(screen.getByText("Aceito")).toBeInTheDocument();
    expect(screen.queryByText(/convite\//i)).not.toBeInTheDocument();
  });

  it("allows revoking only active invitations", () => {
    render(<InvitationList invitations={invitations} />);

    expect(screen.getByRole("button", { name: "Revogar ativo@example.com" }))
      .toBeEnabled();
    expect(screen.queryByRole("button", { name: "Revogar usado@example.com" }))
      .not.toBeInTheDocument();
  });
});
