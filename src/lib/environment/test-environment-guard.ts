const PRODUCTION_PROJECT_REF = "hrmyqrekasuqhiqmqske";
const PRODUCTION_HOSTS = new Set([
  `${PRODUCTION_PROJECT_REF}.supabase.co`,
  `db.${PRODUCTION_PROJECT_REF}.supabase.co`,
]);

type Environment = Record<string, string | undefined>;

const targetVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "DATABASE_URL",
  "POSTGRES_URL",
] as const;

function parseHost(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function projectRefFromHost(host: string): string | null {
  const match = host.match(/^(?:db\.)?([a-z0-9]{20})\.supabase\.co$/);
  return match?.[1] ?? null;
}

function isLocalHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function inspectTestEnvironment(environment: Environment): string[] {
  const issues: string[] = [];
  const appEnvironment = environment.APP_ENV?.toLowerCase();
  if (!appEnvironment || !["development", "test", "preview"].includes(appEnvironment)) {
    issues.push("APP_ENV deve declarar development, test ou preview; NODE_ENV isoladamente não autoriza testes.");
  }

  const targets = targetVariables
    .map((name) => [name, environment[name]] as const)
    .filter((entry): entry is readonly [typeof targetVariables[number], string] => Boolean(entry[1]));

  if (targets.length === 0) {
    issues.push("Um alvo Supabase explícito é obrigatório para falhar de forma fechada.");
  }

  for (const [name, value] of targets) {
    const host = parseHost(value);
    if (!host) {
      issues.push(`${name} não contém uma URL válida.`);
      continue;
    }
    const ref = projectRefFromHost(host);
    if (value.toLowerCase().includes(PRODUCTION_PROJECT_REF) || PRODUCTION_HOSTS.has(host)) {
      issues.push(`${name} aponta para o projeto de produção e foi bloqueado.`);
      continue;
    }
    if (!isLocalHost(host)) {
      const allowedRef = environment.TEST_SUPABASE_PROJECT_REF?.toLowerCase();
      if (!ref || !allowedRef || ref !== allowedRef) {
        issues.push(`${name} remoto exige TEST_SUPABASE_PROJECT_REF idêntico ao host isolado.`);
      }
    }
  }

  const privilegedNames = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SECRET_KEY",
    "POSTGRES_PASSWORD",
    "ASAAS_API_KEY",
    "ASAAS_WEBHOOK_TOKEN",
    "WHATSAPP_ACCESS_TOKEN",
    "WHATSAPP_APP_SECRET",
    "RESEND_API_KEY",
    "CRON_SECRET",
  ];
  if (["test", "preview"].includes(appEnvironment ?? "") && privilegedNames.some((name) => Boolean(environment[name]))) {
    issues.push("Credencial privilegiada não é permitida no runner de teste/E2E/CI.");
  }

  const integrationMode = environment.EXTERNAL_INTEGRATIONS_MODE?.toLowerCase();
  if (!integrationMode || !["disabled", "sandbox"].includes(integrationMode)) {
    issues.push("EXTERNAL_INTEGRATIONS_MODE deve ser disabled ou sandbox; live é proibido.");
  }
  for (const name of ["ASAAS_ENVIRONMENT", "WHATSAPP_ENVIRONMENT", "PAYMENTS_MODE"]) {
    if (environment[name]?.toLowerCase() === "live") {
      issues.push(`${name}=live é proibido neste contexto.`);
    }
  }

  const publicSecretPattern = /(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|API_KEY|TOKEN)/i;
  for (const [name, value] of Object.entries(environment)) {
    if (value && name.startsWith("NEXT_PUBLIC_") && publicSecretPattern.test(name)) {
      issues.push(`${name} aparenta ser segredo e nunca pode usar NEXT_PUBLIC_.`);
    }
  }

  return [...new Set(issues)];
}

export function assertSafeTestEnvironment(environment: Environment): void {
  const issues = inspectTestEnvironment(environment);
  if (issues.length > 0) {
    throw new Error(`Ambiente de teste bloqueado:\n- ${issues.join("\n- ")}`);
  }
}

export function inspectSupabaseCliArgs(args: readonly string[]): string[] {
  const joined = args.join(" ").toLowerCase();
  const issues: string[] = [];
  if (!args.includes("--local")) issues.push("O comando Supabase deve fixar --local.");
  if (/--linked|--db-url|--project-ref|--password/.test(joined)) {
    issues.push("Flags de conexão remota são proibidas no runner pgTAP.");
  }
  if (joined.includes(PRODUCTION_PROJECT_REF)) issues.push("O project ref de produção foi bloqueado.");
  return issues;
}

export { PRODUCTION_PROJECT_REF };
