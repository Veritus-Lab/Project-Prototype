import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireRole: vi.fn(), rpc: vi.fn(), server: vi.fn(), token: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/environment/external-effects-policy", () => ({ assertApplicationMutationAllowed: vi.fn() }));
vi.mock("@/lib/invitations/token", () => ({ createInvitationToken: mocks.token }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: mocks.server }));

import { createStudentAccessInvitation } from "./student-invitation.service";

describe("student access invitation", () => {
  it("creates a student-specific invitation without creating an enrollment", async () => {
    mocks.requireRole.mockResolvedValue({});
    mocks.token.mockReturnValue({ token: "student-token", hash: "token-hash" });
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.server.mockResolvedValue({ rpc: mocks.rpc });

    const result = await createStudentAccessInvitation("11111111-1111-4111-8111-111111111111");

    expect(mocks.requireRole).toHaveBeenCalledWith("socio");
    expect(mocks.rpc).toHaveBeenCalledWith("create_student_invitation", {
      target_student_id: "11111111-1111-4111-8111-111111111111", token_hash_input: "token-hash",
    });
    expect(result).toMatchObject({ data: { invitationUrl: expect.stringContaining("/convite/aluno/student-token") } });
  });
});
