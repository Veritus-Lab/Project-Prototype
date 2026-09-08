import { describe, expect, it } from "vitest";

import {
  assertSafeTestEnvironment,
  inspectSupabaseCliArgs,
  inspectTestEnvironment,
} from "./test-environment-guard";

const safeEnvironment = {
  APP_ENV: "test",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  EXTERNAL_INTEGRATIONS_MODE: "disabled",
};

describe("test environment guard", () => {
  it("accepts the disposable local Supabase stack", () => {
    expect(inspectTestEnvironment(safeEnvironment)).toEqual([]);
    expect(() => assertSafeTestEnvironment(safeEnvironment)).not.toThrow();
  });

  it("rejects the production project reference and host", () => {
    expect(() =>
      assertSafeTestEnvironment({
        ...safeEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: "https://hrmyqrekasuqhiqmqske.supabase.co",
      }),
    ).toThrow(/produção/i);
  });

  it("fails closed without an explicit app environment and Supabase target", () => {
    expect(inspectTestEnvironment({ NODE_ENV: "test" })).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/APP_ENV/),
        expect.stringMatching(/Supabase/i),
      ]),
    );
  });

  it("rejects service credentials, live integrations and public secrets", () => {
    const issues = inspectTestEnvironment({
      ...safeEnvironment,
      SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-role",
      EXTERNAL_INTEGRATIONS_MODE: "live",
      NEXT_PUBLIC_ASAAS_API_KEY: "synthetic-secret",
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/privilegiada/i),
        expect.stringMatching(/live/i),
        expect.stringMatching(/NEXT_PUBLIC/i),
      ]),
    );
  });

  it("accepts a declared non-production isolated Supabase project", () => {
    expect(
      inspectTestEnvironment({
        APP_ENV: "preview",
        NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
        TEST_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
        EXTERNAL_INTEGRATIONS_MODE: "sandbox",
      }),
    ).toEqual([]);
  });

  it("rejects a remote target that is not explicitly allow-listed", () => {
    expect(() =>
      assertSafeTestEnvironment({
        ...safeEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: "https://abcdefghijklmnopqrst.supabase.co",
      }),
    ).toThrow(/TEST_SUPABASE_PROJECT_REF/);
  });

  it("requires --local and rejects every remote Supabase CLI flag", () => {
    expect(inspectSupabaseCliArgs(["test", "db", "--local"])).toEqual([]);
    expect(inspectSupabaseCliArgs(["test", "db", "--linked"])).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/--local/),
        expect.stringMatching(/remota/),
      ]),
    );
  });
});
