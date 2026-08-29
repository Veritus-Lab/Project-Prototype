import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTrainingAction: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/lib/actions/training.actions", () => ({
  createTrainingAction: mocks.createTrainingAction,
}));

import { TrainingForm } from "./training-form";

describe("TrainingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps a validation error visible when creation fails on the review step", async () => {
    mocks.createTrainingAction.mockResolvedValue({
      fieldErrors: { titulo: ["Informe um título com ao menos 2 caracteres."] },
    });
    const user = userEvent.setup();

    render(<TrainingForm trainingTypes={[]} />);

    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(screen.getByRole("button", { name: /criar treino/i }));

    expect(
      await screen.findByText("Informe um título com ao menos 2 caracteres."),
    ).toBeVisible();
  });

  it("submits the serialized blocks from the review step", async () => {
    const user = userEvent.setup();

    render(<TrainingForm trainingTypes={[]} />);

    await user.type(screen.getByLabelText("Título"), "Intervalado 6x400");
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    await user.click(screen.getByRole("button", { name: /continuar/i }));

    expect(
      screen.getByDisplayValue(
        JSON.stringify([
          {
            tipo: "principal",
            titulo: "Bloco 1",
            duracaoMinutos: 10,
          },
        ]),
      ),
    ).toHaveAttribute("name", "blocos");
  });
});
