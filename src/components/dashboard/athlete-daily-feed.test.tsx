import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AthleteDailyFeedData } from "@/lib/services/athlete-feed.service";

vi.mock("@/components/dashboard/training-execution-form", () => ({
  TrainingExecutionForm: ({ assignmentId }: { assignmentId: string }) => (
    <button type="button">Executar {assignmentId}</button>
  ),
}));

import { AthleteDailyFeed } from "./athlete-daily-feed";

const todayFeed: AthleteDailyFeedData = {
  priority: {
    id: "assignment-today",
    title: "Intervalado 6x400m",
    detail: "Ritmo forte, com 200m de recuperacao.",
    when: "28/08/2026, 07:00",
    status: "atribuido",
    isToday: true,
    scheduledAt: "2026-08-28T10:00:00.000Z",
  },
  recent: [
    {
      id: "assignment-recent",
      title: "Rodagem leve",
      detail: "40 minutos em ritmo confortavel.",
      when: "27/08/2026, 18:00",
      status: "concluido",
      isToday: false,
      scheduledAt: "2026-08-27T21:00:00.000Z",
    },
  ],
};

describe("AthleteDailyFeed", () => {
  it("shows an empty state when no training is scheduled", () => {
    render(<AthleteDailyFeed feed={{ priority: null, recent: [] }} />);

    expect(screen.getByText("Nenhum treino programado")).toBeInTheDocument();
  });

  it("highlights today's training and retains its execution action", () => {
    render(<AthleteDailyFeed feed={todayFeed} />);

    expect(
      screen.getByRole("heading", { name: "Seu treino de hoje" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Intervalado 6x400m")).toBeInTheDocument();
    expect(screen.getByText("Atribuído")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Executar assignment-today" })).toBeInTheDocument();
    expect(screen.getByText("Rodagem leve")).toBeInTheDocument();
  });

  it("labels a future priority training as the next training", () => {
    render(
      <AthleteDailyFeed
        feed={{
          ...todayFeed,
          priority: { ...todayFeed.priority!, isToday: false },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Próximo treino" })).toBeInTheDocument();
  });
});
