import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvitationSignupForm } from "./invitation-signup-form";

describe("InvitationSignupForm", () => {
  it("collects athlete details for a valid invitation", () => {
    render(<InvitationSignupForm token="raw_token" maskedEmail="a***a@example.com" />);

    expect(screen.getByText("Convite para a***a@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Seu nome")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("E-mail do convite")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
    expect(screen.getByDisplayValue("raw_token")).toHaveAttribute("name", "token");
    expect(screen.getByRole("button", { name: "Criar acesso" })).toBeEnabled();
  });
});
