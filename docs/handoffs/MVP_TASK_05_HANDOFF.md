# Handoff — MVP FLERNK Task 05

Data: 08/09/2026. Branch: `codex/mvp-flernk`.

## Entregue

- dependências exatas de Playwright/cobertura no `package-lock.json`;
- cobertura V8 com baseline global visível e meta de 80% para o núcleo crítico;
- guard de ambiente fail-closed e testes TDD;
- preview read-only aplicado antes de mutações de Auth e banco, com sandbox externo sob habilitação explícita;
- Playwright desktop/mobile, relatório HTML, trace e screenshot em falha;
- fixture sintética para dois sócios, professor, dois alunos e anônimo;
- runner pgTAP que fixa Supabase local;
- workflow GitHub Actions sem secrets reais;
- matriz de ambientes e plano de backup/rollback.

## Gates para continuidade

1. O baseline global permanece abaixo de 80%, visível separadamente; o núcleo financeiro, comunicação, convite, autenticação e ambiente passa o gate de 80% em todas as métricas.
2. Docker está ausente localmente; o job `database` passou migrations e 65 testes pgTAP na stack isolada no [run 34200813929](https://github.com/Veritus-Lab/Project-Prototype/actions/runs/34200813929).
3. Preview não possui Supabase isolado e só pode receber smoke público read-only.
4. Vercel Hobby não atende cron frequente; decidir Pro ou scheduler alternativo antes das integrações.
5. Identificação da organização real, advisors, restauração ensaiada e credenciais sandbox continuam gates das tasks indicadas.

Nenhuma operação foi feita no Supabase remoto ou na produção Vercel. O preview do SHA aprovado ficou READY e respondeu HTTP 200. A Task 06 pode iniciar a fundação de dados em banco descartável.
