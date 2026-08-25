import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  acceptInvitation: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/services/invitation.service", () => ({
  acceptInvitation: mocks.acceptInvitation,
}));

import {
  acceptInvitationAction,
} from "./actions";
import { initialAcceptInvitationActionState } from "./state";

function formData(fields: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
}

describe("acceptInvitationAction", () => {
  it("returns field errors before calling the service", async () => {
    const result = await acceptInvitationAction(
      initialAcceptInvitationActionState,
      formData({ token: "", nome: "", email: "email-invalido", senha: "curta" }),
    );

    expect(result.fieldErrors?.token?.[0]).toBe("Convite inválido.");
    expect(result.fieldErrors?.nome?.[0]).toBe("Informe seu nome.");
    expect(result.fieldErrors?.email?.[0]).toBe("Informe um e-mail válido.");
    expect(mocks.acceptInvitation).not.toHaveBeenCalled();
  });

  it("redirects to athlete dashboard after accepting the invitation", async () => {
    mocks.acceptInvitation.mockResolvedValueOnce({ data: undefined });
    mocks.redirect.mockImplementationOnce((destination: string) => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    });

    await expect(
      acceptInvitationAction(
        initialAcceptInvitationActionState,
        formData({
          token: "raw_token",
          nome: "Ana Atleta",
          email: "ana@example.com",
          senha: "Segura123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/atleta");
    expect(mocks.acceptInvitation).toHaveBeenCalledWith({
      token: "raw_token",
      nome: "Ana Atleta",
      email: "ana@example.com",
      senha: "Segura123",
    });
  });
});
