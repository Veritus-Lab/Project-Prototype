# FLERNK — Skills, agentes e validação por task

Atualizado em 07/09/2026. Complementa `MVP_FLERNK_GESTAO.md` e `TASKS_MVP_FLERNK.md`. Estado: infraestrutura QA-B implementada; gate crítico de cobertura aprovado e pgTAP em Docker pendente.

## 1. Inventário verificado

Atualização posterior no mesmo dia: instalada por solicitação do usuário a skill `playwright-skill` 5.0.0, de https://github.com/lackeyjb/playwright-skill, em `C:/Users/Rodrigo Sousa/.codex/skills/playwright-skill`. A instalação pessoal, fora do repositório, possui Playwright 1.63.0 e Chromium. Verificação concluída com código de saída 0: Chromium headless iniciou e renderizou uma página local com título conferido. A skill estará disponível no próximo turno. Usá-la nas tasks de automação de navegador junto de `e2e-testing`; essa instalação pessoal não configura a suíte E2E nem o CI do repositório, que continuam na Task 05-QA. As observações abaixo sobre ausência de Playwright em `package.json` referem-se ao projeto.

- 72 diretórios de skills em `.agents/skills/`; são instruções reutilizáveis, não 72 agentes executando.
- Skills de teste disponíveis: `test-driven-development`, `tdd-workflow`, `e2e-testing`, `verification-loop`, `verification-before-completion`, `systematic-debugging` e `security-review`.
- Revisão por subagente disponível por templates em `.agents/skills/requesting-code-review/code-reviewer.md` e `.agents/skills/subagent-driven-development/task-reviewer-prompt.md`.
- Não foram encontrados registros de agentes especializados em `.codex/agents` do usuário ou `.claude/agents`, nem entradas de agentes na busca dirigida em `.codex/config.toml`. Ausência nesses locais não comprova ausência em toda a máquina.
- Nomes como `tdd-guide`, `e2e-runner` e `security-reviewer` não devem ser apresentados como agentes especializados registrados sem localizar suas definições. Neste plano são funções de trabalho exercidas por subagentes gerais com as skills correspondentes.
- O projeto já declara Vitest, Testing Library, lint, typecheck e build. Há `supabase/tests/rls_isolation.sql` e testes locais de políticas. Teste textual de migration não substitui teste de autorização no banco.
- A Task 05 passou a declarar Playwright, cobertura V8 e scripts E2E/cobertura. O baseline global e o gate do núcleo crítico são relatados separadamente.

A disponibilidade de uma skill não obriga usar todas. Abrir o SKILL.md ao aplicá-la, selecionar por responsabilidade e adaptar exemplos ao projeto e às instruções do usuário. Não copiar comandos de instalação, versões ou padrões de outra stack sem verificar.

## 2. Convenção de execução e agentes

| Papel de trabalho | Skills/fontes | Responsabilidade | Limite |
| --- | --- | --- | --- |
| Coordenador | `writing-plans`, `product-capability`, `verification-before-completion` | Escolher escopo, dependências, evidências e aceite | Não aceitar relato de agente como prova suficiente |
| Implementador com TDD | `test-driven-development`, `tdd-workflow` | Escrever caso relevante, observar falha, implementar e verificar | Não adaptar teste para esconder falha do produto |
| Revisor de testes | `tdd-workflow`, `verification-loop` | Conferir casos ausentes, regressões, fixtures e limites dos mocks | Não repetir toda a suíte sem dúvida concreta |
| Revisor de task | Template `task-reviewer-prompt.md` | Dois pareceres: conformidade com escopo e qualidade | Revisão somente leitura; não alterar implementação |
| Revisor de segurança/dados | `security-review`, skills Supabase | Autorização, RLS, eventos financeiros, segredos e integridade | Nunca usar produção para fixtures destrutivas |
| Executor E2E | `e2e-testing` | Jornada real em homologação, desktop/celular, relatório e traces | Não efetuar cobranças ou mensagens reais por padrão |
| Revisor final | Template `code-reviewer.md`, `verification-before-completion` | Revisar conjunto integrado antes da liberação | Não dispensar homologação humana |

