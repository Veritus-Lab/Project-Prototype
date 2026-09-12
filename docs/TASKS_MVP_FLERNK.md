# FLERNK — Tasks do planejamento à entrega

Atualizado em 10/09/2026. Tasks 01–06 CONCLUÍDAS; Task 07 em validação; Tasks 08–34 serão executadas sob o escopo de gestão administrativa e financeira. Treino é legado preservado, fora de toda experiência ativa.

Registro da Task 01: [TASK_01_REGRAS_OPERACAO.md](TASK_01_REGRAS_OPERACAO.md).
Registro da Task 02: [TASK_02_INVENTARIO_MIGRACAO.md](TASK_02_INVENTARIO_MIGRACAO.md).
Registro da Task 03: [TASK_03_JORNADAS_NAVEGACAO.md](TASK_03_JORNADAS_NAVEGACAO.md).
Registro da Task 04: [TASK_04_CONTRATO_TECNICO.md](TASK_04_CONTRATO_TECNICO.md).
Registro da Task 05: [TASK_05_BASELINE_AMBIENTES.md](TASK_05_BASELINE_AMBIENTES.md).
Escopo de referência: `MVP_FLERNK_GESTAO.md`. A redação deste plano não inicia implementação nem autoriza disparos, pagamentos ou mudanças de produção.

Skills, agentes e testes obrigatórios: [SKILLS_E_TESTES_MVP_FLERNK.md](SKILLS_E_TESTES_MVP_FLERNK.md). A matriz cobre individualmente as 34 tasks. A Task 05 inclui a subetapa 05-QA de infraestrutura; os marcos QA-A a QA-I são condições das tasks existentes, sem renumerar o roadmap. Cada task de comportamento inclui teste focado e revisão independente antes de sua conclusão.

Cada task deve terminar com evidência do aceite e atualização de status. A sequência é baseada em dependências, não em estimativa de dias. Datas e esforço serão estimados após Task 01. Conferir o estado real do código antes de implementar: reaproveitar o existente e evitar duplicação.

## Fase A — Fechar produto e preparar execução

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 01 — Regras da operação | **CONCLUÍDA.** Fixar padrões operacionais configuráveis e registrar somente entradas externas reais | — | Exemplos de matrícula, vencimento, pausa, atraso e renovação documentados; pendências externas têm responsável e task bloqueada |
| 02 — Inventário e migração | **CONCLUÍDA tecnicamente (documental/read-only).** Mapa de origem/destino, duplicidades e gate de identificação registrado | 01 | Nenhuma exclusão presumida; identificar explicitamente a organização e aprovar dados reais antes de migrations de dados ou carga |
| 03 — Jornadas e navegação | **CONCLUÍDA.** Fluxos dos sócios, professor, aluno e interessado; wireframes das telas essenciais em `TASK_03_JORNADAS_NAVEGACAO.md` | 01 | Jornada de cobrança e chamada completas; matriz de acesso validada |
| 04 — Contrato técnico e integrações | **CONCLUÍDA documentalmente.** Modelo alvo, estados, Asaas Checkout, Meta Cloud API, motor interno único e Vercel Cron em `TASK_04_CONTRATO_TECNICO.md` | 01–03 | Uma fonte de geração de cobranças; autenticação, ownership, idempotência, eventos, falhas e reconciliação mapeados |
| 05 — Baseline e ambientes | **CONCLUÍDA; QA-B aprovado.** Baseline, guard fail-closed, CI, Playwright, pgTAP e estratégia de ambientes/rollback em `TASK_05_BASELINE_AMBIENTES.md` | 02, 04 | Baseline registrado; preview read-only sem envio real; estratégia de backup e rollback definida |

## Fase B — Identidade FLERNK e acesso

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 06 — Fundação de dados | **CONCLUÍDA.** Migration aditiva, tipos gerados e migração planejada da organização em `TASK_06_FUNDACAO_DADOS.md` | 04–05 | Schema recriável em teste; vínculos e integridade verificados, sem perda de dados existentes |
| 07 — Papéis e permissões | Sócio, professor e aluno; autorização em banco/servidor e migração dos papéis antigos | 06 | Testes negativos por papel e por aluno passam; professor consulta somente `em dia`, `pendente`, `não configurado` ou `indisponível`, sem detalhes financeiros |
| 08 — Acesso exclusivo FLERNK | Encerrar cadastro público de assessoria e bootstrap antigo; convite de equipe; contas individuais dos dois sócios e professor | 07 | Fluxo antigo não cria organização nem eleva papel; último sócio protegido; contas provisionadas em ambiente apropriado |
| 09 — Estrutura dos portais | Menus, layouts, acesso e recuperação de conta para os três papéis, sem módulo de treino | 08, 03 | Cada papel chega ao painel correto em desktop/celular, sem exposição de dados ou referências a treino |

