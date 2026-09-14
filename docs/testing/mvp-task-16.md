# Task 16 — Pagamentos manuais e auditoria

- Recebimento manual é uma RPC exclusiva de sócios.
- A transação cria pagamento confirmado, liquidação recebida, entrada de caixa e auditoria da cobrança.
- Repetir a baixa reutiliza a chave idempotente da cobrança e não cria novo recebimento.
- `npm run typecheck` e `npm run lint` passaram.
- Migration `task_16_manual_payments` aplicada no Supabase. A prova pgTAP de concorrência permanece pendente do Docker Linux local.
