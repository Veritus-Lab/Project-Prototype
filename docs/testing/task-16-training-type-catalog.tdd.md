# Task 16 — Biblioteca de Tipos de Treino TDD

## Source Plan

`docs/superpowers/plans/2026-08-25-etapa-2-operacao-assessoria.md`

## Scope Decision

This task delivers the global, read-only catalog and the shared server-side block schemas. Trainer-owned models and real workout creation remain in Task 17, where trainer and `assessoria_id` ownership can be created and tested together.

## User Journeys

- Como treinador autenticado, quero consultar tipos estruturados de treino de corrida para iniciar a criação manual de treinos na próxima task.
- Como plataforma, quero rejeitar blocos livres, extensos ou sem medida para não persistir estruturas ambíguas.
- Como usuário autenticado, quero ler o catálogo ativo sem poder alterá-lo pelo cliente.

## RED Evidence

Commands:

```bash
npm test -- supabase/migrations/training_type_catalog.policy.test.ts --reporter=verbose --pool=threads --fileParallelism=false
npm test -- src/lib/validators/training-template.test.ts src/lib/services/training-template.service.test.ts --reporter=verbose --pool=threads --fileParallelism=false
```

Result: the empty migration failed all three catalog security checks, and both missing production modules failed import resolution.

Checkpoint commit:

```text
dba969a test: add task 16 training type catalog coverage
```

## GREEN Evidence

Command:

```bash
npm test -- src/lib/validators/training-template.test.ts src/lib/services/training-template.service.test.ts supabase/migrations/training_type_catalog.policy.test.ts --reporter=verbose --pool=threads --fileParallelism=false
```

Result:

```text
Test Files  3 passed (3)
Tests       9 passed (9)
```

Additional verification:

```text
npm run typecheck  PASS
npm run build      PASS
```

## Guarantees

| # | What is guaranteed | Test file | Type | Result |
|---|--------------------|-----------|------|--------|
| 1 | Structured workout blocks are bounded, measured, and reject unknown fields | `src/lib/validators/training-template.test.ts` | unit | PASS |
| 2 | Catalog schemas only expose known fields and at most eight blocks | `src/lib/validators/training-template.test.ts` | unit | PASS |
| 3 | The catalog service maps valid data and hides malformed database JSON behind a generic error | `src/lib/services/training-template.service.test.ts` | unit | PASS |
| 4 | RLS is enabled and forced, with `SELECT` only for authenticated users | `supabase/migrations/training_type_catalog.policy.test.ts` | static migration | PASS |
| 5 | No client `INSERT`, `UPDATE`, or `DELETE` grant/policy is present | `supabase/migrations/training_type_catalog.policy.test.ts` | static migration | PASS |
| 6 | The ten roadmap training types are seeded | `supabase/migrations/training_type_catalog.policy.test.ts` | static migration | PASS |

## Known Gaps

There is no UI or mutation in this task. The training creation flow, tenant-owned models, authorization and cross-tenant creation tests are intentionally scheduled for Task 17. No coverage script is configured in `package.json`; targeted tests cover the new validator, service, and migration contract.