O usuário solicitou participação de agentes nos testes. Despachar subagentes gerais com essas funções quando houver trabalho independente útil; não criar tasks do aplicativo nem supor novos agentes instalados. Um agente pode exercer papéis diferentes em momentos distintos, mas o autor não será o único revisor de sua própria entrega. Respeitar o limite disponível de quatro agentes, incluindo coordenador.

Pacote de entrada de cada agente: task, critérios de aceite, arquivos/diff exatos, versão/commit, ambiente permitido, skills relevantes e evidências existentes. Saída: PASSOU, FALHOU ou BLOQUEADO; casos verificados, comandos/códigos de saída quando executados, achados reproduzíveis, evidências e limitações. Revisor sem execução declara que realizou análise estática.

Paralelismo permitido: revisão somente leitura de segurança e análise de testes independentes. Não executar migrações, seeds, resets ou suítes que alteram a mesma base em paralelo. Coordenador resolve achados antes de liberar dependentes.

## 3. Skills transversais

- `brainstorming` e `product-capability`: fechamento das regras e mudanças reais de escopo. Não reabrir decisões já confirmadas pelo usuário.
- `writing-plans`: detalhar cada task em passos executáveis antes de código; este documento é matriz de processo, não especificação de APIs ainda não decididas.
- `using-git-worktrees`: isolamento ao iniciar implementação; `executing-plans` ou `subagent-driven-development`: escolher um fluxo principal, sem duplicar cerimônias.
- `test-driven-development`: ciclo RED/GREEN/refatoração para comportamento relevante; `tdd-workflow`: complementar com integração e cobertura, sem rodar dois processos iguais.
- `requesting-code-review`: revisão independente de task/feature; `verification-before-completion`: evidência antes de declarar conclusão.
- `systematic-debugging`: falhas reproduzíveis; `agent-introspection-debugging`: falhas do próprio processo do agente, quando necessário.
- `documentation-lookup`: consultar documentação técnica atual no mecanismo disponível. Se Context7 não estiver disponível, usar documentação oficial; não alegar que foi usado.

## 4. Mapa por task

Além das skills abaixo, tasks que implementem comportamento usam o ciclo de testes e revisão da seção 3.

