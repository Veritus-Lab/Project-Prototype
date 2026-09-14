import { describe, expect, it } from "vitest";
import { firstBillingDueDate, isBillingActiveOn } from "@/lib/billing/cycle";

describe("firstBillingDueDate", () => {
  it("uses the last valid day in short months", () => expect(firstBillingDueDate("2026-02-01", 31, "monthly")).toBe("2026-02-28"));
  it("moves to the next contractual cycle when the start is after the due day", () => expect(firstBillingDueDate("2026-09-20", 10, "monthly")).toBe("2026-10-10"));
  it("keeps the configured periodicity when moving the first cycle", () => expect(firstBillingDueDate("2026-09-20", 10, "quarterly")).toBe("2026-12-10"));
  it("preserves a paused interval after a later reactivation", () => {
    const changes = [{ effectiveOn: "2026-04-01", status: "paused" }, { effectiveOn: "2026-07-01", status: "active" }];
    expect(isBillingActiveOn("2026-01-01", "2026-06-10", changes)).toBe(false);
    expect(isBillingActiveOn("2026-01-01", "2026-07-10", changes)).toBe(true);
  });
});
