import { describe, expect, it } from "vitest";

import { timingSafeStringEqual } from "./timing-safe";

describe("timingSafeStringEqual", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeStringEqual("super-secret-token-123", "super-secret-token-123")).toBe(true);
    expect(timingSafeStringEqual("a", "a")).toBe(true);
  });

  it("returns false for different strings with the same length", () => {
    expect(timingSafeStringEqual("token-abc-123", "token-xyz-123")).toBe(false);
  });

  it("returns false for different strings with different lengths", () => {
    expect(timingSafeStringEqual("short", "much-longer-secret-token")).toBe(false);
    expect(timingSafeStringEqual("much-longer-secret-token", "short")).toBe(false);
  });

  it("returns false when inputs are null, undefined or empty", () => {
    expect(timingSafeStringEqual(null, "expected")).toBe(false);
    expect(timingSafeStringEqual(undefined, "expected")).toBe(false);
    expect(timingSafeStringEqual("received", null)).toBe(false);
    expect(timingSafeStringEqual("received", undefined)).toBe(false);
    expect(timingSafeStringEqual("", "expected")).toBe(false);
    expect(timingSafeStringEqual("received", "")).toBe(false);
    expect(timingSafeStringEqual("", "")).toBe(false);
  });
});
