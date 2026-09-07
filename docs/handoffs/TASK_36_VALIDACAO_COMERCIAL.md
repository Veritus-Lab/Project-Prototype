# Task 36 - Validação comercial

## Verificações concluídas

- Smoke test de leitura da produção atual: `GET /login` respondeu HTTP 200 e
  apresentou a tela de entrada.
- Testes direcionados das Tasks 30 a 34 foram aprovados durante as entregas.
- `npm run typecheck` foi executado sem erro nesta task.
- `git diff --check` não encontrou erros de whitespace.
- `npm run lint`, `npm run typecheck` e `npm run build` foram executados
  novamente em 06/09/2026 e aprovados.
- O build deixou de depender do download da fonte Inter durante a compilação,
  preservando a fonte de sistema como fallback explícito. Assim, a validação de
  produção também funciona em ambientes sem acesso ao Google Fonts.

## Bloqueio externo para a validação comercial completa

1. A carga demo não pode ser executada com segurança neste ambiente porque
   `SUPABASE_SERVICE_ROLE_KEY` e `FLERNK_DEMO_PASSWORD` não estão definidos.
2. Sem a carga demo, não é possível testar login de treinador e atleta,
   jornadas desktop/mobile ou persistência no Supabase sem inventar contas ou
   alterar o ambiente remoto.

O runner agregado do Vitest ainda não devolve um resumo final de forma
confiável neste Windows. Os testes exibidos durante a execução permanecem
verdes, mas a suíte completa deve ser confirmada no CI antes da liberação.

## Promoção e disponibilidade

- `origin/main` foi promovido por fast-forward para `f8cc8aa`.
- O deploy automático da Vercel foi acionado pelo push para `main`.
- O smoke test pós-promoção em `https://project-prototype-ashy.vercel.app/login`
  respondeu HTTP 200 e exibiu a tela de entrada.

## Próximas ações de liberação

1. Disponibilizar as credenciais administrativas somente no terminal local e
   executar `scripts/seed-demo.mjs` conforme `docs/DEMO_APRESENTACAO.md`.
2. Executar `npm test` em CI ou em terminal que mantenha os processos até o
   fim. O build já está validado localmente.
3. Testar login nas contas demo, desktop e celular.
