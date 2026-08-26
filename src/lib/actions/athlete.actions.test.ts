import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  revalidatePath: vi.fn(),
  updateTrainerAthleteOperationalProfile: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("@/lib/services/athlete.service", () => ({
  updateTrainerAthleteOperationalProfile:
    mocks.updateTrainerAthleteOperationalProfile,
}));

import { updateAthleteOperationalProfileAction } from "./athlete.actions";
import { initialAthleteOperationalActionState } from "./athlete.state";

function formData(fields: Record<string, string>) {
  const data = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }

  return data;
}

describe("athlete operational actions", () => {
  it("returns field errors before calling the service", async () => {
    const result = await updateAthleteOperationalProfileAction(
      initialAthleteOperationalActionState,
      formData({
        athleteId: "atleta-invalido",
        telefone: "telefone<script>",
      }),
    );

    expect(result.fieldErrors?.athleteId?.[0]).toBe("Atleta inválido.");
    expect(result.fieldErrors?.telefone?.[0]).toBe("Telefone inválido.");
    expect(mocks.requireRole).not.toHaveBeenCalled();
    expect(mocks.updateTrainerAthleteOperationalProfile).not.toHaveBeenCalled();
  });

  it("updates operational data as the current trainer and revalidates the athlete detail", async () => {
    const user = {
      id: "trainer-1",
      email: "treinador@example.com",
      nome: "Ana",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    };
    mocks.requireRole.mockResolvedValueOnce(user);
    mocks.updateTrainerAthleteOperationalProfile.mockResolvedValueOnce({
      data: {
        telefone: "+55 11 99999-0000",
      },
    });

    await expect(
      updateAthleteOperationalProfileAction(
        initialAthleteOperationalActionState,
        formData({
          athleteId: "550e8400-e29b-41d4-a716-446655440000",
          telefone: "+55 11 99999-0000",
          objetivo: "Completar 10 km",
          nivel: "iniciante",
          dataNascimento: "1990-02-03",
          observacoesInternas: "Prefere treinos pela manhã.",
          contatoEmergenciaNome: "Maria",
          contatoEmergenciaTelefone: "+55 11 98888-0000",
        }),
      ),
    ).resolves.toEqual({ success: "Dados operacionais atualizados." });

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(mocks.updateTrainerAthleteOperationalProfile).toHaveBeenCalledWith(
      user,
      "550e8400-e29b-41d4-a716-446655440000",
      {
        telefone: "+55 11 99999-0000",
        objetivo: "Completar 10 km",
        nivel: "iniciante",
        dataNascimento: "1990-02-03",
        observacoesInternas: "Prefere treinos pela manhã.",
        contatoEmergenciaNome: "Maria",
        contatoEmergenciaTelefone: "+55 11 98888-0000",
      },
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/treinador/atletas/550e8400-e29b-41d4-a716-446655440000",
    );
  });
});
