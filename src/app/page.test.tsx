import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import HomePage from "@/app/page";

it("presents FLERNK and the core product promise", () => {
  render(<HomePage />);

  expect(screen.getAllByLabelText("FLERNK - início")[0]).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /evolua.*supere.*alcance mais/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /tudo que você precisa em um só lugar/i }),
  ).toBeInTheDocument();
});

it("links athlete and coach calls to action to their approved journeys", () => {
  render(<HomePage />);

  const coachLinks = screen.getAllByRole("link", { name: /sou treinador/i });
  const athleteLinks = screen.getAllByRole("link", { name: /sou atleta/i });

  expect(coachLinks[0]).toHaveAttribute("href", "/cadastro");
  expect(athleteLinks[0]).toHaveAttribute("href", "/login");
  expect(screen.getAllByRole("link", { name: /entrar/i })[0]).toHaveAttribute(
    "href",
    "/login",
  );
});

it("exposes landmark navigation for the complete landing page", () => {
  render(<HomePage />);

  expect(screen.getByRole("navigation", { name: /principal/i })).toBeInTheDocument();
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /planos/i })[0]).toHaveAttribute(
    "href",
    "#planos",
  );
});
