import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireRole: vi.fn(), listStudents: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/services/student.service", () => ({ listStudents: mocks.listStudents }));
vi.mock("@/components/dashboard/student-form", () => ({ StudentForm: () => <form aria-label="Cadastro de aluno" /> }));

import StudentsPage from "./page";

describe("StudentsPage", () => {
  it("shows administrative students without requiring a login", async () => {
    mocks.requireRole.mockResolvedValueOnce({});
    mocks.listStudents.mockResolvedValueOnce({ data: [{ id: "student-1", name: "Bia", email: null, phone: null }] });
    render(await StudentsPage());
    expect(mocks.requireRole).toHaveBeenCalledWith("socio", "professor");
    expect(screen.getByRole("form", { name: "Cadastro de aluno" })).toBeInTheDocument();
    expect(screen.getByText("Bia")).toBeInTheDocument();
    expect(screen.getByText("Sem contato informado")).toBeInTheDocument();
  }, 15_000);
});
