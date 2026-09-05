import { describe, expect, it } from "vitest";

import { renderInvitationEmail } from "./invitation-email";

describe("invitation email template", () => {
  const input = {
    to: "atleta@example.com",
    assessoriaNome: "Corre & Companhia",
    invitationUrl: "https://app.example.com/convite/token-seguro",
    expiresAt: "2026-09-11T12:00:00.000Z",
    invitationId: "invite-1",
  };

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
});
