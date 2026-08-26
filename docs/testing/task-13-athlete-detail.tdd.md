# Task 13 — Detalhe do Atleta TDD

## Source Plan

`docs/superpowers/plans/2026-08-25-etapa-2-operacao-assessoria.md`

## User Journey

Como treinador autenticado, quero abrir o detalhe de um atleta vinculado à minha assessoria, para consultar dados básicos e treinos recentes sem expor atleta de outro treinador ou tenant.

## RED Evidence

Command:

```bash
npm test -- src/lib/services/athlete.service.test.ts "src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx"
```

Result: failed before implementation because `src/app/(dashboard)/treinador/atletas/[id]/page.tsx` did not exist. This validated the missing dynamic athlete detail route.

Checkpoint commit:

```text
f18024a test: add athlete detail coverage
```

## GREEN Evidence

Command:

```bash
npm test -- src/lib/services/athlete.service.test.ts "src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx"
```

Result:

```text
Test Files  2 passed (2)
Tests  6 passed (6)
```

Additional validation:

```bash
npm run typecheck
npm run lint
```

Both commands completed successfully.

## Guarantees

| # | What is guaranteed | Test file or command | Type | Result |
|---|--------------------|----------------------|------|--------|
| 1 | Trainer athlete list remains scoped by `assessoria_id` and `treinador_id` | `src/lib/services/athlete.service.test.ts` | unit | PASS |
| 2 | Athlete detail query filters by `assessoria_id`, `treinador_id`, and athlete `id` | `src/lib/services/athlete.service.test.ts` | unit | PASS |
| 3 | Missing or denied athlete returns the same generic error | `src/lib/services/athlete.service.test.ts` | unit | PASS |
| 4 | Dynamic page requires trainer role before loading detail | `src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx` | component/server page | PASS |
| 5 | Detail page renders recent assigned workouts | `src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx` | component/server page | PASS |
| 6 | Detail page renders generic not-found state for missing or denied athlete | `src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx` | component/server page | PASS |

## Known Gaps

No browser E2E was run for this task. The route is server-rendered and covered by unit/page tests; browser smoke can be included after Vercel receives the branch with these commits and production env vars are fixed.
