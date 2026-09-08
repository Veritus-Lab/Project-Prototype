# FLERNK — Baseline, ambientes e proteção de qualidade

Data: 08/09/2026. Estado: infraestrutura implementada; QA-B local aprovado e pgTAP pendente em runner com Docker.

## Baseline reproduzível

- Node `v24.19.0`; npm temporário `11.6.0` por `pnpm dlx npm@11.6.0`, pois o runtime local não expõe `npm`.
- Instalação inicial a partir de `package-lock.json`: 587 pacotes, 0 vulnerabilidades.
- Baseline anterior: 52 arquivos e 150 testes passaram; typecheck, lint e build passaram; Next.js 16.3.1 gerou 21 páginas.
- Após a infraestrutura: Playwright `1.63.0` e `@vitest/coverage-v8` `4.1.11` estão fixados no lockfile. `test:coverage:baseline` mede todo `src`; `test:coverage` exige 80% do núcleo crítico de ambiente, sessão, convite, autenticação, e-mail, actions, services e validação financeira/comunicação.
- Suíte atual: 58 arquivos e 220 testes passaram. O baseline global é 63,92% statements, 51,11% branches, 61,17% functions e 65,16% lines. O gate crítico mede 464 statements/369 linhas executáveis e passou com 86,42%, 81,68%, 96,66% e 85,90%, respectivamente. O débito restante permanece visível no relatório global.
- Playwright: quatro smokes públicos passaram em Chromium desktop e Pixel 7, cobrindo landing, navegação ao login e campos acessíveis sem enviar credenciais.

## Contrato de ambientes

| Ambiente | Supabase | Integrações externas | Dados e efeitos permitidos |
| --- | --- | --- | --- |
| `development` | stack local por padrão; remoto somente com ref descartável explicitamente permitido | `disabled` ou `sandbox` | fixtures sintéticas; nenhuma escrita de produção |
| `test` | stack local descartável | `disabled` ou `sandbox` | reset, migrations, pgTAP, unitário e E2E sintético |
| `preview` | somente leitura, mesmo com ref isolado | `disabled` ou sandbox explicitamente habilitado | smoke público e efeitos sandbox allow-listed; nenhuma mutação da aplicação ou envio real |
| `production` | projeto FLERNK identificado e aprovado | `live` apenas após gates das Tasks 19, 22 e 31 | operação real auditada; nunca usada por runners |

`APP_ENV` declara o contexto e `EXTERNAL_INTEGRATIONS_MODE` declara efeitos. `NODE_ENV` sozinho não autoriza nada. O guard inspeciona URL, host/ref, credenciais privilegiadas, modos `live` e nomes de segredos em `NEXT_PUBLIC_*`; contexto ambíguo falha fechado. Produção exige `VERCEL_ENV=production`, e qualquer divergência com `VERCEL_ENV`/`VERCEL_TARGET_ENV` bloqueia escrita e efeitos externos. O ref de produção `hrmyqrekasuqhiqmqske` é bloqueado explicitamente. Mutações atuais de cadastro, convite, atleta, treino, execução, equipamento, avaliação, agenda, finanças e comunicação passam pela mesma policy antes de criar o client Supabase.

Asaas e WhatsApp em sandbox exigem simultaneamente modo `sandbox`, ambiente do provedor `sandbox`, `ALLOW_SANDBOX_EXTERNAL_EFFECTS=true` e inclusão nominal em `SANDBOX_EXTERNAL_EFFECTS_ALLOWLIST`. E-mail e qualquer modo `live` permanecem exclusivos de `production/live`.

Um projeto remoto de teste exige `TEST_SUPABASE_PROJECT_REF` idêntico ao ref extraído do host e diferente de produção. O preview atual não possui branch Supabase isolada; portanto, testes, fixtures e migrations permanecem bloqueados nele.

## Execução local e CI

Com ambiente seguro explícito:

```text
APP_ENV=test
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXTERNAL_INTEGRATIONS_MODE=disabled
```

Os scripts são `test:env-guard`, `test`, `test:coverage:baseline`, `test:coverage`, `test:e2e` e `test:db`. O runner pgTAP chama somente `supabase db reset --local --no-seed` e `supabase test db supabase/tests --local`; não aceita `--linked`, `--db-url`, `--project-ref` ou `--password`.

O workflow `quality.yml` usa `npm ci`, permissões somente de leitura, variáveis sintéticas, Supabase local no runner Ubuntu e Chromium. Ele não consome secrets do GitHub. Artefatos Playwright são enviados apenas em falha e contêm somente sessões anônimas sintéticas.

Docker CLI não existe nesta máquina, então o pgTAP local não foi executado. Essa ausência não vira skip: o job de banco no Ubuntu inicia a stack local e executa migrations + pgTAP. A Task 06 só pode aceitar schema após evidência desse job ou execução em máquina descartável com Docker.

## Vercel e Supabase observados

- Vercel: time `Flernk-Dev`, projeto `project-prototype`, plano Hobby. Produção observada no commit `55863f0`; preview da Task 04 estava READY no commit `6c5f9fd`.
- O Hobby aceita cron no mínimo diário, com precisão horária. Isso não atende drenagem frequente de filas. Upgrade Pro ou scheduler alternativo deve ser decidido antes das Tasks 19/22/31. Instant Rollback da aplicação não atualiza automaticamente os crons ativos; rollback exige conferência própria da agenda.
- Supabase: projeto ativo `hrmyqrekasuqhiqmqske`, Postgres 17.6.1, `sa-east-1`, apenas branch `main`.
- Advisors somente leitura apontaram cinco exposições de três funções `SECURITY DEFINER` a papéis públicos/autenticados e proteção de senha vazada desabilitada, além de avisos de performance existentes. As correções pertencem às Tasks 06–08 e precisam de regressão RLS.

## Backup, virada e rollback

Responsáveis: responsável técnico prepara e registra evidências; os sócios aprovam janela, dados e aceite; a pessoa com acesso Supabase/Vercel executa somente após aprovação.

1. Confirmar plano, retenção e disponibilidade real de PITR/backup no Supabase. Não presumir que o plano atual oferece restauração no ponto desejado.
2. Antes da virada, congelar mudanças, identificar a organização real e gerar dump lógico autenticado em armazenamento controlado, com hash, horário, responsável e retenção.
3. Aplicar apenas migrations aditivas e compatíveis com a versão anterior. Mudanças destrutivas exigem etapa posterior após estabilização.
4. Restaurar o dump em ambiente descartável e validar contagens, vínculos, saldos e RLS. A restauração ainda não foi ensaiada; é gate das Tasks 28/31.
5. Reverter aplicação selecionando deployment imutável conhecido e conferir separadamente cron e variáveis. Banco segue roll-forward com migration corretiva; não apagar dados para simular rollback.
6. Registrar versão de app/schema, horários, checks e decisão de seguir ou abortar. Produção só recebe smoke não destrutivo na Task 32.

Referências oficiais: [Vercel Cron — uso e preço](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Vercel — gerenciamento de Cron](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [Supabase CLI — testes locais](https://supabase.com/docs/guides/local-development/cli/testing-and-linting).
