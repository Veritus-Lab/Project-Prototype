import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listTrainerAthletes: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("@/lib/services/athlete.service", () => ({
  listTrainerAthletes: mocks.listTrainerAthletes,
}));

import TrainerAthletesPage from "./page";

describe("TrainerAthletesPage", () => {
  it("renders athletes loaded from the service", async () => {
    const user = {
      id: "trainer-1",
      email: "treinador@example.com",
      nome: "Ana",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    };
    mocks.requireRole.mockResolvedValueOnce(user);
    mocks.listTrainerAthletes.mockResolvedValueOnce({
      data: [
        {
          id: "athlete-1",
          nome: "Bia Corredora",
          vinculo: "Vinculado a você",
          criadoEm: "25/08/2026",
        },
      ],
    });

    render(await TrainerAthletesPage());

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(mocks.listTrainerAthletes).toHaveBeenCalledWith(user);
    expect(screen.getByRole("heading", { name: "Atletas" })).toBeInTheDocument();
    expect(screen.getByText("Bia Corredora")).toBeInTheDocument();
    expect(screen.getByText("Vinculado a você")).toBeInTheDocument();
  });

  it("renders an empty state when there are no athletes yet", async () => {
    mocks.requireRole.mockResolvedValueOnce({
      id: "trainer-1",
      email: "treinador@example.com",
      nome: "Ana",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    });
    mocks.listTrainerAthletes.mockResolvedValueOnce({ data: [] });

    render(await TrainerAthletesPage());

    expect(screen.getByText("Nenhum atleta vinculado ainda.")).toBeInTheDocument();
  });
});
