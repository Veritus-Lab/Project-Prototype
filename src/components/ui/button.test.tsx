import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("uses the primary brand style by default", () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole("button", { name: "Entrar" })).toHaveClass(
      "bg-brand",
    );
  });

  it.each([
    ["secondary", "button-secondary"],
    ["ghost", "button-ghost"],
  ] as const)("uses the %s style", (variant, className) => {
    render(<Button variant={variant}>Continuar</Button>);

    expect(screen.getByRole("button", { name: "Continuar" })).toHaveClass(
      className,
    );
  });

  it("forwards native button attributes", () => {
    render(<Button disabled>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });
});
