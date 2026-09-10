import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireRole: mocks.requireRole,
}));

import ManagementDashboard from "./treinador/page";

describe("management dashboard", () => {
  it("shows the complete management areas for a partner", async () => {
    mocks.requireRole.mockResolvedValueOnce({
      id: "partner-1",
      email: "socio@example.com",
      nome: "Ana",
      papel: "treinador",
      role: "socio",
      assessoriaId: "assessoria-1",
    });

    render(await ManagementDashboard());

    expect(mocks.requireRole).toHaveBeenCalledWith("socio", "professor");
    expect(screen.getByRole("heading", { name: "Olá, Ana" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Financeiro/ })).toHaveAttribute("href", "/treinador/financeiro");
    expect(screen.getByRole("link", { name: /Equipe/ })).toHaveAttribute("href", "/treinador/equipe");
    expect(screen.queryByText(/treino/i)).not.toBeInTheDocument();
  });

  it("limits the professor to operational management", async () => {
    mocks.requireRole.mockResolvedValueOnce({
      id: "professor-1",
      email: "professor@example.com",
      nome: "Bia",
      papel: "treinador",
      role: "professor",
      assessoriaId: "assessoria-1",
    });

    render(await ManagementDashboard());

    expect(screen.getByRole("link", { name: /Alunos/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Financeiro/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Equipe/ })).not.toBeInTheDocument();
  });
});
