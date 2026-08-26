# Task 14 — Cadastro/Edição Operacional do Atleta TDD

## Source Plan

`docs/superpowers/plans/2026-08-25-etapa-2-operacao-assessoria.md`

## User Journey

Como treinador autenticado, quero complementar dados operacionais mínimos de um atleta vinculado à minha assessoria, para acompanhar telefone, objetivo, nível, data de nascimento opcional, contato de emergência e observações internas sem alterar Auth ou `profiles`.

## RED Evidence

Command:

```bash
npm test -- src/lib/validators/athlete-operational.test.ts src/lib/actions/athlete.actions.test.ts src/lib/services/athlete.service.test.ts "src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx" --reporter=dot
```

Result: failed before implementation because `src/lib/validators/athlete-operational.ts`, `src/lib/actions/athlete.actions.ts`, operational service behavior and the "Dados operacionais" card did not exist.

Checkpoint commit:

```text
e233088 test: add task 14 athlete operational profile coverage
```

## GREEN Evidence

Commands:

```bash
npm test -- src/lib/validators/athlete-operational.test.ts --reporter=dot
npm test -- src/lib/actions/athlete.actions.test.ts --reporter=dot
npm test -- src/lib/services/athlete.service.test.ts --reporter=dot
npm test -- "src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx" --reporter=dot
```

Results:

```text
src/lib/validators/athlete-operational.test.ts: Test Files 1 passed, Tests 2 passed
src/lib/actions/athlete.actions.test.ts: Test Files 1 passed, Tests 2 passed
src/lib/services/athlete.service.test.ts: Test Files 1 passed, Tests 5 passed
src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx: Test Files 1 passed, Tests 2 passed
```

Additional validation:

```bash
npm run typecheck
npx eslint src/lib/validators/athlete-operational.ts src/lib/actions/athlete.actions.ts src/lib/actions/athlete.state.ts src/lib/services/athlete.service.ts src/components/dashboard/athlete-operational-form.tsx "src/app/(dashboard)/treinador/atletas/[id]/page.tsx" src/types/database.ts
```

Both commands completed successfully. `npm run lint` was started for the full repository, but it did not emit a result in the local Windows/OneDrive environment and was interrupted; the task-scoped ESLint command above completed successfully.

## Guarantees

| # | What is guaranteed | Test file or command | Type | Result |
|---|--------------------|----------------------|------|--------|
| 1 | Empty optional operational fields normalize to `null` | `src/lib/validators/athlete-operational.test.ts` | unit | PASS |
| 2 | Invalid UUID, phone, level, future birth date and excessive text are rejected | `src/lib/validators/athlete-operational.test.ts` | unit | PASS |
| 3 | Server Action validates before authentication/service calls | `src/lib/actions/athlete.actions.test.ts` | unit | PASS |
| 4 | Server Action requires trainer role, delegates to service and revalidates athlete detail | `src/lib/actions/athlete.actions.test.ts` | unit | PASS |
| 5 | Athlete detail includes operational data from `atletas_operacionais` scoped by tenant and athlete | `src/lib/services/athlete.service.test.ts` | unit | PASS |
| 6 | Operational upsert confirms trainer access to the athlete before writing | `src/lib/services/athlete.service.test.ts` | unit | PASS |
| 7 | Detail page renders editable operational fields for the trainer | `src/app/(dashboard)/treinador/atletas/[id]/page.test.tsx` | component/server page | PASS |
| 8 | TypeScript accepts the new action, service, migration-backed types and UI | `npm run typecheck` | static | PASS |
| 9 | Task-scoped ESLint accepts changed source files | `npx eslint ...` | static | PASS |

## Known Gaps

No browser E2E or pgTAP run was executed for this task. The migration defines RLS for `atletas_operacionais`; a future Supabase verification pass should add pgTAP coverage for trainer same-tenant success, cross-tenant denial and athlete denial for internal notes.
