import { render, screen } from "@testing-library/react";

import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("collects credentials for the FLERNK management portal", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByText("Acesse a gestão da FLERNK com seus dados cadastrados.")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
