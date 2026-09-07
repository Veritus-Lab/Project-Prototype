# QA-A — Task 01: regras da operação

Data: 07/09/2026. Estado: PASSOU (revisão documental). Versão avaliada: alteração documental da Task 01, antes do commit. Ambiente: repositório local; nenhuma aplicação, banco, provedor de pagamento ou WhatsApp foi executado.

## Requisitos avaliados e evidência

| Requisito | Evidência documental | Resultado |
| --- | --- | --- |
| Task 01 concluída sem alegar integrações ou dados reais | Estado em `TASKS_MVP_FLERNK.md` e ressalvas em `TASK_01_REGRAS_OPERACAO.md` | Passou |
| D02–D11 convertidas em padrões configuráveis | Tabela “Contrato de produto” em `TASK_01_REGRAS_OPERACAO.md` | Passou |
| Alcance e limite financeiro do professor | D01–D02, estados/invariantes e exemplo de professor | Passou |
| Despesas e caixa no MVP | D03 e `MVP_FLERNK_GESTAO.md`, seção 4.5 | Passou |
| Separação financeira e atraso sem suspensão automática | Estados/invariantes e exemplo de atraso | Passou |
| Datas, renovação e ausência de rateio complexo | D05–D06 e exemplos de primeiro vencimento, mês curto e renovação | Passou |
| Pix/cartão, WhatsApp, faltas e captação | D07–D10 e exemplos correspondentes | Passou |
| Exemplos e pendências externas responsáveis | Exemplos fechados e tabela de pendências, todas atribuídas aos Sócios FLERNK | Passou |

## Verificações executadas

- Revisão de consistência entre `MVP_FLERNK_GESTAO.md`, `TASKS_MVP_FLERNK.md` e `TASK_01_REGRAS_OPERACAO.md`: exemplos mantêm a matriz de permissões e os critérios globais.
- Busca textual pelos estados antigos de decisão (`Aguardando usuário/sócios` e equivalentes): não deve restar decisão operacional pendente; dados externos aparecem apenas como insumos identificados.
- `git diff --check`: deve terminar com código 0.

## Limites e preocupações

Esta QA-A não executa testes de código, banco, RLS, checkout, webhook ou envio de WhatsApp e não afirma que essas integrações existem. A escolha e as credenciais de provedores, os dados comerciais, turmas, materiais e o aceite humano seguem pendentes dos Sócios FLERNK nas tasks indicadas.
