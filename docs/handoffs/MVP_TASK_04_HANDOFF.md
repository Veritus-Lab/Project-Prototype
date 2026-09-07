# Handoff — MVP FLERNK Task 04

Data: 07/09/2026. Branch: `codex/mvp-flernk`. Base anterior: `b331d00629e4b0d0a982d85843b6f4038ac0541f`.

## Entregue

- Contrato central em `docs/TASK_04_CONTRATO_TECNICO.md`: modelo alvo, estados, APIs/RPCs, autorização, idempotência, concorrência, falhas, reconciliação, segurança e observabilidade.
- Decisão de Asaas Checkout hospedado para Pix/cartão e Meta WhatsApp Cloud API para templates.
- Motor interno como única fonte de cobrança recorrente; Asaas não mantém recorrência paralela.
- Vercel Cron como scheduler primário e Supabase Postgres como fonte de verdade/fila durável; Supabase Cron apenas fallback não simultâneo.
- QA-A concluído documentalmente em `docs/testing/mvp-task-04.md` com rastreabilidade das Tasks 01–04.

## Contratos que vinculam as próximas tasks

- Produto dedicado à FLERNK, com `assessoria_id` preservado para ownership e sem cadastro público de outra assessoria.
- Aluno administrativo é desacoplado de `auth.users`; papéis são `socio`, `professor` e `aluno`.
- Professor não consulta tabelas financeiras e recebe somente `em_dia`, `pendente`, `nao_configurado` ou `indisponivel`.
- Matrícula, assinatura, cobrança, checkout, pagamento, liquidação, estorno e disputa têm estados distintos. Confirmação quita a cobrança, mas somente recebimento/disponibilidade validado gera bruto, tarifa, líquido e caixa realizado.
- Dinheiro usa centavos/BRL; vencimentos usam datas civis em `America/Sao_Paulo`; instantes usam UTC.
- Webhooks persistem antes de 2xx, deduplicam por ID externo e processam assincronamente. Redirect nunca confirma pagamento.
- Disputa, derrota e resolução favorável permanecem no mesmo `payments`/`external_payment_id`; fatos externos efetivos ordenados atualizam a projeção sem criar pagamento fictício.
- Eventos financeiros e mensagens têm rotas `GET` próprias, autenticadas por `CRON_SECRET`, para execução pelo Vercel Cron.
- O indicador do professor só calcula adimplência após comprovar watermark/cobertura dos ciclos esperados; lacuna ou run falho retorna `indisponivel`, e isenção ativa válida/coberta retorna `em_dia`.
- Jobs são reentrantes, têm chave natural, claim/lease, retry limitado, dead-letter e replay auditável.
- Operações multirregistro usam RPC/transação; funções privilegiadas ficam em schema privado com privilégios mínimos.

## Consumo e gates

- Task 05: validar plano Vercel, ambientes separados, segredos, Sandbox, backup e rollback.
- Tasks 06–08: criar schema/RLS e migrar papéis após identificar explicitamente a organização/dados FLERNK.
- Tasks 14–21: implementar motor interno com watermark, transações financeiras, confirmação separada de liquidação, disputas, Asaas Checkout, webhook e reconciliação após acesso a Sandbox/credenciais/condições.
- Tasks 22–23: implementar Meta Cloud API e fila após conta, número, opt-in, token e templates aprovados.
- Tasks 29–33: validar duplicação, ordem, perda, recuperação, alertas e piloto antes de produção.

## Limites da evidência

Esta entrega é somente documental. Não alterou código, migrations, Supabase ou Vercel; não criou contas ou credenciais e não executou checkout, cobrança, pagamento, cron ou mensagem. Os provedores estão escolhidos arquiteturalmente, mas sua disponibilidade real ainda não foi comprovada.

## Próximo passo

Executar a Task 05 e o QA-B: registrar baseline reproduzível, preparar ambientes isolados, impedir escrita/envio real em preview e definir backup/rollback antes da fundação de dados.
