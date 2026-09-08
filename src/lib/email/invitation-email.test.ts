import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("@/lib/email/resend", () => ({
  getResendClient: () => ({ emails: { send: mocks.send } }),
}));

import { renderInvitationEmail, sendInvitationEmail } from "./invitation-email";

describe("invitation email template", () => {
  const input = {
    to: "atleta@example.com",
    assessoriaNome: "Corre & Companhia",
    invitationUrl: "https://app.example.com/convite/token-seguro",
    expiresAt: "2026-09-11T12:00:00.000Z",
    invitationId: "invite-1",
  };

  beforeEach(() => vi.clearAllMocks());

  it("renders the assessment, expiry and secure invitation link", () => {
    const email = renderInvitationEmail(input);

    expect(email.subject).toContain("Corre & Companhia");
    expect(email.html).toContain("Corre &amp; Companhia");
    expect(email.html).toContain(input.invitationUrl);
    expect(email.html).toContain("11 de setembro de 2026");
  });

  it("escapes content that is interpolated into HTML", () => {
    const email = renderInvitationEmail({
      ...input,
      assessoriaNome: '<img src=x onerror="alert(1)">',
    });

    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain("&lt;img");
  });

  it("sends with an idempotency key and returns the provider id", async () => {
    mocks.send.mockResolvedValueOnce({ data: { id: "message-1" }, error: null });
    await expect(sendInvitationEmail(input)).resolves.toEqual({ id: "message-1" });
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: input.to }),
      { headers: { "Idempotency-Key": "invitation-invite-1" } },
    );
  });

  it.each([
    { data: null, error: { message: "provider" } },
    { data: {}, error: null },
  ])("rejects an incomplete provider response", async (response) => {
    mocks.send.mockResolvedValueOnce(response);
    await expect(sendInvitationEmail(input)).rejects.toThrow("Não foi possível enviar o convite por e-mail.");
  });
});
