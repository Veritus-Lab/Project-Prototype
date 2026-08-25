import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/services/auth.service", () => ({
  signOut: mocks.signOut,
}));

import { signOutAction } from "./actions";

describe("signOutAction", () => {
  it("signs out and redirects back to login", async () => {
    mocks.signOut.mockResolvedValueOnce(undefined);
    mocks.redirect.mockImplementationOnce((destination: string) => {
      throw new Error(`NEXT_REDIRECT:${destination}`);
    });

    await expect(signOutAction()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
