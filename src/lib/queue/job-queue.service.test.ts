import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearInMemoryQueue,
  clearJobHandlers,
  enqueueJob,
  getInMemoryQueue,
  processNextJobs,
  registerJobHandler,
} from "./job-queue.service";

describe("job-queue service", () => {
  beforeEach(() => {
    clearJobHandlers();
    clearInMemoryQueue();
  });

  it("enfileira jobs com sucesso e idempotência", async () => {
    const res1 = await enqueueJob({
      type: "send_email",
      payload: { to: "user@example.com", subject: "Boas-vindas" },
      idempotencyKey: "email-welcome-1",
    });

    expect(res1.success).toBe(true);
    expect(res1.duplicate).toBeFalsy();
    expect(res1.jobId).toBeDefined();

    // Tentativa duplicada com a mesma chave de idempotência
    const res2 = await enqueueJob({
      type: "send_email",
      payload: { to: "user@example.com", subject: "Boas-vindas" },
      idempotencyKey: "email-welcome-1",
    });

    expect(res2.success).toBe(true);
    expect(res2.duplicate).toBe(true);
  });

  it("processa jobs com seus respectivos handlers registrados", async () => {
    const emailHandler = vi.fn().mockResolvedValue(undefined);
    registerJobHandler("send_email", emailHandler);

    await enqueueJob({
      type: "send_email",
      payload: { to: "runner@flernk.com", message: "Seu treino foi publicado" },
    });

    const result = await processNextJobs(10, "test-worker");

    expect(result.processed).toBe(1);
    expect(result.successes).toBe(1);
    expect(result.failures).toBe(0);
    expect(emailHandler).toHaveBeenCalledWith(
      expect.objectContaining({ to: "runner@flernk.com" }),
      expect.anything(),
    );

    const queue = getInMemoryQueue();
    expect(queue[0]?.status).toBe("completed");
  });

  it("marca job como falha e aplica retentativa quando handler lança erro", async () => {
    const failingHandler = vi.fn().mockRejectedValue(new Error("API Resend offline"));
    registerJobHandler("failing_job", failingHandler);

    await enqueueJob({
      type: "failing_job",
      payload: { task: "fail" },
      maxAttempts: 3,
      backoffSeconds: 10,
    });

    const result = await processNextJobs(10, "test-worker");

    expect(result.processed).toBe(1);
    expect(result.failures).toBe(1);

    const queue = getInMemoryQueue();
    const job = queue[0];
    expect(job?.status).toBe("pending"); // Ainda pode ser retentado (attempts: 1 < maxAttempts: 3)
    expect(job?.attempts).toBe(1);
    expect(job?.error_message).toBe("API Resend offline");
  });

  it("move job para dead_letter quando atinge o limite máximo de tentativas", async () => {
    const fatalHandler = vi.fn().mockRejectedValue(new Error("Erro irreversível"));
    registerJobHandler("fatal_job", fatalHandler);

    await enqueueJob({
      type: "fatal_job",
      payload: { task: "fatal" },
      maxAttempts: 1,
    });

    const result = await processNextJobs(10, "test-worker");

    expect(result.failures).toBe(1);
    const queue = getInMemoryQueue();
    expect(queue[0]?.status).toBe("dead_letter");
  });
});
