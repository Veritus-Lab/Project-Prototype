# Task 15 — Motor de cobranças

Referência: implementação do motor de ciclo em `20260914160000_task_15_billing_generation.sql`.

## Casos cobertos

- Dia de vencimento 31 é limitado ao último dia de fevereiro.
- Contrato iniciado depois do vencimento começa no próximo ciclo de sua periodicidade.
- O gerador bloqueia concorrência por assessoria e usa as chaves únicas `(subscription_id, cycle_key)` em `billing_cycles` e `charges`; reprocessar a mesma janela não cria outra cobrança.
- Assinaturas pausadas, isentas, encerradas ou canceladas deixam de participar de novos ciclos. Cobranças já criadas não são removidas.
- Cada transição guarda sua data de vigência; uma reativação futura preserva intervalos de pausa anteriores quando o motor processa meses passados.
- A consulta de cobranças, ciclos, processamentos e watermarks está limitada a sócios pelo RLS; as alterações passam pelas RPCs `security definer` que confirmam o papel.

## Evidências executadas

- `npm test -- src/lib/billing/cycle.test.ts` — código 0; 3 testes passaram.
- `npm run typecheck` — código 0.
- `npm run lint` — código 0.
- Supabase de produção: migration `task_15_billing_generation` aplicada e conferidas as RPCs e as quatro policies de leitura.

## Limitações

- A prova de concorrência e de RLS precisa de pgTAP em banco local isolado. O Docker Desktop local ainda não expõe o engine Linux necessário; portanto nenhum fixture ou geração de cobrança foi executado em produção.
- Revisão independente: `PASSOU` após a correção da vigência de transições. A revisão foi estática; pgTAP continua pendente do Docker local.
