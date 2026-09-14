# Task 14 — Planos e assinaturas

- Catálogo, versões e contratos operam nas tabelas MVP `plans`, `plan_versions` e `subscriptions`.
- O contrato copia valor, periodicidade e dia de vencimento da versão escolhida; uma revisão posterior não atualiza o snapshot já contratado.
- Apenas sócio executa as RPCs de criação/revisão e contrato.
- `npm run typecheck` e `npm run lint` aprovados.
- Migrations `task_14_plans_subscriptions` e `task_14_plan_revisions` aplicadas no Supabase de produção.

A geração de cobranças e a transição operacional da assinatura permanecem nas Tasks 15 e 16.
