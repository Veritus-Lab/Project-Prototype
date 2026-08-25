import { describe, expect, it } from "vitest";

import {
  createInvitationToken,
  getInvitationState,
  invitationExpiresAt,
} from "./token";

describe("invitation token domain", () => {
  it("creates a URL-safe token and SHA-256 hash", () => {
    const result = createInvitationToken();

    expect(result.token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.hash).not.toContain(result.token);
  });

  it("expires invitations exactly seven days after creation", () => {
    const createdAt = new Date("2026-08-24T12:00:00.000Z");

    expect(invitationExpiresAt(createdAt).toISOString()).toBe(
      "2026-08-31T12:00:00.000Z",
    );
  });

  it.each([
    [{ status: "pendente", expira_em: "2026-08-25T00:00:00.000Z" }, "active"],
    [{ status: "pendente", expira_em: "2026-08-23T23:59:59.000Z" }, "expired"],
    [
      {
        status: "pendente",
        expira_em: "2026-08-25T00:00:00.000Z",
        usado_em: "2026-08-24T12:00:00.000Z",
      },
      "used",
    ],
    [
      {
        status: "pendente",
        expira_em: "2026-08-25T00:00:00.000Z",
        revogado_em: "2026-08-24T12:00:00.000Z",
      },
      "revoked",
    ],
    [{ status: "aceito", expira_em: "2026-08-25T00:00:00.000Z" }, "used"],
    [{ status: "revogado", expira_em: "2026-08-25T00:00:00.000Z" }, "revoked"],
    [{ status: "expirado", expira_em: "2026-08-25T00:00:00.000Z" }, "expired"],
  ] as const)("maps invitation %o to %s", (invite, expectedState) => {
    expect(getInvitationState(invite, new Date("2026-08-24T00:00:00.000Z"))).toBe(
      expectedState,
    );
  });
});
