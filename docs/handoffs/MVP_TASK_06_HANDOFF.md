# Handoff — MVP FLERNK Task 06

Data: 09/09/2026. Branch: `codex/mvp-flernk`. Status: **concluída**.

## Entregue

- migration aditiva `20260908085542_mvp_foundation_data_model.sql` com 15 enums e 36 tabelas do modelo financeiro e administrativo;
- RLS habilitada e forçada em todas as tabelas novas, com grants mínimos apenas para `service_role` até a Task 07;
- vínculos compostos por `assessoria_id`, invariantes de caixa, idempotência de cobrança/eventos/mensagens e filas com retry/lease;
- preservação de dados legados validada por fixture sintética, sem backfill ou DML remoto;
- tipos Supabase gerados e verificados no CI contra a migration;
- contrato Vitest, pgTAP de fundação e compatibilidade, suíte unitária, cobertura, typecheck, lint, build e Playwright executados no CI.

## Gates para a Task 07

1. A autorização por sócio, professor e aluno deve ser implementada sobre esta base; o professor consulta apenas o estado financeiro resumido do aluno (`em dia`, `pendente`, `não configurado` ou `indisponível`).
2. As políticas RLS e os grants de `anon`/`authenticated` continuam intencionalmente ausentes até os testes negativos da Task 07.
3. A identificação da organização e dos UUIDs reais segue bloqueada pelo gate da Task 02; qualquer migração de dados deve ser uma migration separada com allowlist explícita e rollback ensaiado.
4. A operação inicial continua em Supabase Free e Vercel Hobby, com cron diário e processamento em lotes; não adicionar dependências de recursos pagos.

Referências: [fundação de dados](../TASK_06_FUNDACAO_DADOS.md), [QA-C](../testing/mvp-task-06.md) e [roadmap](../TASKS_MVP_FLERNK.md).
