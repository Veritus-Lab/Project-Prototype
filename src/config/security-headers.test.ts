import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("security headers configuration", () => {
  it("defines global security headers for /:path*", async () => {
    expect(nextConfig.headers).toBeDefined();
    const headersConfig = await nextConfig.headers!();

    const globalRoute = headersConfig.find((entry) => entry.source === "/:path*");
    expect(globalRoute).toBeDefined();

    const headerKeys = globalRoute!.headers.map((h) => h.key);
    expect(headerKeys).toContain("Strict-Transport-Security");
    expect(headerKeys).toContain("X-Frame-Options");
    expect(headerKeys).toContain("X-Content-Type-Options");
    expect(headerKeys).toContain("Referrer-Policy");
    expect(headerKeys).toContain("Permissions-Policy");
    expect(headerKeys).toContain("Content-Security-Policy");

    const xFrameOptions = globalRoute!.headers.find((h) => h.key === "X-Frame-Options");
    expect(xFrameOptions?.value).toBe("DENY");

    const xContentType = globalRoute!.headers.find((h) => h.key === "X-Content-Type-Options");
    expect(xContentType?.value).toBe("nosniff");
  });
});
