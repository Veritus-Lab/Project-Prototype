# Revisão documental da Task 04 — contrato técnico e QA-A

Data: 07/09/2026. Estado: PASSOU para a entrega documental. QA-A (Tasks 01–04): **PASSOU documentalmente**. Ambiente: revisão local; nenhum código, migration, RLS, checkout, webhook, cron, pagamento, mensagem, Supabase ou Vercel foi executado ou alterado.

## Revisão do contrato

| Verificação | Evidência em `TASK_04_CONTRATO_TECNICO.md` | Resultado |
| --- | --- | --- |
| Uma fonte de cobrança recorrente | Decisões 2 e 5; processo de geração | Passou: motor interno único, provedor sem recorrência paralela |
| Provedores e limites | Decisões 3–5 e gates | Passou: Asaas Checkout, Meta Cloud API e Vercel Cron, sem alegar contas configuradas |
| Entidades e ownership | Modelo alvo e relação com legado | Passou: FLERNK única no produto, `assessoria_id`, aluno desacoplado de auth e histórico preservado |
| Estados separados | Máquinas de matrícula, assinatura, cobrança, checkout, pagamento, liquidação, estorno, disputa, despesa, evento, mensagem e lead | Passou |
| Atomicidade e concorrência | Invariantes, RPCs, locks, leases e constraints únicas | Passou documentalmente |
| Autenticação/autorização | Contratos HTTP/RPC e matriz de permissão | Passou: cron, webhooks, sessão, papel e ownership mapeados |
| Confirmação versus caixa | Modelo, estados, webhook e indicadores | Passou: confirmação quita sem gerar realizado; recebimento validado gera bruto/taxa/líquido e movimento uma vez |
| Filas acionáveis no Vercel | Contratos HTTP/RPC | Passou: provider events, reconciliação, enqueue e message jobs têm rotas `GET` autenticadas por `CRON_SECRET` |
| Disputa e resolução | Estados, ordenação e webhook | Passou: mesmo `payments`/`external_payment_id`, fatos efetivos ordenados e resolução favorável sem novo pagamento |
| Professor limitado e completo | Decisões 7, watermark, endpoint agregado e RLS | Passou: somente `em_dia`, `pendente`, `nao_configurado`, `indisponivel`; lacuna/run falho retorna `indisponivel`; isenção válida retorna `em_dia` |
| Webhooks idempotentes | Persistência antes de 2xx, chave externa, processamento assíncrono e monotônico | Passou documentalmente |
| Falhas e reconciliação | Matriz de falhas, dead-letter, replay e job de reconciliação | Passou |
| Segredos e dados sensíveis | RLS/schema privado, segredos por ambiente e logs redigidos | Passou: nenhum cartão bruto ou segredo é armazenado/logado |
| Relação com legado | Lacunas de tabelas, políticas `is_treinador` e operações não atômicas | Passou: material direcionado às Tasks 06/14–23 |

## Matriz QA-A: requisito → contrato → task/teste

