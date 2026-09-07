# Task 01 — Regras da operação FLERNK

Concluída em 07/09/2026. Estado: CONCLUÍDA. Referência: [MVP_FLERNK_GESTAO.md](MVP_FLERNK_GESTAO.md). Esta task fecha padrões de implementação configuráveis; não cria dados, integrações, contas ou envios reais.

## Contrato de produto

| ID | Regra fixada | Configuração futura permitida |
| --- | --- | --- |
| D01–D02 | O professor opera todas as turmas da FLERNK. Vê somente `em dia`, `pendente`, `não configurado` ou `indisponível`; nunca valores, cobranças, pagamentos, despesas, caixa ou configurações financeiras. | A apresentação do indicador, sem ampliar o dado entregue pelo servidor. |
| D03 | O MVP inclui despesas e caixa básico, com previsto e realizado separados. | Categorias e saldo inicial reais. |
| D04 | Quantidade de alunos, origem e qualidade dos dados são insumos de inventário; não bloqueiam a regra de negócio. | Valores e dados reais fornecidos pelos Sócios FLERNK. |
| D05–D06 | Matrícula, assinatura, cobrança e pagamento são separados. Atraso não altera matrícula automaticamente. A primeira cobrança é o próximo vencimento igual ou posterior ao início; meses curtos usam o último dia; datas usam `America/Sao_Paulo`. Renovação mensal automática é o padrão por plano, sem rateio automático complexo. | Dia de vencimento, preço, periodicidade, renovação por plano, descontos, reajustes e exceções manuais auditáveis. |
| D07 | Pix e cartão usam um único provedor, selecionado por oferecer checkout seguro. Confirmação vem do provedor, não do navegador. | Provedor, conta, credenciais e métodos disponíveis. |
| D08 | Lembretes de WhatsApp seguem D-5, D-1 e D+3 como padrão configurável. Há opt-out e revalidação de cobrança, matrícula e preferência antes de cada envio. | Número, conta, modelos, limites e credenciais aprovados. |
| D09 | Após três faltas consecutivas em encontros elegíveis, há alerta interno configurável. Aluno solicita justificativa; equipe decide. | Limiar e turmas reais; cancelado ou não registrado nunca conta como falta. |
| D10 | Landing capta interesse em plano ou aula experimental quando disponível. A equipe converte manualmente; envio do formulário não cria usuário, assinatura ou cobrança. Preços ficam ocultos até haver decisão dos Sócios FLERNK e material comercial real. | Oferta de experimental, preços, locais, equipe, fotos e depoimentos autorizados. |
| D11 | Prazo, orçamento e aceite são entradas de governança, não regras inventadas pelo produto. | Valores e aceite dos Sócios FLERNK. |

## Estados e invariantes

- Matrícula: `ativa`, `suspensa` ou `encerrada`; a alteração registra histórico. Suspensão e encerramento exigem ação administrativa explícita.
- Assinatura: registra plano e condições contratadas, início, vencimento e término quando houver. A renovação é contratual e não equivale à quitação de uma cobrança.
- Cobrança: é única por competência/ciclo e possui vencimento próprio. Cobrança vencida e não paga produz `pendente`; ela não suspende matrícula.
- Pagamento: é a confirmação de recebimento de uma cobrança, por provedor ou baixa manual auditável. Retorno do navegador não basta.
- Para o professor, cobrança vencida, não paga e não cancelada/isenta resulta em `pendente`; vínculo financeiro válido sem cobrança vencida pendente resulta em `em dia`; cadastro sem plano/dados financeiros resulta em `não configurado`; erro de consulta resulta em `indisponível`. O indicador não bloqueia presença nem participação.

## Exemplos fechados de aceite

| Cenário | Resultado esperado |
| --- | --- |
| Matrícula | A equipe cadastra Ana sem login, cria matrícula ativa e depois aceita o convite. A conta se vincula ao cadastro existente, sem criar outra aluna. |
| Primeiro vencimento | Assinatura iniciada em 30/03/2026, com vencimento no dia 31: primeira cobrança vence em 31/03/2026. Se iniciada em 01/04/2026, vence em 30/04/2026, pois abril não tem dia 31. |
| Mês curto | Plano com vencimento no dia 31 gera cobrança em 28/02/2026 e em 31/03/2026, usando `America/Sao_Paulo`. |
| Pausa | Pausa efetiva em 15/05 interrompe novas cobranças a partir dessa data. Cobrança já emitida não é apagada ou rateada automaticamente; qualquer cancelamento ou ajuste é manual e auditável. |
| Atraso | Cobrança de 10/06 não paga em 11/06 deixa o indicador do professor como `pendente`, mas a matrícula continua ativa até ação administrativa. |
| Renovação | Plano mensal com renovação automática cria o próximo ciclo conforme o plano. Plano configurado sem renovação chega ao término sem criar novo ciclo; quitar uma parcela não altera essa escolha. |
| Pagamento | O aluno abre checkout seguro para Pix ou cartão. A cobrança só fica paga após confirmação autenticada do provedor; voltar da página de checkout sem evento confirmado não dá baixa. |
| Professor | O professor abre a turma de Ana, vê `pendente`, faz chamada e avalia uma justificativa solicitada por ela. Nenhuma tela, API ou URL fornece valor, cobrança ou caixa. |

## Pendências externas

| Pendência externa real | Responsável | Task bloqueada |
| --- | --- | --- |
| Dados, volume, ferramenta atual, planos, valores, vencimentos e saldo inicial reais | Sócios FLERNK | 02, 14, 15, 18 e 28 |
| Provedor, conta, credenciais e ambiente de teste de Pix/cartão | Sócios FLERNK | 19 e 20 |
| Número, conta, modelos aprovados e credenciais de WhatsApp | Sócios FLERNK | 22 e 23 |
| Turmas, locais, horários, professor e materiais comerciais reais | Sócios FLERNK | 02, 12, 25 e 27 |
| Oferta de aula experimental, decisão sobre preços públicos, prazo, orçamento, identidades de equipe e aceite humano | Sócios FLERNK | 08, 27, 30, 31 e 32 |

## Encaminhamento

As Tasks 02–04 podem usar este contrato sem aguardar nova decisão operacional. Elas continuam dependentes dos dados e credenciais externos indicados quando precisarem deles. A revisão documental QA-A está registrada em `docs/testing/mvp-task-01.md`.
