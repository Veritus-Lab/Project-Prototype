# Task 15 — Biblioteca de Exercícios TDD

## Source Plan

`docs/superpowers/plans/2026-08-25-etapa-2-operacao-assessoria.md`

## User Journey

Como treinador autenticado, quero consultar uma biblioteca inicial de exercícios de apoio à corrida, para montar treinos futuros sem editar o catálogo global e sem transformar a plataforma em prescrição médica automática.

## RED Evidence

Command:

```bash
npm test -- src/lib/services/exercise.service.test.ts supabase/migrations/exercise_catalog.policy.test.ts --reporter=dot --pool=forks --fileParallelism=false
```

Result: failed before implementation because `src/lib/services/exercise.service.ts` did not exist and `20260826154742_exercise_catalog.sql` was empty.

Checkpoint commit:

```text
0aa15af test: add task 15 exercise catalog coverage
```

## GREEN Evidence

Command:

```bash
npm test -- src/lib/services/exercise.service.test.ts supabase/migrations/exercise_catalog.policy.test.ts --reporter=dot --pool=forks --fileParallelism=false
```

Result:

```text
Test Files  2 passed (2)
Tests       5 passed (5)
```

## Guarantees

| # | What is guaranteed | Test file or command | Type | Result |
|---|--------------------|----------------------|------|--------|
| 1 | Service reads from the global catalog table and maps labels for category and level | `src/lib/services/exercise.service.test.ts` | unit | PASS |
| 2 | Supabase failures return a generic user-facing error | `src/lib/services/exercise.service.test.ts` | unit | PASS |
| 3 | Migration creates `exercicios_catalogo` with RLS enabled and forced | `supabase/migrations/exercise_catalog.policy.test.ts` | static migration | PASS |
| 4 | Authenticated users receive only `select` grant on the global catalog | `supabase/migrations/exercise_catalog.policy.test.ts` | static migration | PASS |
| 5 | No `insert`, `update` or `delete` policy/grant is exposed to authenticated users | `supabase/migrations/exercise_catalog.policy.test.ts` | static migration | PASS |
| 6 | Seed includes the initial categories and core roadmap exercises | `supabase/migrations/exercise_catalog.policy.test.ts` | static migration | PASS |

## Known Gaps

No browser E2E or live pgTAP run was executed in this checkpoint. Local Supabase/Docker availability should be confirmed before adding database-executed pgTAP coverage.

## Remote Supabase Verification

Applied to project `hrmyqrekasuqhiqmqske` on 26/08/2026 after the Supabase CLI pooler connection timed out, using the Supabase MCP connection and preserving migration history version `20260826154742`.

Remote checks:

```text
supabase_migrations.schema_migrations includes 20260826154742 / exercise_catalog
public.exercicios_catalogo contains 15 rows, all active
RLS enabled: true
RLS forced: true
authenticated grants: SELECT only
policies: exercicios_catalogo_select_authenticated, SELECT, roles {authenticated}, using ativo
```
