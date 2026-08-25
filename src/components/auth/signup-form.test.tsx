import { render, screen } from "@testing-library/react";

import { SignupForm } from "./signup-form";

describe("SignupForm", () => {
  it("collects the information required to register a trainer", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Seu nome")).toHaveAttribute(
      "autocomplete",
      "name",
    );
    expect(screen.getByLabelText("Nome da assessoria")).toHaveAttribute(
      "autocomplete",
      "organization",
    );
    expect(screen.getByLabelText("E-mail profissional")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByRole("button", { name: "Criar minha conta" })).toBeEnabled();
  });
});
