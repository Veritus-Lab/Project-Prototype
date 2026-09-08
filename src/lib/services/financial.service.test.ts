import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createServerClient: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { createSubscription, financialStatus, markChargePaid, updateSubscriptionStatus } from "./financial.service";
import type { SessionUser } from "@/lib/auth/session";

const trainer = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "550e8400-e29b-41d4-a716-446655440002",
} satisfies SessionUser;

const subscriptionId = "550e8400-e29b-41d4-a716-446655440003";

function query(result: Record<string, unknown>, terminals: string[]) {
  const terminal = vi.fn().mockResolvedValue(result);
  const target: Record<string, unknown> = {};
  const proxy = new Proxy(target, {
    get: (_, property: string) => terminals.includes(property)
      ? terminal
      : vi.fn(() => proxy),
  });
  return { proxy, terminal };
}

describe("financial service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("labels unpaid overdue and due-soon charges", () => {
    expect(financialStatus({ dueDate: "2000-01-01", status: "aberta" })).toBe("vencida");
    expect(financialStatus({ dueDate: "2999-01-01", status: "paga" })).toBe("paga");
    expect(financialStatus({ dueDate: "2999-01-01", status: "aberta" })).toBe("em dia");
    expect(financialStatus({ dueDate: new Date().toISOString().slice(0, 10), status: "aberta" })).toBe("próximo do vencimento");
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

  it.each(["ativa", "suspensa", "isenta"] as const)("creates a %s subscription, its charge and audit", async (status) => {
    const athlete = query({ data: { id: "athlete-1" } }, ["maybeSingle"]);
    const subscription = query({ data: { id: subscriptionId }, error: null }, ["single"]);
    const charge = query({ data: { id: "charge-1" }, error: null }, ["single"]);
    const audit = query({ error: null }, ["insert"]);
    mocks.createServerClient.mockResolvedValue({ from: vi.fn((table: string) => ({
      atletas: athlete.proxy,
      assinaturas_atletas: subscription.proxy,
      cobrancas: charge.proxy,
      eventos_financeiros: audit.proxy,
    } as Record<string, unknown>)[table]) });

    await expect(createSubscription(trainer, {
      athleteId: "athlete-1", amountCents: 12000, periodicity: "mensal", dueDay: 31,
      paymentMethod: "pix", status, startDate: "2026-02-01",
    })).resolves.toEqual({ data: true });
    expect(charge.terminal).toHaveBeenCalledOnce();
  });

  it("handles subscription creation failures", async () => {
    const missing = query({ data: null }, ["maybeSingle"]);
    mocks.createServerClient.mockResolvedValue({ from: vi.fn(() => missing.proxy) });
    const input = { athleteId: "athlete-1", amountCents: 1, periodicity: "mensal" as const, dueDay: 1, status: "ativa" as const, startDate: "2026-01-01" };
    await expect(createSubscription(trainer, input)).resolves.toEqual({ error: "Atleta não encontrado." });

    const athlete = query({ data: { id: "athlete-1" } }, ["maybeSingle"]);
    const failed = query({ data: null, error: { message: "db" } }, ["single"]);
    mocks.createServerClient.mockResolvedValue({ from: vi.fn((table: string) => table === "atletas" ? athlete.proxy : failed.proxy) });
    await expect(createSubscription(trainer, input)).resolves.toEqual({ error: "Não foi possível criar a assinatura." });
  });

  it("marks a charge paid and audits the transition", async () => {
    const charge = query({ data: { id: "charge-1", atleta_id: "athlete-1", assinatura_id: subscriptionId }, error: null }, ["maybeSingle"]);
    const audit = query({ error: null }, ["insert"]);
    mocks.createServerClient.mockResolvedValue({ from: vi.fn((table: string) => table === "cobrancas" ? charge.proxy : audit.proxy) });
    await expect(markChargePaid(trainer, "charge-1")).resolves.toEqual({ data: true });

    const missing = query({ data: null, error: null }, ["maybeSingle"]);
    mocks.createServerClient.mockResolvedValue({ from: vi.fn(() => missing.proxy) });
    await expect(markChargePaid(trainer, "missing")).resolves.toEqual({ error: "Não foi possível registrar o pagamento." });
  });

  it("short-circuits unchanged status and reports update errors", async () => {
    const same = vi.fn().mockResolvedValue({ data: { id: subscriptionId, atleta_id: "athlete-1", status: "ativa" }, error: null });
    const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: same };
    mocks.createServerClient.mockResolvedValue({ from: vi.fn(() => chain) });
    await expect(updateSubscriptionStatus(trainer, { subscriptionId, status: "ativa" })).resolves.toEqual({ data: true });
  });
});