## Fase C — Carteira e operação

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 10 — Cadastro administrativo de alunos | Cadastro, busca, filtros e convite posterior desacoplado da matrícula | 06–09 | Aluno sem login pode ser gerido; aceite de convite vincula cadastro sem duplicação |
| 11 — Matrículas e histórico | **CONCLUÍDA.** Ativação, suspensão, encerramento e histórico operacional com auditoria transacional | 10 | Professor não altera condições comerciais; situação independente de pagamento |
| 12 — Turmas e encontros | **EM IMPLEMENTAÇÃO.** Cadastro de turmas, encontros, cancelamento e vínculo seguro de alunos matriculados | 10–11 | Recorrência sem encontros duplicados; histórico preservado em alterações |
| 13 — Chamada e faltas | Chamada em lote, correção auditada, justificativas e alerta interno | 12 | Fluxo móvel completo; cancelado/não registrado não é falta; indicador usa encontros elegíveis |

## Fase D — Núcleo financeiro

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 14 — Planos e assinaturas | Catálogo, condições contratadas, ciclo e vínculo ao aluno | 04, 11 | Mudança de preço não reescreve passado; renovação e parcela separadas |
| 15 — Motor de cobranças | Geração por ciclo, datas, suspensão/cancelamento e restrições contra duplicação | 14 | Casos de mês curto, início após vencimento e repetição do processamento passam |
| 16 — Pagamentos manuais e auditoria | Baixa, correção, motivos e histórico consistente | 15 | Falha não deixa operação parcialmente concluída; lançamento repetido não duplica recebimento |
| 17 — Despesas e receitas avulsas | Categorias, contas a pagar e lançamentos realizados | 06–07, 16 | Receitas avulsas não duplicam mensalidades; apenas sócios acessam |
| 18 — Caixa e relatórios | Saldo inicial, realizado/previsto, confirmado a liquidar, bruto/taxas/líquido e CSV | 16–17 | Somente liquidação recebida entra no realizado; totais conferem com fixtures e listas; saldo não é apresentado como lucro |

## Fase E — Pagamento online e comunicação

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 19 — Integração de pagamento em teste | Clientes, cobranças e checkout/Pix conforme método escolhido | 04–05, 15 | Aluno inicia pagamento somente de sua cobrança; nenhum dado bruto de cartão persistido no sistema |
| 20 — Webhooks e sincronização | Autenticidade, idempotência, autorização, confirmação, liquidação, eventos fora de ordem, disputas, estornos e reconciliação | 19, 16 | Autorização não quita; confirmação não infla caixa; recebimento gera movimento uma vez; disputa/resolução preserva o pagamento; evento perdido é recuperável |
| 21 — Portal financeiro do aluno | Plano, cobrança, pagamento e histórico | 09, 18–20 | Cobrança quitada atualiza no portal; tentativa de acesso a outro aluno falha |
| 22 — Configuração WhatsApp | Conta/número, modelos e preferências; configuração restrita aos sócios | 04–05, 10 | Conta de teste pronta e mensagens aprovadas/validadas conforme provedor; preferências persistidas |
| 23 — Automação de lembretes | Agendamento, fila, envio, tentativas e cancelamento de pendências | 15, 20, 22 | Quitação impede novo envio pendente; reexecução não duplica; falhas ficam visíveis; cadência validada |

## Fase F — Experiência e captação

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 24 — Painel dos sócios | Indicadores financeiros, carteira, faltas e atalhos para ação | 13, 18, 20, 23 | Cada indicador corresponde à sua lista/mesmo período; falha de consulta não aparece como zero |
| 25 — Painel do professor e portal do aluno | Turmas, chamada, frequência, justificativas e dados administrativos próprios | 09, 13, 21 | Operação diária com indicador `em dia`, `pendente`, `não configurado` ou `indisponível` para professor, sem valores ou detalhes; aluno só altera campos autorizados |
| 26 — Funil de interessados | Cadastro público protegido, acompanhamento, experimental e conversão | 10, 12 | Formulário não cria conta/cobrança; conversão preserva origem e evita duplicidade |
| 27 — Landing de prospecção | Conteúdo da FLERNK, equipe, locais, benefícios, CTA e acesso de alunos; sem referências a treino | 03, 26, materiais do cliente | Formulário e CTA funcionam no celular; sem cadastro de assessoria, prova social fictícia, promessa não validada ou módulo de treino |

