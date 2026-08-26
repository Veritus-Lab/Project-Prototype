import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getTrainerAthleteDetail: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("@/lib/services/athlete.service", () => ({
  getTrainerAthleteDetail: mocks.getTrainerAthleteDetail,
}));

import TrainerAthleteDetailPage from "./page";

describe("TrainerAthleteDetailPage", () => {
  it("renders the current trainer athlete detail", async () => {
    const user = {
      id: "trainer-1",
      email: "treinador@example.com",
      nome: "Ana",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    };
    mocks.requireRole.mockResolvedValueOnce(user);
    mocks.getTrainerAthleteDetail.mockResolvedValueOnce({
      data: {
        id: "athlete-1",
        nome: "Bia Corredora",
        vinculo: "Vinculado a você",
        criadoEm: "25/08/2026",
        perfilOperacional: {
          telefone: "+55 11 99999-0000",
          observacoesInternas: "Prefere treinos pela manhã.",
          objetivo: "Completar 10 km",
          nivel: "iniciante",
          dataNascimento: "1990-02-03",
          contatoEmergenciaNome: "Maria",
          contatoEmergenciaTelefone: "+55 11 98888-0000",
          atualizadoEm: "26/08/2026",
        },
        treinosRecentes: [
          {
            id: "assignment-1",
            titulo: "Longão leve",
            quando: "Atribuído em 26/08/2026",
            detalhe: "Zona 2 com final confortável",
            status: "Atribuído",
          },
        ],
      },
    });

    render(
      await TrainerAthleteDetailPage({
        params: Promise.resolve({ id: "athlete-1" }),
      }),
    );

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(mocks.getTrainerAthleteDetail).toHaveBeenCalledWith(
      user,
      "athlete-1",
    );
    expect(screen.getByRole("heading", { name: "Bia Corredora" })).toBeInTheDocument();
    expect(screen.getByText("Entrada em 25/08/2026")).toBeInTheDocument();
    expect(screen.getByText("Longão leve")).toBeInTheDocument();
    expect(screen.getByText("Zona 2 com final confortável")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dados operacionais" })).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toHaveValue("+55 11 99999-0000");
    expect(screen.getByLabelText("Objetivo")).toHaveValue("Completar 10 km");
    expect(screen.getByLabelText("Nível")).toHaveValue("iniciante");
    expect(screen.getByLabelText("Observações internas")).toHaveValue(
      "Prefere treinos pela manhã.",
    );
  });

  it("renders a generic not found state for missing or denied athlete", async () => {
    mocks.requireRole.mockResolvedValueOnce({
      id: "trainer-1",
      email: "treinador@example.com",
      nome: "Ana",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    });
    mocks.getTrainerAthleteDetail.mockResolvedValueOnce({
      error: "Atleta não encontrado.",
    });

    render(
      await TrainerAthleteDetailPage({
        params: Promise.resolve({ id: "athlete-2" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "Atleta não encontrado" })).toBeInTheDocument();
    expect(screen.getByText("Verifique a lista de atletas e tente novamente.")).toBeInTheDocument();
  });
});
