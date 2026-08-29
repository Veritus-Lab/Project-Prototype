import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import { listTrainerBillingReminders } from "./reminder-dashboard.service";
import type { SessionUser } from "@/lib/auth/session";

const trainerUser = {
  id: "trainer-1",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

function assessoriaQuery() {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { timezone: "America/Sao_Paulo" },
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });

  return { eq, maybeSingle, select };
}

function athleteQuery() {
  const trainerEq = vi.fn().mockResolvedValue({
    data: [{ id: "athlete-1", profiles: { nome: "Bia" } }],
    error: null,
  });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, select, trainerEq };
}

function reminderQuery() {
  const limit = vi.fn().mockResolvedValue({
    data: [
      {
        id: "reminder-1",
        atleta_id: "athlete-1",
        programado_para: "2026-08-28T14:00:00.000Z",
        status: "pendente",
        template_codigo: "cobranca_vencida",
      },
      {
        id: "reminder-outside",
        atleta_id: "outside-athlete",
        programado_para: "2026-08-28T14:00:00.000Z",
        status: "pendente",
        template_codigo: "cobranca_vencida",
      },
    ],
    error: null,
  });
  const order = vi.fn().mockReturnValue({ limit });
  const inAthletes = vi.fn().mockReturnValue({ order });
  const assessoriaEq = vi.fn().mockReturnValue({ in: inAthletes });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return { assessoriaEq, inAthletes, limit, order, select };
}

describe("reminder dashboard service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only reminders for athletes linked to the current trainer", async () => {
    const assessoria = assessoriaQuery();
    const athletes = athleteQuery();
    const reminders = reminderQuery();
    const from = vi.fn((table: string) => {
      if (table === "assessorias") return assessoria;
      if (table === "atletas") return athletes;
      if (table === "lembretes_cobranca") return reminders;
      throw new Error(`unexpected table ${table}`);
    });
    mocks.createServerClient.mockResolvedValue({ from });

    await expect(listTrainerBillingReminders(trainerUser)).resolves.toEqual({
      data: [
        {
          athleteId: "athlete-1",
          athleteName: "Bia",
          id: "reminder-1",
          scheduledFor: "28/08/2026, 11:00",
          status: "Pendente",
          template: "Cobrança vencida",
        },
      ],
    });

    expect(athletes.assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(athletes.trainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(reminders.assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(reminders.inAthletes).toHaveBeenCalledWith("atleta_id", ["athlete-1"]);
    expect(reminders.limit).toHaveBeenCalledWith(6);
  });
});
