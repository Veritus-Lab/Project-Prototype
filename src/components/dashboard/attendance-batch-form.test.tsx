import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/(dashboard)/treinador/calendario/attendance-actions", () => ({ recordAttendanceAction: vi.fn() }));
import { AttendanceBatchForm } from "./attendance-batch-form";

describe("AttendanceBatchForm", () => {
  it("offers one status control for every eligible student", () => {
    render(<AttendanceBatchForm meetingId="meeting-1" disabled={false} students={[{ id: "student-1", name: "Ana", status: "not_recorded" }, { id: "student-2", name: "Bia", status: "absent" }]} />);
    expect(screen.getByRole("heading", { name: "Chamada do encontro" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Situação de Ana" })).toHaveValue("present");
    expect(screen.getByRole("combobox", { name: "Situação de Bia" })).toHaveValue("absent");
    expect(screen.getByRole("button", { name: "Salvar chamada" })).toBeEnabled();
  });

  it("blocks a canceled meeting", () => {
    render(<AttendanceBatchForm meetingId="meeting-1" disabled students={[{ id: "student-1", name: "Ana", status: "not_recorded" }]} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/cancelado/i);
    expect(screen.getByRole("button", { name: "Salvar chamada" })).toBeDisabled();
  });
});
