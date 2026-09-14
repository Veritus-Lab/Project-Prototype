# Task 10 — Cadastro administrativo de alunos

**Versão:** pendente de commit  
**Ambiente:** desenvolvimento local e Supabase de produção `hrmyqrekasuqhiqmqske` (somente aplicação de DDL, sem fixtures).

## Critérios cobertos

- Sócio cadastra aluno sem conta autenticada do aluno.
- Busca por nome, e-mail ou telefone.
- Convite de acesso é independente da matrícula e vincula o cadastro existente por `students.auth_user_id`.
- A conta confirmada só pode ser vinculada uma vez; o e-mail do convite é conferido no RPC.
- Professor consulta a lista, sem criar aluno, convite ou matrícula.

## Evidências

- `npm test -- src/app/(dashboard)/treinador/atletas/page.test.tsx src/lib/services/student-invitation.service.test.ts`: 3 testes aprovados.
- `npm run typecheck` e `npm run lint`: aprovados.
- Supabase: migrations `task_10_student_access_invitations` e `task_10_socio_only_student_mutations` aplicadas; consulta posterior confirmou as políticas `students_insert_socio`, `students_update_socio` e `enrollments_insert_socio`.
- Revisão independente identificou permissões indevidas do professor. Foram corrigidas no serviço, nas políticas RLS e nos RPCs de matrícula antes desta validação.

## Limitação de ambiente

O pgTAP local não foi executado nesta task porque o daemon do Docker Desktop não disponibilizou o engine Linux, embora a aplicação do DDL no Supabase tenha sido concluída. A validação de aceitação/expiração de convite e RLS com identidades sintéticas permanece indicada para a regressão de QA-D assim que o engine local estiver disponível.