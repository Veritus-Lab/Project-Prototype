import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createInvitation: vi.fn(),
  revokeInvitation: vi.fn(),
  deleteInvitation: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/services/invitation.service", () => ({
  createInvitation: mocks.createInvitation,
  revokeInvitation: mocks.revokeInvitation,
  deleteInvitation: mocks.deleteInvitation,
}));

import {
  createInvitationAction,
  revokeInvitationAction,
  deleteInvitationAction,
} from "./actions";
import { initialInvitationActionState } from "./state";

function formData(fields: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
}

describe("invitation dashboard actions", () => {
  it("returns field errors before creating invitations", async () => {
    const result = await createInvitationAction(
      initialInvitationActionState,
      formData({ email: "email-invalido" }),
    );

    expect(result.fieldErrors?.email?.[0]).toBe(
      "Informe um e-mail válido para o convite.",
    );
    expect(mocks.createInvitation).not.toHaveBeenCalled();
  });

  it("creates an invitation and returns the one-time link", async () => {
    mocks.createInvitation.mockResolvedValueOnce({
      data: {
        id: "invite-1",
        email: "atleta@example.com",
        link: "https://app.flernk.test/convite/raw_token",
      },
    });

    await expect(
      createInvitationAction(
        initialInvitationActionState,
        formData({ email: "atleta@example.com" }),
      ),
    ).resolves.toEqual({
      createdLink: "https://app.flernk.test/convite/raw_token",
      createdEmail: "atleta@example.com",
    });
    expect(mocks.createInvitation).toHaveBeenCalledWith("atleta@example.com");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/treinador/convites");
  });

  it("revokes an invitation and revalidates the list", async () => {
    mocks.revokeInvitation.mockResolvedValueOnce({ data: undefined });

    await expect(revokeInvitationAction(formData({ id: "invite-1" }))).resolves.toBe(
      undefined,
    );
    expect(mocks.revokeInvitation).toHaveBeenCalledWith("invite-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/treinador/convites");
  });

  it("deletes an invitation and revalidates the list", async () => {
    mocks.deleteInvitation.mockResolvedValueOnce({ data: undefined });
    await expect(deleteInvitationAction(formData({ id: "invite-1" }))).resolves.toBe(undefined);
    expect(mocks.deleteInvitation).toHaveBeenCalledWith("invite-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/treinador/convites");
  });
});
