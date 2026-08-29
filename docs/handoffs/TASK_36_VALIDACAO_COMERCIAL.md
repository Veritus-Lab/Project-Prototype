# Task 36 - Validação comercial

## Verificações concluídas

- Smoke test de leitura da produção atual: `GET /login` respondeu HTTP 200 e
  apresentou a tela de entrada.
- Testes direcionados das Tasks 30 a 34 foram aprovados durante as entregas.
- `npm run typecheck` foi executado sem erro nesta task.
- `git diff --check` não encontrou erros de whitespace.

## Bloqueios para concluir a entrega

1. A branch `codex/task-10-real-dashboards` possui sete commits ainda fora de
   `origin/main`. A Vercel de produção continua refletindo `main`; não houve
   promoção desta entrega.
2. A carga demo não pode ser executada com segurança neste ambiente porque
   `SUPABASE_SERVICE_ROLE_KEY` e `FLERNK_DEMO_PASSWORD` não estão definidos.
3. O runner local encerrou `npm test` sem resumo e não avançou para `npm run
   build` quando ambos foram solicitados. Por isso não há declaração de suite
   completa ou build verde.

## Próximas ações de liberação

1. Disponibilizar as credenciais administrativas somente no terminal local e
   executar `scripts/seed-demo.mjs` conforme `docs/DEMO_APRESENTACAO.md`.
2. Executar `npm test` e `npm run build` em CI ou em terminal que mantenha os
   processos até o fim.
3. Revisar e promover `codex/task-10-real-dashboards` para `main`.
4. Confirmar o deploy Vercel e testar login nas contas demo, desktop e celular.
