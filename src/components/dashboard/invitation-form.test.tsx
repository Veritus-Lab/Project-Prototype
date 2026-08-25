import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InvitationForm } from "./invitation-form";

describe("InvitationForm", () => {
  it("collects the athlete email", () => {
    render(<InvitationForm />);

    expect(screen.getByLabelText("E-mail do atleta")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByRole("button", { name: "Gerar convite" })).toBeEnabled();
  });

  it("shows the one-time link when a new invitation was created", () => {
    render(
      <InvitationForm
        initialState={{
          createdEmail: "atleta@example.com",
          createdLink: "https://app.flernk.test/convite/raw_token",
        }}
      />,
    );

    expect(screen.getByText("Link criado para atleta@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Link do convite")).toHaveValue(
      "https://app.flernk.test/convite/raw_token",
    );
    expect(screen.getByRole("button", { name: "Copiar link" })).toBeEnabled();
  });
});
