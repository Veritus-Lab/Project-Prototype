# FLERNK — Task 06: fundação de dados

Data: 08/09/2026. Estado: EM VALIDAÇÃO no banco descartável do CI. Branch: `codex/mvp-flernk`.

## Entrega

A migration `20260908085542_mvp_foundation_data_model.sql` cria de forma aditiva o modelo alvo definido na Task 04. Ela não renomeia, remove, atualiza nem converte tabelas ou linhas legadas. As novas 36 tabelas cobrem equipe, alunos administrativos, matrículas, turmas, presença, planos, assinaturas, cobrança, pagamentos, caixa, integrações, WhatsApp, leads e auditoria.

Os estados de domínio têm tipos explícitos e equivalentes TypeScript em `src/types/mvp-foundation.ts`. `scripts/generate-mvp-foundation-types.mjs` gera `Row`, `Insert`, `Update`, relacionamentos e enums das 36 tabelas para `src/types/mvp-database.generated.ts`; o tipo `Database` do cliente Supabase incorpora esse contrato, e o CI bloqueia drift. Valores monetários usam centavos inteiros e moeda BRL; vencimentos e competências usam `date`; fatos e processamento usam `timestamptz`. Relações de negócio carregam `assessoria_id` e FKs compostas impedem vínculos entre organizações e entre agregados incompatíveis.

Todas as tabelas novas nascem com RLS habilitada e forçada. `public`, `anon` e `authenticated` não recebem acesso antecipado. A `service_role` recebe somente as operações necessárias para a camada de servidor; históricos, movimentos e auditoria não recebem UPDATE ou DELETE. As políticas de sócio, professor e aluno pertencem à Task 07.

## Compatibilidade e migração da FLERNK

A migration estrutural não tenta descobrir qual registro legado representa a FLERNK e não promove treinador para sócio por nome, e-mail ou slug. O ensaio de upgrade cria dados legados sintéticos antes da Task 06, aplica a migration pendente e confirma que organização, perfis, treinador, atleta, assinatura, cobrança e preferência permanecem iguais. As novas tabelas continuam vazias, comprovando ausência de backfill implícito.

A migração real permanece bloqueada pelo gate da Task 02. Quando os sócios informarem os UUIDs aprovados, uma migration de dados separada deve usar allowlist explícita, mapear os dois sócios e o professor, criar `students` e seus `legacy_atleta_id`, comparar contagens e abortar diante de qualquer registro fora do conjunto aprovado.

## Operação sem planos pagos

- Supabase gratuito: banco principal e CI com stack local descartável; sem branching pago, `pg_cron`, `pg_net`, Edge Functions ou Storage adicional.
- Vercel Hobby: um cron diário em lotes limitados; webhooks tratam eventos externos quando chegam. A execução diária aceita a precisão horária do plano gratuito.
- Índices parciais cobrem filas pendentes e evitam crescimento desnecessário. Nenhum catálogo ou dado de demonstração é criado pela migration.
- Nenhum ambiente remoto recebeu migration nesta task.

## Gates de validação

- teste de contrato da migration executado em RED e depois GREEN;
- executar pgTAP da fundação: 44 assertions de schema, RLS, grants, vínculos, centavos e unicidade;
- executar pgTAP de compatibilidade: 9 assertions após upgrade de uma base legada sintética;
- preservar a suíte pgTAP anterior;
- aprovar typecheck, lint, unitários e build no mesmo gate de CI.
