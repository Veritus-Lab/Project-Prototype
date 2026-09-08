import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("resend", () => ({
  Resend: vi.fn(),
}));

describe("getResendClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("rejects a missing or invalid server key", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("EXTERNAL_INTEGRATIONS_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "");
    const { getResendClient } = await import("./resend");

    expect(() => getResendClient()).toThrow(
      "O envio de e-mails não está configurado.",
    );
  });

  it("creates a server-side Resend client with a valid key", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("EXTERNAL_INTEGRATIONS_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    const { Resend } = await import("resend");
    const { getResendClient } = await import("./resend");

    getResendClient();

    expect(Resend).toHaveBeenCalledWith("re_test_key");
  });

  it("blocks a configured Resend key in preview", async () => {
    vi.stubEnv("APP_ENV", "preview");
    vi.stubEnv("EXTERNAL_INTEGRATIONS_MODE", "disabled");
    vi.stubEnv("RESEND_API_KEY", "re_real_key");
    const { Resend } = await import("resend");
    const { getResendClient } = await import("./resend");
    expect(() => getResendClient()).toThrow(/bloqueado/);
    expect(Resend).not.toHaveBeenCalled();
  });
});