## Fase G — Homologação e entrega

| Task | Entrega | Depende de | Critério de aceite |
| --- | --- | --- | --- |
| 28 — Importação de ensaio | Carga em homologação, validação de alunos, planos e saldos | 02, 11, 15, 18 | Relatório de importados/rejeitados, totais conferidos e reexecução sem duplicação |
| 29 — Qualidade e segurança ponta a ponta | Checks técnicos e jornadas integradas de todos os papéis | 23–28 | Testes de isolamento, datas, webhooks, envio duplicado, chamada e landing passam; bloqueadores resolvidos |
| 30 — Homologação com a FLERNK | Dois sócios e professor validam tarefas reais em teste; aluno piloto valida portal | 29 | Roteiro de aceite registrado, ajustes concluídos e regras comerciais conferidas |
| 31 — Preparação da publicação | Domínio, configuração real, alertas, backups, restauração e plano de virada | 30 | Checklist revisável; responsáveis, credenciais via canal seguro, rollback e custos definidos |
| 32 — Publicação e carga final | Aplicar versão homologada, importar dados aprovados e ativar integrações | 31 e liberação operacional | Smoke dos papéis; contagens e saldos conferidos; lembretes habilitados só após validação financeira |
| 33 — Piloto acompanhado | Conferir recebimento, lembrete, chamada e captação reais; tratar incidentes | 32 | Transações autorizadas conferem com provedor; sem cobrança/envio duplicado; falhas tratáveis pela equipe |
| 34 — Entrega e operação | Manual breve, treinamento, acessos, suporte e registro final do escopo | 33 | Sócios operam financeiro; professor faz chamada; suporte e pendências não bloqueantes têm responsáveis |

## Portões de execução

- Após Tasks 01–04: escopo, desenho e integrações fechados antes de código de produto.
- Antes de Tasks 19/22: acesso às contas e escolha dos provedores resolvidos; não simular conclusão da integração com placeholders.
- Antes de Task 32: versão concreta homologada e plano de virada revisado. Esta publicação não é parte da autorização atual de planejamento.
- Entrega completa somente após Task 34; deployment READY sozinho não comprova operação financeira correta.

## Roteiro mínimo de homologação

1. Visitante registra interesse; equipe agenda atendimento e converte em cadastro único de aluno.
2. Sócio vincula plano e aluno recebe convite; login associa a matrícula existente.
3. Cobrança do ciclo aparece uma vez e pode ser paga pelo próprio aluno.
4. Webhook confirma; repetição e chegada fora de ordem não corrompem valores; relatório confere.
5. Lembrete pendente não é enviado após quitação; uma falha de envio pode ser diagnosticada.
6. Professor consulta indicador `em dia`, `pendente`, `não configurado` ou `indisponível`; tentativa de consultar valores, cobranças detalhadas ou dar baixa por URL/API é negada; chamada funciona.
7. Encontro cancelado não gera falta; aluno solicita justificativa e equipe decide.
8. Sócio lança despesa e confere fluxo realizado/previsto.
9. Outro aluno tenta acessar cobrança/presença alheia e tem acesso negado.
10. Recuperação de acesso e restauração ensaiada têm procedimento documentado.

## Não iniciado neste planejamento

Nenhuma mudança em telas, rotas, schema, usuários, pagamentos, envios ou deployments. Somente estes documentos de escopo e tasks foram criados.

## Diretriz de execução confirmada

Executar o roadmap completo com os escopos informados, sem rodadas repetidas de confirmação. Tasks 03, 07, 10, 20, 25 e 29 devem incluir o indicador financeiro limitado do professor e sua atualização após pagamento. Testar também aluno sem configuração e falha de consulta; nenhum deles pode aparecer indevidamente como em dia. Dados reais e integrações externas seguem explicitamente dependentes de sua disponibilidade, sem simular conclusão.
