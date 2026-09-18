import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  mockSupabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "b8b49b94-ce66-49b6-8e4c-2dd98081abcf" },
            error: null,
          }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue(mocks.mockSupabase),
}));

import { POST as interestPost } from "@/app/api/interest/route";
import { POST as asaasWebhookPost } from "@/app/api/webhooks/asaas/route";
import { POST as queueWorkerPost } from "@/app/api/cron/queue-worker/route";
import { resetRateLimitStore } from "@/lib/security/rate-limit";

describe("Rotas e endpoints protegidos contra abusos de segurança", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.clearAllMocks();
    process.env.ASAAS_WEBHOOK_TOKEN = "valid-asaas-secret-token-123";
    process.env.CRON_SECRET = "super-secret-cron-token-with-sufficient-length";
  });

  describe("Webhook Asaas (/api/webhooks/asaas)", () => {
    it("rejeita requisições sem o token de acesso com 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/webhooks/asaas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: "evt_1", event: "PAYMENT_RECEIVED" }),
      });

      const res = await asaasWebhookPost(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("unauthorized");
    });

    it("rejeita requisições com token incorreto com 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/webhooks/asaas", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "asaas-access-token": "wrong-token",
        },
        body: JSON.stringify({ id: "evt_1", event: "PAYMENT_RECEIVED" }),
      });

      const res = await asaasWebhookPost(req);
      expect(res.status).toBe(401);
    });

    it("aceita webhook válido e enfileira para processamento", async () => {
      const req = new NextRequest("http://localhost:3000/api/webhooks/asaas", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "asaas-access-token": "valid-asaas-secret-token-123",
        },
        body: JSON.stringify({
          id: "evt_123",
          event: "PAYMENT_CONFIRMED",
          payment: { id: "pay_999" },
        }),
      });

      const res = await asaasWebhookPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.received).toBe(true);
    });
  });

  describe("Formulário público de leads (/api/interest)", () => {
    it("rejeita dados inválidos com 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/interest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "A" }), // Nome muito curto e sem contato
      });

      const res = await interestPost(req);
      expect(res.status).toBe(400);
    });

    it("bloqueia por rate limit quando exceder 10 requisições consecutivas", async () => {
      const validPayload = {
        name: "Carlos Atleta",
        email: "carlos@example.com",
        phone: "11999999999",
      };

      for (let i = 0; i < 10; i++) {
        const req = new NextRequest("http://localhost:3000/api/interest", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "187.55.10.2",
          },
          body: JSON.stringify(validPayload),
        });
        const res = await interestPost(req);
        expect(res.status).toBe(200);
      }

      // 11ª requisição deve ser bloqueada com 429
      const blockedReq = new NextRequest("http://localhost:3000/api/interest", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "187.55.10.2",
        },
        body: JSON.stringify(validPayload),
      });
      const blockedRes = await interestPost(blockedReq);
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    });
  });

  describe("Worker da fila (/api/cron/queue-worker)", () => {
    it("nega acesso sem o segredo do cron com 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/queue-worker", {
        method: "POST",
      });

      const res = await queueWorkerPost(req);
      expect(res.status).toBe(401);
    });

    it("autoriza a execução com Authorization: Bearer <CRON_SECRET>", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/queue-worker", {
        method: "POST",
        headers: {
          authorization: "Bearer super-secret-cron-token-with-sufficient-length",
        },
      });

      const res = await queueWorkerPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.processed).toBeDefined();
    });
  });
});