| Task | Skills específicas | Validação e agente responsável |
| --- | --- | --- |
| 01 | `brainstorming`, `product-capability` | Coordenador: transformar regras em exemplos de aceite e registrar decisões não respondidas |
| 02 | `product-capability`, `supabase:supabase` | Revisor de dados: distinguir testes/reais, mapear origens, dependências e risco de duplicação |
| 03 | `brainstorming`, `frontend-patterns`; `visualize:visualize` se visual ajudar | Revisor de task: percurso de cada papel e estados de erro; validação dos sócios |
| 04 | `backend-patterns`, `api-design`, `supabase:supabase-postgres-best-practices`, `security-review` | Revisor de segurança: estados, propriedade dos dados e contratos/idempotência |
| 05 | `verification-loop`, `e2e-testing`, `vercel:env-vars`, `vercel:deployments-cicd` | Revisor de testes: baseline e Task 05-QA abaixo |
| 06 | `supabase:supabase`, `supabase:supabase-postgres-best-practices` | Revisor de dados: migrations em banco descartável, constraints e pgTAP |
| 07 | `security-review`, `supabase:supabase`, `vercel:nextjs` | Segurança: matriz sócio/professor/aluno/anônimo no banco e servidor |
| 08 | `security-review`, `supabase:supabase`, `vercel:nextjs` | Segurança + E2E: bloquear bootstrap antigo, elevação de papel e exclusão do último sócio |
| 09 | `frontend-patterns`, `vercel:nextjs`, `vercel:react-best-practices` | E2E: login, logout, recuperação, redirects e menus por papel |
| 10 | `backend-patterns`, `frontend-patterns`, `supabase:supabase` | Testes: cadastro sem login, convite e associação sem duplicar aluno |
| 11 | `product-capability`, `backend-patterns`, `security-review` | Testes: transições de matrícula e proibição de alteração comercial pelo professor |
| 12 | `backend-patterns`, `frontend-patterns`, `supabase:supabase` | Testes: agenda, recorrência, edição e encontro cancelado |
| 13 | `e2e-testing`, `frontend-patterns` | E2E + testes: chamada em lote móvel, autorização e denominador de frequência |
| 14 | `product-capability`, `backend-patterns`, `supabase:supabase` | Testes: condições históricas, plano alterado, parcela versus contrato |
| 15 | `backend-patterns`, `supabase:supabase-postgres-best-practices` | Testes + dados: meses curtos, simultaneidade, repetição e suspensão |
| 16 | `security-review`, `backend-patterns`, `supabase:supabase` | Testes + segurança: atomicidade, baixa duplicada, correção e auditoria |
| 17 | `backend-patterns`, `frontend-patterns`, `security-review` | Testes: despesa prevista/paga, receita avulsa e acesso restrito |
| 18 | `backend-patterns`, `tdd-workflow` | Testes: totalizadores em centavos, caixa/competência e exportação CSV |
| 19 | `api-design`, `backend-patterns`, `security-review`, documentação oficial do provedor escolhido | Testes + E2E: checkout de sandbox e propriedade da cobrança |
| 20 | `api-design`, `security-review`, `backend-patterns` | Segurança + testes: autenticidade, replay, concorrência, ordem de eventos e recuperação |
| 21 | `vercel:nextjs`, `frontend-patterns`, `e2e-testing` | E2E: pagamento e histórico próprios, falha/expiração, tentativa de outro aluno |
| 22 | `api-design`, `security-review`, documentação oficial WhatsApp/provedor | Segurança: autorização de contato, número, modelos e ambientes separados |
| 23 | `backend-patterns`, `security-review`; skill de agendamento conforme decisão técnica | Testes: relógio controlado, fila, corrida pagamento/envio, opt-out e falhas |
| 24 | `frontend-patterns`, `vercel:react-best-practices` | Testes + E2E: indicadores conferem com listas; erro não vira zero |
| 25 | `frontend-patterns`, `vercel:nextjs`, `e2e-testing` | E2E: professor consulta somente `em dia`, `pendente`, `não configurado` ou `indisponível`, sem detalhes financeiros e aluno justifica sem modificar chamada |
| 26 | `api-design`, `security-review`, `frontend-patterns` | Testes + E2E: spam, reenvio, conversão única e proibição de criação automática de conta |
| 27 | `brand-discovery`, `brand-voice`, `frontend-patterns`; `imagegen` somente se necessário | E2E/revisor: CTA, formulário, teclado, celular, conteúdo factual e ausência de cadastro SaaS |
| 28 | `supabase:supabase`, `security-review`; `spreadsheets:Spreadsheets` se houver arquivos para analisar | Dados: importação de ensaio, rejeições, saldo e reexecução sem duplicação |
| 29 | `e2e-testing`, `security-review`, `verification-loop`, `requesting-code-review` | E2E + segurança + revisão final: regressão integrada e pendências bloqueantes |
| 30 | `product-capability`, `verification-before-completion` | Coordenador + cliente: aceite operacional documentado, sem substituir humano por agente |
| 31 | `vercel:deployments-cicd`, `vercel:env-vars`, `vercel:observability`, `supabase:supabase` | Segurança/operação: ensaio de restauração, alertas e checklist da virada |
| 32 | `vercel:deployments-cicd`, `supabase:supabase`, `verification-before-completion` | Operação: smoke de produção, saldos e versão, sem testes de falha destrutivos |
| 33 | `vercel:observability`, `systematic-debugging` quando houver incidente | Coordenador: conferir somente transações/disparos reais autorizados no piloto |
| 34 | `verification-before-completion`, `finishing-a-development-branch` quando aplicável | Revisor final: evidências, manual, treinamento e entrega; nenhum merge automático presumido |

