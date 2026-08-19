import { render, screen } from "@testing-library/react";

import ConfirmEmailPage from "./page";

describe("ConfirmEmailPage", () => {
  it("shows a safe retry state when the confirmation link is invalid", async () => {
    render(
      await ConfirmEmailPage({
        searchParams: Promise.resolve({ erro: "link-invalido" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Não foi possível confirmar seu e-mail." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/link pode ter expirado ou já ter sido usado/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tentar novamente" })).toHaveAttribute(
      "href",
      "/cadastro",
    );
  });
});
