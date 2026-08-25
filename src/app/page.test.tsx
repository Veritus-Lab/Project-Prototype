import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("renders the FLERNK product name", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: /flernk/i })).toBeInTheDocument();
});

it("links athlete and coach calls to action", () => {
  render(<HomePage />);

  expect(
    screen.getByRole("link", { name: /sou treinador/i }),
  ).toHaveAttribute("href", "/cadastro");
  expect(screen.getByRole("link", { name: /sou atleta/i })).toHaveAttribute(
    "href",
    "/login",
  );
});
