import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  assertApplicationMutationAllowed: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createServerClient: mocks.createServerClient }));
vi.mock("@/lib/environment/external-effects-policy", () => ({
  assertApplicationMutationAllowed: mocks.assertApplicationMutationAllowed,
}));

import { createAccountAndAcceptTeamInvitation } from "./team-invitation.service";

describe("team invitation account provisioning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.flernk.test");
  });

  it("creates an account only through an invitation and accepts it with the persisted role", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { id: "member-1" }, session: { access_token: "session" } },
      error: null,
    });
    mocks.createServerClient.mockResolvedValue({ auth: { signUp }, rpc });

    await expect(createAccountAndAcceptTeamInvitation({
      token: "team-invitation-token",
      nome: "Professora FLERNK",
      email: "PROFESSORA@EXAMPLE.COM",
      senha: "Segura123",
    })).resolves.toEqual({ data: { confirmationRequired: false } });

    expect(signUp).toHaveBeenCalledWith({
      email: "professora@example.com",
      password: "Segura123",
      options: {
        emailRedirectTo: "https://app.flernk.test/auth/callback?convite_equipe=team-invitation-token&nome=Professora+FLERNK",
        data: { nome: "Professora FLERNK" },
      },
    });
    expect(rpc).toHaveBeenCalledWith("accept_team_invitation", {
      invitation_token: "team-invitation-token",
      member_name: "Professora FLERNK",
    });
  });

  it("waits for email confirmation before linking a newly created account", async () => {
    const rpc = vi.fn();
    const signUp = vi.fn().mockResolvedValue({ data: { user: { id: "member-1" }, session: null }, error: null });
    mocks.createServerClient.mockResolvedValue({ auth: { signUp }, rpc });

    await expect(createAccountAndAcceptTeamInvitation({
      token: "team-invitation-token",
      nome: "Sócia FLERNK",
      email: "socia@example.com",
      senha: "Segura123",
    })).resolves.toEqual({ data: { confirmationRequired: true } });
    expect(rpc).not.toHaveBeenCalled();
  });
});
