import { render, screen } from "@testing-library/react";
import HomePage from "./page";

const instagramUrl = "https://www.instagram.com/flernk.assessoria?stkn=MTM3bjNsNXhwZ2M4Mg==";

it("renders the FLERNK product name", () => {
  render(<HomePage />);

  expect(screen.getAllByRole("link", { name: /flernk.*página inicial/i })).not.toHaveLength(0);
});

it("guides new runners to the FLERNK contact journey", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: /a chama que te move/i })).toBeInTheDocument();
  const contactLinks = [
    screen.getByRole("link", { name: /quero começar na flernk/i }),
    screen.getByRole("link", { name: /falar sobre uma turma/i }),
    screen.getByRole("link", { name: /falar com a flernk no instagram/i }),
  ];
  for (const link of contactLinks) {
    expect(link).toHaveAttribute("href", instagramUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  }
  expect(screen.getByRole("heading", { name: /o primeiro quilômetro também conta/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /encontre o ponto de partida/i })).toBeInTheDocument();
  expect(screen.getByText("Turma 1 · Iniciantes")).toBeInTheDocument();
  const studentLinks = screen.getAllByRole("link", { name: /já sou aluno/i });
  expect(studentLinks).not.toHaveLength(0);
  for (const link of studentLinks) {
    expect(link).toHaveAttribute("href", "/login");
  }
});