Skills Supabase são usadas após leitura das instruções e documentação pertinente durante a execução. Testes de regras financeiras não significam consultoria contábil; fórmulas seguem os contratos de produto confirmados.

### Seleção condicional para evitar complexidade desnecessária

- Scheduler: `vercel:cron-jobs` se Vercel Cron; `supabase:supabase` se Supabase Cron; `vercel:workflow`/`vercel:vercel-queues` somente se a arquitetura adotar esses serviços. Não instalar todos.
- Pagamentos: `vercel:payments` é específica de Stripe, portanto só se Stripe for escolhido. Não aplicá-la como guia de Asaas.
- Navegador: `browser:control-in-app-browser` para inspeção no browser integrado; `vercel:agent-browser`/`vercel:agent-browser-verify` quando o fluxo usar esse CLI. Smoke visual não substitui E2E persistente com Playwright.
- UI: `vercel:shadcn` só se adotarmos a biblioteca; não trocar o design system atual por disponibilidade da skill.
- Sem uso previsto: Three.js/WebXR, IA/LLM, ML, trading, redes sociais, pesquisa competitiva extensa, slides e vídeo. Skills Sites apenas se o projeto passar a usar Sites, conforme suas regras; hoje a hospedagem analisada é Vercel.

## 5. Task 05-QA — infraestrutura de testes antes da implementação funcional

Subetapa obrigatória da Task 05. Infraestrutura concluída em `TASK_05_BASELINE_AMBIENTES.md`; itens marcados pendentes são gates verificáveis.

- [x] Registrar Node/npm usados, executar `npm ci` e os scripts atuais, com saída final e código de saída preservados.
- [x] Registrar baseline: `npm test -- --maxWorkers=1`, `npm run typecheck`, `npm run lint`, `npm run build`.
- [x] Configurar cobertura compatível com Vitest instalado em `vitest.config.ts` e `package.json`. Meta de 80% ativa; baseline medido abaixo dela e mantido como gate.
- [x] Configurar Playwright em `playwright.config.ts`, scripts `test:e2e` e testes em `tests/e2e/`; dependência e Chromium verificados.
- [x] Excluir `tests/e2e/**` da descoberta do Vitest para não misturar runners.
- [x] Preparar fixtures sintéticas tipadas para dois sócios, professor, dois alunos e anônimo.
- [x] Criar validação testada que rejeita produção por ref/host, credenciais, modo live e contexto ambíguo.
- [x] Preparar execução pgTAP local-only; help do CLI 2.115.0 confirmado. Execução local aguarda Docker e é obrigatória no CI.
- [x] Criar workflow `.github/workflows/quality.yml` com testes, tipos, lint, build, banco local e E2E; sem segredos reais.
- [x] Definir e validar `test:coverage`, `test:e2e`, `test:env-guard` e `test:db`.
- [x] Capturar relatório, trace e screenshot de falha temporária anônima; remover o caso deliberadamente falho e ignorar artefatos.

Aceite: baseline real registrado, infraestrutura reproduzível, teste de autenticação existente passando e tentativa de execução contra produção rejeitada. Falha conhecida fica identificada, não mascarada por skip ou retry.

## 6. Etapas de teste durante o projeto

| Marco | Momento | Testes obrigatórios | Quem verifica |
| --- | --- | --- | --- |
| QA-A | Após 01–04 | Revisão dos exemplos e rastreabilidade requisito/task/caso | Coordenador + revisor de task |
| QA-B | Task 05-QA | Baseline, runners, fixtures, CI e bloqueio de produção | Revisor de testes |
| QA-C | Após 06–09 | Migrações, RLS, bootstrap, papéis e sessão antiga após mudança de papel | Segurança + E2E |
| QA-D | Após 10–13 | Cadastro/convite, matrícula, turma, chamada móvel e justificativa | Revisor de testes + E2E |
| QA-E | Após 14–18 | Datas, ciclos, dinheiro, transações, relatórios e concorrência | Testes + segurança/dados |
| QA-F | Após 19–23 | Sandbox de pagamento, assinatura de evento, duplicação, fila e opt-out | Segurança + E2E |
| QA-G | Após 24–27 | Jornada interessado → aluno, painéis, acessibilidade e responsividade | E2E + revisor de task |
| QA-H | Tasks 28–30 | Importação, regressão completa e aceite humano | Revisão final + cliente |
| QA-I | Tasks 31–34 | Restauração ensaiada, smoke, conferência de piloto e treinamento | Coordenador + cliente |

