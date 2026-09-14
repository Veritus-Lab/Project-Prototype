# Task 13 — Chamada e faltas

**Ambiente:** desenvolvimento e Supabase de produção (somente migration de schema/RPC).

- A chamada exige um status para todos os alunos elegíveis do encontro.
- Encontro cancelado é recusado pelo RPC; `not_recorded` não tem instante de registro e não representa falta.
- Cada criação ou correção de status é gravada em `attendance_history`, com ator e instante.
- `npm test -- src/components/dashboard/attendance-batch-form.test.tsx`: 2 testes aprovados.
- `npm run typecheck` e `npm run lint`: aprovados. O build concluiu a fase de lock e typecheck local; a publicação validará novamente no CI da Vercel.
- Supabase confirmou `attendance_history` e `record_attendance_batch` após a aplicação da migration.

A validação pgTAP de identidade simulada permanece dependente do engine Docker local, indisponível neste momento.
