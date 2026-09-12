import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("renders the FLERNK product name", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("link", { name: /flernk.*página inicial/i })).not.toHaveLength(0);
});

it("guides new runners to the FLERNK contact journey", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: /a chama que te move/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /quero começar na flernk/i })).toHaveAttribute(
    "href",
    "#contato",
  );
  const studentLinks = screen.getAllByRole("link", { name: /já sou aluno/i });
  expect(studentLinks).not.toHaveLength(0);
  for (const link of studentLinks) {
    expect(link).toHaveAttribute("href", "/login");
  }
});
