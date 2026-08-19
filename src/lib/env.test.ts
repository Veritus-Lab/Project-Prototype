import { getPublicEnv } from "./env";

describe("getPublicEnv", () => {
  it("rejects an invalid Supabase URL", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "invalid",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toThrow(/URL do Supabase/i);
  });

  it("rejects a non-HTTPS Supabase URL", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "http://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toThrow(/URL do Supabase/i);
  });

  it("rejects a missing publishable key", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toThrow(/chave publishable/i);
  });

  it("accepts a valid public Supabase configuration", () => {
    expect(
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabasePublishableKey: "sb_publishable_test",
    });
  });

  it("accepts a legacy JWT anon key", () => {
    expect(
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature",
      }),
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabasePublishableKey:
        "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature",
    });
  });
});
