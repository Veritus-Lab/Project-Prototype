import { beforeEach, describe, expect, it } from "vitest";

import {
  checkRateLimit,
  enforceActionRateLimit,
  getClientIp,
  rateLimitResponse,
  resetRateLimitStore,
  type RateLimitConfig,
} from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  const testConfig: RateLimitConfig = {
    windowMs: 1000, // 1 segundo
    maxRequests: 3,
    message: "Limite atingido.",
  };

  it("permite requisições dentro do limite permitido", () => {
    const t0 = 100000;
    const r1 = checkRateLimit("client-1", testConfig, t0);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit("client-1", testConfig, t0 + 100);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit("client-1", testConfig, t0 + 200);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("bloqueia requisições que excedem o limite na mesma janela", () => {
    const t0 = 100000;
    checkRateLimit("client-2", testConfig, t0);
    checkRateLimit("client-2", testConfig, t0 + 100);
    checkRateLimit("client-2", testConfig, t0 + 200);

    const blocked = checkRateLimit("client-2", testConfig, t0 + 300);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("libera nova cota após expirar a janela deslizante", () => {
    const t0 = 100000;
    checkRateLimit("client-3", testConfig, t0);
    checkRateLimit("client-3", testConfig, t0 + 100);
    checkRateLimit("client-3", testConfig, t0 + 200);

    // Tentativa após passar a janela de 1 segundo (1000ms)
    const afterWindow = checkRateLimit("client-3", testConfig, t0 + 1050);
    expect(afterWindow.success).toBe(true);
  });

  it("isola cotas entre clientes diferentes", () => {
    const t0 = 100000;
    checkRateLimit("client-a", testConfig, t0);
    checkRateLimit("client-a", testConfig, t0 + 50);
    checkRateLimit("client-a", testConfig, t0 + 100);

    // client-a está no limite
    expect(checkRateLimit("client-a", testConfig, t0 + 150).success).toBe(false);

    // client-b ainda está livre
    const clientB = checkRateLimit("client-b", testConfig, t0 + 150);
    expect(clientB.success).toBe(true);
    expect(clientB.remaining).toBe(2);
  });

  it("extrai IP corretamente dos headers com proxies", () => {
    expect(getClientIp(new Headers({ "cf-connecting-ip": "203.0.113.195" }))).toBe("203.0.113.195");
    expect(getClientIp(new Headers({ "x-real-ip": "198.51.100.14" }))).toBe("198.51.100.14");
    expect(getClientIp(new Headers({ "x-forwarded-for": "192.0.2.1, 10.0.0.1" }))).toBe("192.0.2.1");
    expect(getClientIp(new Headers({}))).toBe("127.0.0.1");
  });

  it("gera resposta HTTP 429 com cabeçalhos apropriados", async () => {
    const result = {
      success: false,
      limit: 5,
      remaining: 0,
      reset: 1700000000,
      retryAfter: 30,
    };

    const response = rateLimitResponse(result, "Acesso bloqueado temporariamente.");
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("X-RateLimit-Reset")).toBe("1700000000");

    const json = await response.json();
    expect(json.error).toBe("Acesso bloqueado temporariamente.");
    expect(json.retryAfter).toBe(30);
  });

  it("enforceActionRateLimit retorna erro amigável quando bloqueado", () => {
    enforceActionRateLimit("action-user", testConfig);
    enforceActionRateLimit("action-user", testConfig);
    enforceActionRateLimit("action-user", testConfig);

    const actionResult = enforceActionRateLimit("action-user", testConfig);
    expect(actionResult.success).toBe(false);
    if (!actionResult.success) {
      expect(actionResult.error).toBe("Limite atingido.");
      expect(actionResult.retryAfter).toBeGreaterThan(0);
    }
  });
});
