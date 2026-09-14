# Evidências de teste — Task 09

Data: 14/09/2026.

- Portais canônicos: `/socio`, `/professor` e `/aluno`, com menu limitado pelo papel persistido.
- Login redireciona pelo papel para o portal correspondente; a suite de ações validou o aluno em `/aluno`.
- Recuperação responde sem revelar a existência da conta e o callback direciona uma sessão de recuperação para redefinição de senha.
- `npm run typecheck`, `npm run lint`, build de produção e testes unitários focados passaram.
- pgTAP local `task_08_access.sql` passou com Docker Desktop e Supabase local.
