# Handoff — MVP FLERNK Task 07

Data: 13/09/2026. Branch e `main`: `137dbe4`. Status: **concluída**.

## Entregue

- autorização persistida para `socio`, `professor` e `aluno`, com sessão que falha fechada quando não consegue verificar a associação;
- RLS e backfill explícito do modelo legado para membros da equipe e alunos administrativos;
- RPC e rota `GET /api/v1/professor/students/[studentId]/financial-status` que retornam somente o enum financeiro permitido ao professor;
- validação de autenticação, tenant, UUID e indisponibilidade, sem dados financeiros no erro ou no payload do professor;
- helpers privados com `search_path` fixo, acesso anônimo negado e execução autenticada necessária às políticas RLS;
- migrations reproduzíveis em banco vazio, preservação do fixture legado e pré-cadastro FLERNK idempotente;
- CI com diagnóstico de banco, pgTAP, cobertura, static checks, build e Playwright; publicação em produção concluída.

## Evidência de entrega

- CI: [workflow 34794139772](https://github.com/Veritus-Lab/Project-Prototype/actions/runs/34794139772), aprovado em todos os jobs;
- Supabase: migration remota `task_07_authorization_hardening` aplicada e grants verificados;
- produção: [project-prototype-ashy.vercel.app](https://project-prototype-ashy.vercel.app), deploy `dpl_4cbDtfDQMLCXbwh3oRAgdiPuheY1`, resposta HTTP 200 e sem erros de runtime recentes.

## Próxima task

Task 08 formaliza o acesso exclusivo da FLERNK: fluxo público não cria assessoria ou papel, dois sócios e professor recebem contas individuais por convite e o último sócio ativo permanece protegido. Não atribuir pessoas ou endereços reais sem confirmação operacional explícita.
