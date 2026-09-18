import "server-only";

import { NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Janela de tempo em milissegundos */
  windowMs: number;
  /** Número máximo de requisições permitidas na janela */
  maxRequests: number;
  /** Mensagem customizada de erro (opcional) */
  message?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp em segundos
  retryAfter: number; // Segundos restantes até poder tentar novamente
}

/**
 * Presets oficiais de rate limit para cada perfil de tráfego do FLERNK.
 */
export const RATE_LIMIT_PRESETS = {
  /** Tentativas de login: 5 a cada 15 minutos (mitiga brute-force) */
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.",
  },
  /** Cadastro de nova conta: 5 por hora por IP */
  AUTH_SIGNUP: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: "Limite de cadastros atingido para este endereço. Tente novamente mais tarde.",
  },
  /** Formulários públicos (leads/interesse): 10 requisições por minuto */
  PUBLIC_FORM: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Muitos envios recentes. Por favor, aguarde um momento.",
  },
  /** Criação de convites: 30 convites por hora */
  INVITATIONS: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 30,
    message: "Limite de envio de convites atingido por hora. Aguarde para enviar mais.",
  },
  /** Webhook de pagamento: 120 requisições por minuto */
  WEBHOOK: {
    windowMs: 60 * 1000,
    maxRequests: 120,
    message: "Taxa de webhooks excedida temporariamente.",
  },
  /** API geral: 60 requisições por minuto */
  GENERAL_API: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    message: "Limite de requisições por minuto excedido.",
  },
} as const;

interface ClientWindow {
  timestamps: number[];
}

const memoryStore = new Map<string, ClientWindow>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60 * 1000;

/**
 * Remove periodicamente chaves inativas do Map em memória para evitar memory leaks.
 */
function cleanupExpiredKeys(maxWindowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, record] of memoryStore.entries()) {
    // Remove registros cujo hit mais recente é mais antigo que a maior janela
    const newestHit = record.timestamps[record.timestamps.length - 1] ?? 0;
    if (now - newestHit > maxWindowMs) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Reseta a memória de rate limit (útil principalmente para testes unitários).
 */
export function resetRateLimitStore(): void {
  memoryStore.clear();
  lastCleanup = Date.now();
}

/**
 * Avalia se o identificador excedeu a cota na janela deslizante (Sliding Window Log).
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  now = Date.now(),
): RateLimitResult {
  cleanupExpiredKeys(config.windowMs * 2);

  let record = memoryStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  const windowStart = now - config.windowMs;

  // Filtra apenas requisições dentro da janela atual
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const currentCount = record.timestamps.length;
  const oldestTimestamp = record.timestamps[0] ?? now;
  const resetTimeMs = oldestTimestamp + config.windowMs;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));
  const resetUnixSeconds = Math.ceil(resetTimeMs / 1000);

  if (currentCount >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: resetUnixSeconds,
      retryAfter: retryAfterSeconds,
    };
  }

  // Registra o novo acesso
  record.timestamps.push(now);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.timestamps.length),
    reset: resetUnixSeconds,
    retryAfter: 0,
  };
}

/**
 * Extrai o IP real do cliente a partir dos cabeçalhos HTTP com suporte a proxies.
 */
export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const getHeader = (name: string): string | undefined => {
    if (typeof headers.get === "function") {
      return headers.get(name) ?? undefined;
    }
    const val = (headers as Record<string, string | string[] | undefined>)[name];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const cfConnectingIp = getHeader("cf-connecting-ip");
  if (cfConnectingIp?.trim()) return cfConnectingIp.trim();

  const xRealIp = getHeader("x-real-ip");
  if (xRealIp?.trim()) return xRealIp.trim();

  const forwardedFor = getHeader("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return "127.0.0.1";
}

/**
 * Gera uma resposta padronizada HTTP 429 com cabeçalhos padrão IETF.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  customMessage?: string,
): NextResponse {
  const message = customMessage ?? "Muitas requisições. Por favor, tente novamente mais tarde.";

  return NextResponse.json(
    {
      error: message,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
      },
    },
  );
}

/**
 * Helper para uso em Server Actions. Retorna erro amigável caso bloqueado.
 */
export function enforceActionRateLimit(
  identifier: string,
  config: RateLimitConfig,
): { success: true } | { success: false; error: string; retryAfter: number } {
  const result = checkRateLimit(identifier, config);

  if (!result.success) {
    const defaultMsg = config.message ?? `Muitas tentativas. Tente novamente em ${result.retryAfter} segundos.`;
    return {
      success: false,
      error: defaultMsg,
      retryAfter: result.retryAfter,
    };
  }

  return { success: true };
}
