import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireRole: vi.fn(), listStudents: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/services/student.service", () => ({ listStudents: mocks.listStudents }));
vi.mock("@/components/dashboard/student-form", () => ({ StudentForm: () => <form aria-label="Cadastro de aluno" /> }));

import StudentsPage from "./page";

describe("StudentsPage", () => {
  it("shows administrative students without requiring a login for the student", async () => {
    mocks.requireRole.mockResolvedValueOnce({ role: "socio" });
    mocks.listStudents.mockResolvedValueOnce({ data: [{ id: "student-1", name: "Bia", email: null, phone: null }] });
    render(await StudentsPage({ searchParams: Promise.resolve({ buscar: "bia" }) }));
    expect(mocks.requireRole).toHaveBeenCalledWith("socio", "professor");
    expect(mocks.listStudents).toHaveBeenCalledWith("bia");
    expect(screen.getByRole("form", { name: "Cadastro de aluno" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar aluno" })).toHaveValue("bia");
    expect(screen.getByText("Bia")).toBeInTheDocument();
    expect(screen.getByText("Sem contato informado")).toBeInTheDocument();
  }, 15_000);

  it("lets a professor consult the list without commercial controls", async () => {
    mocks.requireRole.mockResolvedValueOnce({ role: "professor" });
    mocks.listStudents.mockResolvedValueOnce({ data: [{ id: "student-1", name: "Bia", email: null, phone: null, enrollment: null }] });
    render(await StudentsPage());
    expect(screen.queryByRole("form", { name: "Cadastro de aluno" })).not.toBeInTheDocument();
    expect(screen.queryByText(/criar matrícula/i)).not.toBeInTheDocument();
  }, 15_000);
});
