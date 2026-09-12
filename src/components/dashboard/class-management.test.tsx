import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  addClassMemberAction: vi.fn(),
  cancelClassMeetingAction: vi.fn(),
  createClassAction: vi.fn(),
  createClassMeetingAction: vi.fn(),
}));

vi.mock("@/app/(dashboard)/treinador/calendario/actions", () => actions);

import { ClassManagement } from "./class-management";

describe("ClassManagement", () => {
  it("groups students inside collapsed class panels instead of one long list", () => {
    render(
      <ClassManagement
        classes={[
          { id: "class-1", name: "Turma Adaptado" },
          { id: "class-2", name: "Turma 1 — Iniciantes" },
        ]}
        meetings={[]}
        students={[]}
        memberships={[
          { id: "member-1", class_id: "class-1", student_id: "student-1", enrollment_id: "enrollment-1", student_name: "Carly Costa" },
          { id: "member-2", class_id: "class-1", student_id: "student-2", enrollment_id: "enrollment-2", student_name: "Déborah Moreno" },
          { id: "member-3", class_id: "class-2", student_id: "student-3", enrollment_id: "enrollment-3", student_name: "Itamara" },
        ]}
      />,
    );

    const panels = document.querySelectorAll("details.class-overview-card");
    expect(panels).toHaveLength(2);
    expect([...panels].every((panel) => !panel.hasAttribute("open"))).toBe(true);
    expect(screen.getByText("2 alunos")).toBeInTheDocument();
    expect(screen.getByText("1 aluno")).toBeInTheDocument();
    expect(screen.getByText("alunos vinculados")).toBeInTheDocument();
  });
});
