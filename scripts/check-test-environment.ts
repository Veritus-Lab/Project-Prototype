import { assertSafeTestEnvironment } from "../src/lib/environment/test-environment-guard.ts";

try {
  assertSafeTestEnvironment(process.env);
  process.stdout.write("Environment guard: SAFE\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Ambiente inválido"}\n`);
  process.exitCode = 1;
}
