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
    expect(screen.getByRole("button", { name: "Enviar convite" })).toBeEnabled();
  });

  it("confirms that the invitation was sent without exposing its private link", () => {
    render(
      <InvitationForm
        initialState={{
          createdEmail: "atleta@example.com",
        }}
      />,
    );

    expect(screen.getByText("Convite enviado para atleta@example.com.")).toBeInTheDocument();
    expect(screen.queryByText(/convite\//i)).not.toBeInTheDocument();
  });
});
