import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionUser } from "@/lib/auth/session";

const mocks = vi.hoisted(() => ({ createServerClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient: mocks.createServerClient }));

import { queueBillingReminder, saveCommunicationPreference } from "./communication.service";

const trainer = {
  id: "trainer-1",
  email: "trainer@example.com",
  nome: "Trainer",
  papel: "treinador",
  assessoriaId: "org-1",
} satisfies SessionUser;

function query(result: Record<string, unknown>) {
  const terminal = vi.fn().mockResolvedValue(result);
  const target: Record<string, unknown> = {};
  const proxy = new Proxy(target, {
    get: (_, property: string) => {
      if (["maybeSingle", "single", "gte", "upsert", "insert"].includes(property)) return terminal;
      return vi.fn(() => proxy);
    },
  });
  return { proxy, terminal };
}

describe("communication service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves opted-in billing consent in the authenticated tenant", async () => {
    const athlete = query({ data: { id: "athlete-1" }, error: null });
    const preference = query({ error: null });
    const from = vi.fn((table: string) => table === "atletas" ? athlete.proxy : preference.proxy);
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(saveCommunicationPreference(trainer, {
      athleteId: "athlete-1", phone: "5511999999999", whatsappOptIn: "true", billingWhatsapp: "true",
    })).resolves.toEqual({ data: {} });
    expect(preference.terminal).toHaveBeenCalledWith(expect.objectContaining({
      assessoria_id: "org-1", atleta_id: "athlete-1", whatsapp_opt_in: true, cobranca_whatsapp: true,
    }), { onConflict: "assessoria_id,atleta_id" });
  });

  it("rejects an unavailable athlete and reports persistence errors", async () => {
    const missing = query({ data: null, error: null });
    mocks.createServerClient.mockResolvedValue({ from: vi.fn(() => missing.proxy) });
    await expect(saveCommunicationPreference(trainer, {
      athleteId: "missing", whatsappOptIn: "false", billingWhatsapp: "false",
    })).resolves.toEqual({ error: "Atleta não encontrado." });

    const athlete = query({ data: { id: "athlete-1" } });
    const failed = query({ error: { message: "db" } });
    mocks.createServerClient.mockResolvedValue({ from: vi.fn((table: string) => table === "atletas" ? athlete.proxy : failed.proxy) });
    await expect(saveCommunicationPreference(trainer, {
      athleteId: "athlete-1", whatsappOptIn: "false", billingWhatsapp: "true",
    })).resolves.toEqual({ error: "Não foi possível salvar o consentimento." });
  });

  it.each([
    [{ whatsapp_opt_in: true, cobranca_whatsapp: true, whatsapp_telefone: "5511999999999" }, "pendente"],
    [{ whatsapp_opt_in: false, cobranca_whatsapp: false, whatsapp_telefone: null }, "bloqueado"],
  ] as const)("queues a consent-aware reminder", async (preferenceData, expectedStatus) => {
    const charge = query({ data: { id: "charge-1", atleta_id: "athlete-1" } });
    const recent = query({ count: 0 });
    const preference = query({ data: preferenceData });
    const inserted = query({ error: null });
    let reminderCall = 0;
    const from = vi.fn((table: string) => {
      if (table === "cobrancas") return charge.proxy;
      if (table === "preferencias_comunicacao") return preference.proxy;
      if (table === "lembretes_cobranca") return reminderCall++ === 0 ? recent.proxy : inserted.proxy;
      throw new Error(table);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(queueBillingReminder(trainer, "charge-1", "cobranca_vencida")).resolves.toEqual({ data: { status: expectedStatus } });
    expect(inserted.terminal).toHaveBeenCalledWith(expect.objectContaining({ status: expectedStatus }));
  });

  it("stops missing or duplicate reminders before insert", async () => {
    const missing = query({ data: null });
    mocks.createServerClient.mockResolvedValue({ from: vi.fn(() => missing.proxy) });
    await expect(queueBillingReminder(trainer, "missing", "cobranca_vencida")).resolves.toEqual({ error: "Cobrança não encontrada." });

    const charge = query({ data: { id: "charge-1", atleta_id: "athlete-1" } });
    const recent = query({ count: 1 });
    mocks.createServerClient.mockResolvedValue({ from: vi.fn((table: string) => table === "cobrancas" ? charge.proxy : recent.proxy) });
    await expect(queueBillingReminder(trainer, "charge-1", "cobranca_vencida")).resolves.toEqual({ error: "Já existe um lembrete criado para este atleta nas últimas 24 horas." });
  });
});
