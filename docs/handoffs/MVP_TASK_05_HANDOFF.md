# Handoff — MVP FLERNK Task 05

Data: 07/09/2026. Branch: `codex/mvp-flernk`.

## Entregue

- dependências exatas de Playwright/cobertura no `package-lock.json`;
- cobertura V8 com meta global de 80%;
- guard de ambiente fail-closed e testes TDD;
- Playwright desktop/mobile, relatório HTML, trace e screenshot em falha;
- fixture sintética para dois sócios, professor, dois alunos e anônimo;
- runner pgTAP que fixa Supabase local;
- workflow GitHub Actions sem secrets reais;
- matriz de ambientes e plano de backup/rollback.

## Gates para continuidade

1. O baseline legado permanece abaixo de 80%, visível separadamente; o núcleo crítico estabilizado passa o gate de 80%.
2. Docker está ausente localmente. Exigir resultado verde do job `database` antes de aceitar migrations da Task 06.
3. Preview não possui Supabase isolado e só pode receber smoke público read-only.
4. Vercel Hobby não atende cron frequente; decidir Pro ou scheduler alternativo antes das integrações.
5. Identificação da organização real, advisors, restauração ensaiada e credenciais sandbox continuam gates das tasks indicadas.

Nenhuma operação foi feita em Vercel ou Supabase remoto. O próximo passo é revisão independente da Task 05; após resolução/aceite dos gates, a Task 06 cria a fundação de dados em banco descartável.
