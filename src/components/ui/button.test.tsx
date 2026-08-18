import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Button } from "@/components/ui/button";

it("uses the primary FLERNK style by default", () => {
  render(<Button>Entrar</Button>);

  expect(screen.getByRole("button", { name: "Entrar" })).toHaveClass(
    "bg-brand",
    "!text-ink",
  );
});

it("renders a secondary action without losing button semantics", () => {
  render(<Button variant="secondary">Conhecer recursos</Button>);

  expect(
    screen.getByRole("button", { name: "Conhecer recursos" }),
  ).toHaveClass("border-brand", "bg-transparent");
});

it("can style a Next link as a button", () => {
  render(
    <Button href="/cadastro" variant="ghost">
      Criar conta
    </Button>,
  );

  expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
    "href",
    "/cadastro",
  );
});
