import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)), "server-only": fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url)) } },
  test: {
    environment: "jsdom", pool: "threads", fileParallelism: false, globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/lib/environment/*.test.ts",
      "src/lib/auth/session.test.ts",
      "src/lib/email/*.test.ts",
      "src/lib/invitations/token.test.ts",
      "src/lib/validators/{auth,invitation,financial,communication}.test.ts",
      "src/lib/services/{auth,invitation,financial,communication}.service.test.ts",
      "src/lib/services/invitation-acceptance.test.ts",
      "src/lib/actions/{financial,communication}*.test.ts",
    ],
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**", "legacy/**"],
    coverage: {
      provider: "v8", reporter: ["text", "html", "json-summary"],
      include: [
        "src/lib/environment/*.ts",
        "src/lib/auth/session.ts",
        "src/lib/email/{resend,invitation-email}.ts",
        "src/lib/invitations/token.ts",
        "src/lib/validators/{auth,invitation,financial,communication}.ts",
        "src/lib/services/{auth,invitation,financial,communication}.service.ts",
        "src/lib/actions/{financial,communication}.actions.ts",
      ],
      exclude: ["src/**/*.test.{ts,tsx}"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
