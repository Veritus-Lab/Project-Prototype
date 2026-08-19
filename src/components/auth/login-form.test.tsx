import { render, screen } from "@testing-library/react";

import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("collects credentials and presents role selection as a visual preference only", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByRole("radiogroup", { name: "Como você acessa a plataforma?" }))
      .toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Atleta" })).not.toHaveAttribute("name");
    expect(screen.getByRole("radio", { name: "Treinador" })).not.toHaveAttribute("name");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
