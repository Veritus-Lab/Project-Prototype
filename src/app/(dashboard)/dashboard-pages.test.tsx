import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAthleteDashboardData: vi.fn(),
  getAthleteDailyFeed: vi.fn(),
  getTrainerDashboardData: vi.fn(),
  getTrainerPerformanceData: vi.fn(),
  getTrainerWeeklySchedule: vi.fn(),
  listTrainerBillingReminders: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

vi.mock("@/lib/services/dashboard.service", () => ({
  getAthleteDashboardData: mocks.getAthleteDashboardData,
  getTrainerDashboardData: mocks.getTrainerDashboardData,
}));

vi.mock("@/lib/services/athlete-feed.service", () => ({
  getAthleteDailyFeed: mocks.getAthleteDailyFeed,
}));

vi.mock("@/lib/services/trainer-calendar.service", () => ({
  getTrainerWeeklySchedule: mocks.getTrainerWeeklySchedule,
}));

vi.mock("@/lib/services/trainer-performance.service", () => ({
  getTrainerPerformanceData: mocks.getTrainerPerformanceData,
}));

vi.mock("@/lib/services/reminder-dashboard.service", () => ({
  listTrainerBillingReminders: mocks.listTrainerBillingReminders,
}));

import AtletaDashboard from "./atleta/page";
import TreinadorDashboard from "./treinador/page";

describe("dashboard pages", () => {
  it("renders trainer dashboard data from the dashboard service", async () => {
    const user = {
      id: "trainer-1",
      email: "treinador@example.com",
      nome: "Ana",
      papel: "treinador",
      assessoriaId: "assessoria-1",
    };
    mocks.requireRole.mockResolvedValueOnce(user);
    mocks.getTrainerDashboardData.mockResolvedValueOnce({
      metrics: [
        {
          label: "Atletas ativos",
          value: "4",
          hint: "Atletas vinculados à sua assessoria.",
        },
      ],
      trainings: [
        {
          id: "treino-1",
          titulo: "Tiro de 400m",
          quando: "Criado em 25/08/2026",
          detalhe: "8 x 400m",
        },
      ],
    });
    mocks.getTrainerWeeklySchedule.mockResolvedValueOnce({
      data: { days: [], timezone: "America/Sao_Paulo" },
    });
    mocks.getTrainerPerformanceData.mockResolvedValueOnce({
      data: {
        days: [],
        metrics: [
          {
            label: "Execuções concluídas",
            value: "2",
            hint: "Registros concluídos nesta semana.",
          },
        ],
        rpeAverage: null,
      },
    });
    mocks.listTrainerBillingReminders.mockResolvedValueOnce({ data: [] });

    render(await TreinadorDashboard());

    expect(mocks.requireRole).toHaveBeenCalledWith("treinador");
    expect(mocks.getTrainerDashboardData).toHaveBeenCalledWith(user);
    expect(screen.getByRole("heading", { name: "Olá, Ana" })).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Tiro de 400m")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calendário da semana" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ritmo da equipe nesta semana" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lembretes preparados" })).toBeInTheDocument();
    expect(screen.queryByText(/Dados de demonstração/i)).not.toBeInTheDocument();
  });

  it("renders athlete dashboard data from the dashboard service", async () => {
    const user = {
      id: "athlete-1",
      email: "atleta@example.com",
      nome: "Bia",
      papel: "atleta",
      assessoriaId: "assessoria-1",
    };
    mocks.requireRole.mockResolvedValueOnce(user);
    mocks.getAthleteDashboardData.mockResolvedValueOnce({
      metrics: [
        {
          label: "Treinos atribuídos",
          value: "5",
          hint: "Treinos vinculados ao seu perfil.",
        },
      ],
      trainings: [
        {
          id: "assignment-1",
          titulo: "Regenerativo",
          quando: "Atribuído em 25/08/2026",
          detalhe: "6km leve",
        },
      ],
    });
    mocks.getAthleteDailyFeed.mockResolvedValueOnce({
      data: {
        priority: null,
        recent: [],
      },
    });

    render(await AtletaDashboard());

    expect(mocks.requireRole).toHaveBeenCalledWith("atleta");
    expect(mocks.getAthleteDashboardData).toHaveBeenCalledWith(user);
    expect(mocks.getAthleteDailyFeed).toHaveBeenCalledWith(user);
    expect(screen.getByRole("heading", { name: "Olá, Bia" })).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Regenerativo")).toBeInTheDocument();
    expect(screen.queryByText(/Dados de demonstração/i)).not.toBeInTheDocument();
  });

  it("preserves athlete dashboard metrics when the daily feed fails", async () => {
    const user = {
      id: "athlete-2",
      email: "atleta2@example.com",
      nome: "Caio",
      papel: "atleta",
      assessoriaId: "assessoria-1",
    };
    mocks.requireRole.mockResolvedValueOnce(user);
    mocks.getAthleteDashboardData.mockResolvedValueOnce({
      metrics: [
        {
          label: "Treinos atribuídos",
          value: "3",
          hint: "Treinos vinculados ao seu perfil.",
        },
      ],
      trainings: [],
    });
    mocks.getAthleteDailyFeed.mockResolvedValueOnce({
      error: "Não foi possível carregar seu treino de hoje.",
    });

    render(await AtletaDashboard());

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar seu treino de hoje.",
    );
  });
});