Cada task de comportamento termina antes do marco com teste focado e revisão. Não acumular todos os testes na Task 29. Um marco falho impede as tasks que dependem dele, mas permite trabalho independente.

### Casos críticos rastreáveis

| ID | Tasks | Resultado exigido |
| --- | --- | --- |
| AUTH-01 | 07–09 | Professor lê somente situação agregada `em dia`, `pendente`, `não configurado` ou `indisponível`; valores, cobranças e mutações financeiras são negados por URL, Server Action e Data API |
| AUTH-02 | 07, 21, 25 | Aluno A não consulta nem altera cobrança/perfil/presença de B |
| AUTH-03 | 08 | Payload de cadastro antigo não cria assessoria nem promove usuário |
| AUTH-04 | 07–09 | Sessão anterior à retirada de permissão não mantém acesso restrito |
| REG-01 | 10, 26, 28 | Cadastro sem login, conversão e importação não duplicam matrícula/aluno |
| FIN-01 | 14–15 | Dia 31 em fevereiro e início após vencimento obedecem regra aprovada |
| FIN-02 | 15, 19–20 | Duas execuções simultâneas geram apenas uma cobrança por ciclo |
| FIN-03 | 16 | Falha na gravação de auditoria não deixa baixa parcial |
| FIN-04 | 18 | Previsto, recebido, liquidado, taxas e despesas conferem com origem |
| PAY-01 | 19–21 | Redirecionamento falso ou evento sem autenticação não quita cobrança |
| PAY-02 | 20 | Evento duplicado/fora de ordem e estorno não duplicam nem ressuscitam recebimento |
| MSG-01 | 23 | Cobrança paga antes do processamento da fila cancela envio pendente |
| MSG-02 | 22–23 | Opt-out, falha temporária e reexecução obedecem preferência e limite de tentativas |
| ATT-01 | 12–13 | Cancelado/não registrado não é falta; aluno não altera a própria chamada |
| WEB-01 | 26–27 | Reenvio de formulário não duplica lead e não cria conta/cobrança |
| OPS-01 | 28, 31 | Reimportação mantém totais; restauração recupera dados no ensaio |

Os testes de concorrência e RLS devem usar banco real isolado. Mocks servem para regras e falhas controladas, não provam atomicidade ou isolamento. Um envio já aceito pelo provedor pode não ser cancelável: testar a corrida e registrar o limite, sem prometer cancelamento de mensagem em trânsito.

## 7. Evidência e conclusão

Guardar relatório por task em `docs/testing/mvp-task-NN.md` durante sua execução. Não criar relatórios preenchidos com resultados presumidos.

Cada relatório registra: referência da versão/diff, ambiente, requisitos/casos, testes executados e não executados, comando, código de saída, contagens, artefatos e achados. Para RED/GREEN, a falha inicial precisa ser comportamental, não mero erro de instalação. Para revisão, registrar os dois pareceres e se houve execução ou apenas leitura.

Critérios: sem falha crítica/alta de segurança, autorização ou integridade financeira; testes obrigatórios passam; teste instável não vira aprovação por retry; coverage não substitui os casos críticos. Exceções não bloqueantes precisam de justificativa e responsável.

Esta alteração adiciona governança e etapas de teste ao plano. Não instala Playwright, não registra novos agentes no Codex e não declara que o MVP passou nos testes.
