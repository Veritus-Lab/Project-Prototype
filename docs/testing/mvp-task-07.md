# QA-C — Task 07

Data: 13/09/2026. Resultado: **QA-C APROVADO**.

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Papéis e sessão | PASSOU | A sessão falha fechada quando a associação persistida não pode ser consultada; sócio, professor e aluno são resolvidos por dados persistidos. |
| Professor sem financeiro detalhado | PASSOU | A RPC `get_student_financial_status` devolve apenas `em_dia`, `pendente`, `nao_configurado` ou `indisponivel`; rota valida UUID e retorna 401, 403, 400 ou 503 sem payload financeiro. |
| Isolamento no banco | PASSOU | pgTAP cobre anônimo, aluno A/B, professor, sócio, tenant cruzado e acesso direto às tabelas financeiras. O professor recebe coleção vazia para financeiro direto e somente o enum agregado na RPC autorizada. |
| Helpers de RLS | PASSOU | Funções privadas têm `search_path` fixo, são negadas a `anon` e executáveis somente por `authenticated`, requisito técnico para as políticas RLS. O schema `private` não integra os schemas expostos pela Data API. |
| Compatibilidade e dados | PASSOU | Banco limpo provisiona a assessoria FLERNK antes do pré-cadastro; fixture legado valida o backfill explícito de aluno e sócio sem criar organização pelo fluxo público removido. |
| Revisão independente | PASSOU | Revisor de segurança aprovou a revisão estática após a correção da classificação real de `NEXT_REDIRECT`; a execução pgTAP foi comprovada depois pelo CI. |
| Verificação local | PASSOU | `lint`, `typecheck`, `check:foundation-types` e 52 testes direcionados passaram. O Docker não está disponível nesta máquina; pgTAP foi executado apenas no runner descartável do CI. |
| CI completo | PASSOU | [workflow 34794139772](https://github.com/Veritus-Lab/Project-Prototype/actions/runs/34794139772): unit, coverage, static, build, database e E2E concluídos com sucesso. |
| Supabase remoto | PASSOU | A migration `task_07_authorization_hardening` foi aplicada. A verificação posterior confirmou `anon = false` e `authenticated = true` para os três helpers privados necessários ao RLS. |
| Produção Vercel | PASSOU | Deploy `dpl_4cbDtfDQMLCXbwh3oRAgdiPuheY1` ficou `READY` no commit `137dbe4`; a landing oficial respondeu HTTP 200 e não houve erros de runtime na última hora. |

Limite mantido: esta task não criou, alterou ou atribuiu papéis a pessoas reais da FLERNK. A criação controlada de contas e os convites pertencem à Task 08.
