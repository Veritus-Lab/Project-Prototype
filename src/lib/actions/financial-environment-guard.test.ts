import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  markChargePaid: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireRole: vi.fn() }));
vi.mock("@/lib/environment/external-effects-policy", () => ({ assertLegacyFinancialMutationAllowed: mocks.guard }));
vi.mock("@/lib/services/financial.service", () => ({
  createSubscription: vi.fn(),
  markChargePaid: mocks.markChargePaid,
  updateSubscriptionStatus: vi.fn(),
}));

import { markChargePaidAction } from "./financial.actions";

describe("financial action environment guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stops a preview mutation before authentication or database access", async () => {
    mocks.guard.mockImplementation(() => { throw new Error("preview blocked"); });
    const formData = new FormData();
    formData.set("chargeId", "550e8400-e29b-41d4-a716-446655440003");

    await expect(markChargePaidAction({}, formData)).rejects.toThrow("preview blocked");
    expect(mocks.markChargePaid).not.toHaveBeenCalled();
  });
});
