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
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.c2lnbmF0dXJl",
      }),
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabasePublishableKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.c2lnbmF0dXJl",
    });
  });

  it("accepts base64url characters in a legacy JWT signature", () => {
    expect(
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.-_8",
      }),
    ).toEqual({
      supabaseUrl: "https://project.supabase.co",
      supabasePublishableKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.-_8",
    });
  });

  it("rejects a legacy JWT anon key with an invalid header", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "not-a-json-header.eyJyb2xlIjoiYW5vbiJ9.c2lnbmF0dXJl",
      }),
    ).toThrow(/chave publishable/i);
  });

  it("rejects a legacy JWT anon key with an invalid signature", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.invalid!",
      }),
    ).toThrow(/chave publishable/i);
  });

  it("reads public Supabase values from process.env by default", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://default.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_default");

    try {
      expect(getPublicEnv()).toEqual({
        supabaseUrl: "https://default.supabase.co",
        supabasePublishableKey: "sb_publishable_default",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
