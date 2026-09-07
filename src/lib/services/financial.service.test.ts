import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerClient: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { financialStatus, updateSubscriptionStatus } from "./financial.service";
import type { SessionUser } from "@/lib/auth/session";

const trainer = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "550e8400-e29b-41d4-a716-446655440002",
} satisfies SessionUser;

const subscriptionId = "550e8400-e29b-41d4-a716-446655440003";

describe("financial service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("labels unpaid overdue and due-soon charges", () => {
    expect(financialStatus({ dueDate: "2000-01-01", status: "aberta" })).toBe("vencida");
    expect(financialStatus({ dueDate: "2999-01-01", status: "paga" })).toBe("paga");
  });

  it("updates only a subscription in the authenticated tenant and records its audit event", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: subscriptionId, atleta_id: "athlete-1", status: "ativa" },
      error: null,
    });
    const idEq = vi.fn().mockReturnValue({ maybeSingle });
    const tenantEq = vi.fn().mockReturnValue({ eq: idEq });
    const select = vi.fn().mockReturnValue({ eq: tenantEq });
    const updateIdEq = vi.fn().mockResolvedValue({ error: null });
    const updateTenantEq = vi.fn().mockReturnValue({ eq: updateIdEq });
    const update = vi.fn().mockReturnValue({ eq: updateTenantEq });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => {
      if (table === "assinaturas_atletas") return { select, update };
      if (table === "eventos_financeiros") return { insert };
      throw new Error(`unexpected table ${table}`);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(updateSubscriptionStatus(trainer, { subscriptionId, status: "suspensa" })).resolves.toEqual({ data: true });

    expect(tenantEq).toHaveBeenCalledWith("assessoria_id", trainer.assessoriaId);
    expect(updateTenantEq).toHaveBeenCalledWith("assessoria_id", trainer.assessoriaId);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      assessoria_id: trainer.assessoriaId,
      atleta_id: "athlete-1",
      ator_id: trainer.id,
      tipo: "status_assinatura_atualizado",
      detalhes: { status_anterior: "ativa", status_novo: "suspensa" },
    }));
  });

  it("does not update a subscription the tenant cannot read", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const idEq = vi.fn().mockReturnValue({ maybeSingle });
    const tenantEq = vi.fn().mockReturnValue({ eq: idEq });
    const select = vi.fn().mockReturnValue({ eq: tenantEq });
    const update = vi.fn();
    const from = vi.fn(() => ({ select, update }));
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(updateSubscriptionStatus(trainer, { subscriptionId, status: "cancelada" })).resolves.toEqual({ error: "Assinatura não encontrada." });
    expect(update).not.toHaveBeenCalled();
  });
});
