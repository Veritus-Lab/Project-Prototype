import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import HomePage from "@/app/page";

it("renders the FLERNK product name", () => {
  render(<HomePage />);

  expect(screen.getByRole("heading", { name: /flernk/i })).toBeInTheDocument();
});
