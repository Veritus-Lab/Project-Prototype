# Revisão documental da Task 01 — contribuição para QA-A

Data: 07/09/2026. Estado: PARCIAL/PENDENTE. Versão avaliada: conjunto documental da Task 01 na branch `codex/mvp-flernk`, diff da base `55863f0da0ea082c0052016e7b030f744686cec5` até `HEAD`. Histórico de ciclos já fechados: `3fedb5c`, `0422f2c` e `513b068`. O SHA final deste ciclo é registrado pelo Git e pelo relatório de execução; ele não é previsto dentro do próprio commit. Ambiente: repositório local; nenhuma aplicação, banco, provedor de pagamento ou WhatsApp foi executado.

Esta revisão cobre exclusivamente a Task 01. O marco QA-A permanece pendente de conclusão após as Tasks 02–04, que devem acrescentar inventário/migração, jornadas/navegação e contrato técnico de integrações. Este relatório não declara o marco QA-A completo ou aprovado.

## Requisitos da Task 01 avaliados e evidência

| Requisito | Evidência documental | Resultado |
| --- | --- | --- |
| Status concluído sem alegar integrações ou dados reais | `TASKS_MVP_FLERNK.md` e `TASK_01_REGRAS_OPERACAO.md` | Passou |
| D02–D11 como padrões configuráveis | Tabela “Contrato de produto” em `TASK_01_REGRAS_OPERACAO.md` | Passou |
| Professor com quatro estados agregados e sem dados financeiros | Matriz de permissões, exemplos e casos futuros em `MVP_FLERNK_GESTAO.md`, `TASKS_MVP_FLERNK.md` e `SKILLS_E_TESTES_MVP_FLERNK.md` | Passou |
| Despesas, caixa, separação financeira e atraso | D03, estados/invariantes e exemplo de atraso | Passou |
| Datas, renovação e ausência de rateio complexo | D05–D06 e exemplos de primeiro vencimento, mês curto e renovação | Passou |
| Pix/cartão, WhatsApp, faltas e captação | D07–D10 e exemplos correspondentes | Passou |
| Preço público condicionado a decisão dos sócios e material comercial real | D10 e seção de landing em `MVP_FLERNK_GESTAO.md` | Passou |
| Pendências externas com responsável e task bloqueada | Tabelas “Entradas externas” e “Pendências externas” | Passou |

## Verificações executadas

- Busca focada confirmou os quatro estados do professor em matriz, critérios de aceite, roteiro de homologação e casos futuros.
- Busca focada confirmou que preço público exige cumulativamente decisão dos Sócios FLERNK e material comercial real.
- Revisão de consistência confirmou que atraso não suspende matrícula automaticamente, pausa não rateia nem altera cobrança emitida automaticamente e os exemplos respeitam a matriz de permissões.
- `git diff --check` passou na versão final do Fix round 1 antes do commit.

## Escopo ainda pendente do QA-A

- Task 02: evidência de inventário, origem/destino e tratamento de dados reais sem presumir exclusões.
- Task 03: jornadas e navegação verificadas para sócios, professor, aluno e interessado.
- Task 04: contrato técnico de dados, estados, provedor, geração recorrente, autenticação, falhas e idempotência.
- Revisão consolidada de rastreabilidade requisito → task → caso após as Tasks 02–04.

## Limites e preocupações

Não houve testes de código, banco, RLS, checkout, webhook ou WhatsApp. O diagnóstico remoto descrito em `MVP_FLERNK_GESTAO.md` é histórico externo e não é evidência desta revisão. Dados reais, credenciais, materiais comerciais e aceite humano seguem pendentes dos Sócios FLERNK nas tasks indicadas.
