import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  requireRole: vi.fn(),
  createInvitationToken: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("@/lib/invitations/token", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/invitations/token")>();

  return {
    ...actual,
    createInvitationToken: mocks.createInvitationToken,
  };
});

import {
  createInvitation,
  listInvitations,
  revokeInvitation,
} from "./invitation.service";

function createSupabaseMock(updateMode: "duplicate" | "revoke" = "duplicate") {
  const updateDuplicatesEq = vi.fn();
  const updateDuplicatesGt = vi.fn();
  const updateDuplicatesIsRevoked = vi.fn();
  const updateDuplicatesIsUsed = vi.fn();
  const updateDuplicatesEqStatus = vi.fn();
  const updateDuplicatesEqEmail = vi.fn();
  const updateDuplicatesEqAssessoria = vi.fn();

  updateDuplicatesGt.mockResolvedValue({ error: null });
  updateDuplicatesIsRevoked.mockReturnValue({ gt: updateDuplicatesGt });
  updateDuplicatesIsUsed.mockReturnValue({ is: updateDuplicatesIsRevoked });
  updateDuplicatesEqStatus.mockReturnValue({ is: updateDuplicatesIsUsed });
  updateDuplicatesEqEmail.mockReturnValue({ eq: updateDuplicatesEqStatus });
  updateDuplicatesEqAssessoria.mockReturnValue({ eq: updateDuplicatesEqEmail });

  const revokeDuplicates = {
    eq: updateDuplicatesEqAssessoria,
  };

  const insertSelect = vi.fn();
  const insertSingle = vi.fn();
  insertSingle.mockResolvedValue({
    data: {
      id: "invite-1",
      email: "atleta@example.com",
      status: "pendente",
      expira_em: "2026-08-31T12:00:00.000Z",
      created_at: "2026-08-24T12:00:00.000Z",
      usado_em: null,
      revogado_em: null,
    },
    error: null,
  });
  insertSelect.mockReturnValue({ single: insertSingle });

  const insert = vi.fn().mockReturnValue({ select: insertSelect });

  const listOrder = vi.fn();
  const listEqTrainer = vi.fn();
  const listEqAssessoria = vi.fn();
  listOrder.mockResolvedValue({
    data: [
      {
        id: "invite-1",
        email: "ativo@example.com",
        status: "pendente",
        expira_em: "2026-08-31T12:00:00.000Z",
        usado_em: null,
        revogado_em: null,
        created_at: "2026-08-24T12:00:00.000Z",
      },
      {
        id: "invite-2",
        email: "usado@example.com",
        status: "aceito",
        expira_em: "2026-08-31T12:00:00.000Z",
        usado_em: "2026-08-24T13:00:00.000Z",
        revogado_em: null,
        created_at: "2026-08-24T11:00:00.000Z",
      },
    ],
    error: null,
  });
  listEqTrainer.mockReturnValue({ order: listOrder });
  listEqAssessoria.mockReturnValue({ eq: listEqTrainer });
  const select = vi.fn().mockReturnValue({ eq: listEqAssessoria });

  const revokeEqId = vi.fn();
  const revokeEqTrainer = vi.fn();
  const revokeEqAssessoria = vi.fn();
  revokeEqId.mockResolvedValue({ error: null });
  revokeEqTrainer.mockReturnValue({ eq: revokeEqId });
  revokeEqAssessoria.mockReturnValue({ eq: revokeEqTrainer });

  const revoke = {
    eq: revokeEqAssessoria,
  };

  const update = vi.fn(() => (updateMode === "revoke" ? revoke : revokeDuplicates));

  const from = vi.fn(() => ({ update, insert, select }));

  return {
    from,
    insert,
    select,
    listEqAssessoria,
    listEqTrainer,
    listOrder,
    update,
    updateDuplicatesEqAssessoria,
    updateDuplicatesEqEmail,
    updateDuplicatesEqStatus,
    updateDuplicatesIsUsed,
    updateDuplicatesIsRevoked,
    updateDuplicatesGt,
    revokeEqAssessoria,
    revokeEqTrainer,
    revokeEqId,
  };
}

describe("invitation service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T12:00:00.000Z"));
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.flernk.test");
    mocks.requireRole.mockResolvedValue({
      id: "trainer-1",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    });
    mocks.createInvitationToken.mockReturnValue({
      token: "raw_url_safe_token",
      hash: "a".repeat(64),
    });
  });

  it("creates an invitation for the current trainer and returns the raw link only once", async () => {
    const supabase = createSupabaseMock();
    mocks.createServerClient.mockResolvedValue(supabase);

    await expect(createInvitation(" Atleta@Example.COM ")).resolves.toEqual({
      data: expect.objectContaining({
        id: "invite-1",
        email: "atleta@example.com",
        link: "https://app.flernk.test/convite/raw_url_safe_token",
        state: "active",
      }),
    });

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(supabase.updateDuplicatesEqAssessoria).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(supabase.updateDuplicatesEqAssessoria).toHaveBeenCalledOnce();
    expect(supabase.updateDuplicatesEqEmail).toHaveBeenCalledWith(
      "email",
      "atleta@example.com",
    );
    expect(supabase.updateDuplicatesEqStatus).toHaveBeenCalledWith(
      "status",
      "pendente",
    );
    expect(supabase.updateDuplicatesIsUsed).toHaveBeenCalledWith("usado_em", null);
    expect(supabase.updateDuplicatesIsRevoked).toHaveBeenCalledWith(
      "revogado_em",
      null,
    );
    expect(supabase.updateDuplicatesGt).toHaveBeenCalledWith(
      "expira_em",
      "2026-08-24T12:00:00.000Z",
    );
    expect(supabase.insert).toHaveBeenCalledWith({
      assessoria_id: "assessoria-1",
      treinador_id: "trainer-1",
      email: "atleta@example.com",
      token_hash: "a".repeat(64),
      expira_em: "2026-08-31T12:00:00.000Z",
    });
  });

  it("rejects invalid invitation email before writing to Supabase", async () => {
    const supabase = createSupabaseMock();
    mocks.createServerClient.mockResolvedValue(supabase);

    await expect(createInvitation("email-invalido")).resolves.toEqual({
      error: "Informe um e-mail válido para o convite.",
    });

    expect(supabase.insert).not.toHaveBeenCalled();
    expect(mocks.createInvitationToken).not.toHaveBeenCalled();
  });

  it("revokes an invitation from the current trainer assessment only", async () => {
    const supabase = createSupabaseMock("revoke");
    mocks.createServerClient.mockResolvedValue(supabase);

    await expect(revokeInvitation("invite-1")).resolves.toEqual({ data: undefined });

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(supabase.revokeEqAssessoria).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(supabase.revokeEqTrainer).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(supabase.revokeEqId).toHaveBeenCalledWith("id", "invite-1");
  });

  it("lists invitations from the current trainer without raw links", async () => {
    const supabase = createSupabaseMock();
    mocks.createServerClient.mockResolvedValue(supabase);

    await expect(listInvitations()).resolves.toEqual({
      data: [
        expect.objectContaining({
          id: "invite-1",
          email: "ativo@example.com",
          state: "active",
        }),
        expect.objectContaining({
          id: "invite-2",
          email: "usado@example.com",
          state: "used",
        }),
      ],
    });

    expect(supabase.select).toHaveBeenCalledWith(
      "id, email, status, expira_em, usado_em, revogado_em, created_at",
    );
    expect(supabase.listEqAssessoria).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(supabase.listEqTrainer).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(supabase.listOrder).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });
});
