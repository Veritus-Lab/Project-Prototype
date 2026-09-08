import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  requireRole: vi.fn().mockResolvedValue({ id: "trainer" }),
  revalidatePath: vi.fn(),
  createSubscription: vi.fn(),
  markChargePaid: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
  saveCommunicationPreference: vi.fn(),
  queueBillingReminder: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/environment/external-effects-policy", () => ({
  assertLegacyFinancialMutationAllowed: mocks.guard,
}));
vi.mock("@/lib/services/financial.service", () => ({
  createSubscription: mocks.createSubscription,
  markChargePaid: mocks.markChargePaid,
  updateSubscriptionStatus: mocks.updateSubscriptionStatus,
}));
vi.mock("@/lib/services/communication.service", () => ({
  saveCommunicationPreference: mocks.saveCommunicationPreference,
  queueBillingReminder: mocks.queueBillingReminder,
}));

import {
  createSubscriptionAction,
  markChargePaidAction,
  updateSubscriptionStatusAction,
} from "./financial.actions";
import {
  queueBillingReminderAction,
  saveCommunicationPreferenceAction,
} from "./communication.actions";

const athleteId = "550e8400-e29b-41d4-a716-446655440001";
const entityId = "550e8400-e29b-41d4-a716-446655440002";

function form(values: Record<string, string>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("financial and communication actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({ id: "trainer" });
  });

  it("validates every action before invoking its service", async () => {
    await expect(createSubscriptionAction({}, new FormData())).resolves.toHaveProperty("fieldErrors");
    await expect(markChargePaidAction({}, new FormData())).resolves.toHaveProperty("fieldErrors");
    await expect(updateSubscriptionStatusAction({}, new FormData())).resolves.toHaveProperty("fieldErrors");
    await expect(saveCommunicationPreferenceAction({}, new FormData())).resolves.toHaveProperty("fieldErrors");
    await expect(queueBillingReminderAction({}, new FormData())).resolves.toHaveProperty("fieldErrors");
    expect(mocks.requireRole).not.toHaveBeenCalled();
  });

  it("creates a subscription and reports service errors", async () => {
    const data = form({ athleteId, amountCents: "15000", periodicity: "mensal", dueDay: "10", status: "ativa", startDate: "2026-09-01" });
    mocks.createSubscription.mockResolvedValueOnce({ data: true });
    await expect(createSubscriptionAction({}, data)).resolves.toEqual({ success: "Assinatura e primeira cobrança criadas." });
    mocks.createSubscription.mockResolvedValueOnce({ error: "falhou" });
    await expect(createSubscriptionAction({}, data)).resolves.toEqual({ error: "falhou" });
  });

  it("marks charges paid and changes subscription status", async () => {
    mocks.markChargePaid.mockResolvedValueOnce({ data: true });
    await expect(markChargePaidAction({}, form({ chargeId: entityId }))).resolves.toEqual({ success: "Pagamento registrado." });
    mocks.updateSubscriptionStatus.mockResolvedValueOnce({ data: true });
    await expect(updateSubscriptionStatusAction({}, form({ subscriptionId: entityId, status: "suspensa" }))).resolves.toEqual({ success: "Situação da assinatura atualizada." });
    mocks.markChargePaid.mockResolvedValueOnce({ error: "cobrança ausente" });
    await expect(markChargePaidAction({}, form({ chargeId: entityId }))).resolves.toEqual({ error: "cobrança ausente" });
  });

  it("saves consent and renders both reminder outcomes", async () => {
    const preference = form({ athleteId, phone: "5511999999999", whatsappOptIn: "true", billingWhatsapp: "true" });
    mocks.saveCommunicationPreference.mockResolvedValueOnce({ data: {} });
    await expect(saveCommunicationPreferenceAction({}, preference)).resolves.toEqual({ success: "Consentimento atualizado." });
    mocks.saveCommunicationPreference.mockResolvedValueOnce({ error: "falhou" });
    await expect(saveCommunicationPreferenceAction({}, preference)).resolves.toEqual({ error: "falhou" });

    const reminder = form({ chargeId: entityId, templateCode: "cobranca_vencida" });
    mocks.queueBillingReminder.mockResolvedValueOnce({ data: { status: "pendente" } });
    await expect(queueBillingReminderAction({}, reminder)).resolves.toEqual({ success: "Lembrete preparado. Nenhuma mensagem foi enviada." });
    mocks.queueBillingReminder.mockResolvedValueOnce({ data: { status: "bloqueado" } });
    await expect(queueBillingReminderAction({}, reminder)).resolves.toEqual({ success: "Lembrete bloqueado por falta de consentimento." });
    mocks.queueBillingReminder.mockResolvedValueOnce({ error: "duplicado" });
    await expect(queueBillingReminderAction({}, reminder)).resolves.toEqual({ error: "duplicado" });
  });
});
