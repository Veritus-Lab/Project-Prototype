import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  assertSafeTestEnvironment,
  inspectSupabaseCliArgs,
} from "../src/lib/environment/test-environment-guard.ts";

assertSafeTestEnvironment(process.env);

const cli = fileURLToPath(new URL("../node_modules/supabase/dist/supabase.js", import.meta.url));
const commands = [
  ["db", "reset", "--local", "--no-seed"],
  ["test", "db", "supabase/tests", "--local"],
] as const;

for (const args of commands) {
  const issues = inspectSupabaseCliArgs(args);
  if (issues.length > 0) throw new Error(issues.join("\n"));
  const result = spawnSync(process.execPath, [cli, ...args], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
