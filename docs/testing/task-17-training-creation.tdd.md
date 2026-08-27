# Task 17 — Criação Manual de Treinos TDD

## Source Plan

`docs/superpowers/plans/2026-08-25-etapa-2-operacao-assessoria.md`

## Guarantees

- O formulário valida título, descrição, tipo opcional e blocos no servidor antes de consultar a sessão.
- A criação sempre deriva `assessoria_id` e `treinador_id` da sessão autenticada.
- O tipo de treino opcional precisa estar ativo e acessível pela policy do catálogo.
- A listagem filtra por assessoria e treinador atuais.
- A migration mantém RLS de `treinos`, vincula o catálogo por FK e exige de 1 a 8 blocos persistidos.

## Evidence

RED commands failed because the migration, service and action did not exist. Checkpoint: `d9a41f0`.

GREEN command:

```bash
npm test -- src/lib/services/training.service.test.ts src/lib/actions/training.actions.test.ts supabase/migrations/training_creation_constraints.policy.test.ts --reporter=dot --pool=threads --fileParallelism=false
```

Result: `3 passed` files and `7 passed` tests.

Additional checks: `npm run typecheck` and `npm run build` passed.

## Remote Supabase Verification

Applied to `hrmyqrekasuqhiqmqske` as `20260827152211_training_creation_constraints` on 27/08/2026.

Verified: `treinos.tipo_treino_id` exists with a foreign key to the catalog; `treinos_estrutura_blocos_check` requires an object with 1–8 blocks; RLS remains enabled and forced.