| Requisito das Tasks 01–04 | Contrato verificável | Implementação | Teste futuro |
| --- | --- | --- | --- |
| FLERNK única no produto, ownership interno | `assessoria_id`, sem cadastro público e RLS por ownership | 06–10, 26 | Negar organização cruzada e criação pública (QA-C/D/G) |
| Sócios completos, professor limitado, aluno próprio | Matriz de papel e endpoint agregado | 07–09, 21, 25 | Negativos por papel/URL/RPC e troca de papel (QA-C/F/G) |
| Aluno administrativo antes do login | `students.auth_user_id` opcional/único e convite idempotente | 06, 10 | Aceite repetido não duplica aluno (QA-D) |
| Matrícula independe de atraso | Estados de matrícula, assinatura e cobrança separados | 11, 14–16 | Atraso preserva matrícula ativa (QA-D/E) |
| Primeiro vencimento e mês curto | `date`, ciclo e cálculo em `America/Sao_Paulo` | 14–15 | Casos 30/03, 01/04 e dia 31 de fevereiro/abril (QA-E) |
| Pausa e renovação | Pausa bloqueia ciclos futuros; cobrança emitida fica; renovação separada | 14–15 | Pausa na data efetiva e plano sem renovação (QA-E) |
| Uma cobrança por ciclo | Motor interno e `unique(subscription_id, cycle_key)` | 15 | Reexecução/concorrência cria uma linha (QA-E) |
| Pagamento confiável | Checkout próprio; redirect não paga; confirmação separada de liquidação; disputa no mesmo pagamento | 16, 19–21 | Confirmado sem caixa, recebimento único, duplicação, ordem, disputa/resolução, falha parcial e acesso alheio (QA-E/F/G) |
| Professor vê quatro estados sem detalhe | Contrato retorna somente enum após validar watermark/completude; professor sem leitura financeira | 07, 15, 20, 25 | `nao_configurado`/erro/lacuna não viram `em_dia`; isenção válida vira `em_dia`; payload não contém detalhes (QA-C/E/F/G) |
| WhatsApp D-5/D-1/D+3 e opt-out | Fila única, revalidação e chave cobrança+cadência+template | 22–23 | Reexecução não duplica; quitação/opt-out cancelam (QA-F) |
| Falhas recuperáveis | GETs de cron, eventos duráveis, retry limitado, dead-letter, reconciliação e replay auditado | 20, 23, 29, 31 | Evento perdido, timeout, worker concorrente, cron duplicado e replay (QA-F/H) |
| Chamada e falta elegível | Modelo de encontro/presença e unicidade | 12–13, 25 | Cancelado/não registrado fora do denominador (QA-D/G) |
| Interesse não cria vínculo financeiro | Lead separado e conversão administrativa | 26–27 | Spam/reenvio/conversão sem conta ou cobrança (QA-G) |
| Indicadores financeiros honestos | Cobrança, confirmação, liquidação, disputa, despesa e movimentos separados | 16–18, 20, 24 | `PAYMENT_CONFIRMED` não entra no realizado; recebimento expõe bruto/taxa/líquido; falha não vira zero (QA-E/F/G) |

## Resultado consolidado do QA-A

As Tasks 01–04 cobrem as regras operacionais, inventário/migração, jornadas/telas e contrato técnico. Os exemplos fechados da Task 01 têm entidades, estados, processos e casos de teste futuros correspondentes. As lacunas do legado levantadas na Task 02 são direcionadas a migrations e módulos específicos. As jornadas da Task 03 têm contratos de autorização e falha na Task 04. Não foi encontrada contradição que impeça iniciar a Task 05.

QA-A passa no escopo documental. Esse resultado confirma completude e rastreabilidade do desenho; não comprova comportamento executável. QA-B deve estabelecer ambientes, runners e bloqueios antes das migrations. QA-C a QA-I devem produzir evidência de RLS, integrações, E2E, operação e entrega.

## Verificações executadas

- Busca focada confirmou uma única fonte de geração recorrente e ausência de recorrência paralela no Asaas.
- Busca focada confirmou que o professor recebe somente quatro estados agregados e não acessa tabelas financeiras.
- Revisão cruzada confirmou que run parcial, watermark atrasado ou ciclo ausente produz `indisponivel`, enquanto isenção ativa válida e coberta produz `em_dia`.
- Revisão cruzada confirmou autenticação de cron/webhooks, quatro disparadores `GET` compatíveis com Vercel Cron, ownership de aluno/FLERNK, chaves de idempotência, resposta rápida, fila, dead-letter e reconciliação.
- Revisão da matriz de falhas cobriu confirmação sem liquidação, recebimento repetido, disputa/resolução fora de ordem, duplicação, evento perdido, falha depois de chamada externa, concorrência, opt-out e quitação após enqueue.
- `git diff --check` passou para a entrega documental.

## Limites da evidência

Não houve execução de testes de produto porque a Task 04 não altera comportamento. Contas Asaas/Meta, credenciais, templates, plano Vercel, schema final e ambientes seguem gates explícitos. O aceite deste documento não permite disparos ou mudanças de produção.
