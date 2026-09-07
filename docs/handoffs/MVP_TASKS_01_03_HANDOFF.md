# Handoff — MVP FLERNK Tasks 01–03

Data: 07/09/2026. Branch: `codex/mvp-flernk`. Base de produção analisada: `55863f0da0ea082c0052016e7b030f744686cec5`.

## Entregue

- Task 01: contrato operacional fechado com regras configuráveis, exemplos e limites de acesso.
- Task 02: inventário read-only do Git/Supabase/Vercel, mapa origem/destino e estratégia de migração sem exclusão presumida.
- Task 03: jornadas, arquitetura de informação, matriz de acesso e wireframes de baixa fidelidade para sócio, professor, aluno e interessado.
- Relatórios documentais e revisões independentes em `docs/testing/mvp-task-01.md`, `mvp-task-02.md` e `mvp-task-03.md`.

## Decisões que vinculam a implementação

- O produto é um SaaS de gestão financeira e administrativa dedicado à FLERNK; não há cadastro público de outras assessorias.
- Rotas-alvo: `/socio`, `/professor` e `/aluno`; `/treinador` será compatibilidade temporária.
- Sócios têm acesso integral. Professor recebe apenas `em dia`, `pendente`, `não configurado` ou `indisponível`, sem detalhes ou mutações financeiras. Aluno acessa somente os próprios dados.
- Matrícula, assinatura, cobrança e pagamento são estados separados. Cobrança atrasada não suspende matrícula automaticamente.
- Primeiro vencimento é a primeira data configurada igual ou posterior ao início, com ajuste para o último dia do mês e fuso `America/Sao_Paulo`.
- Integrações reais de pagamento e WhatsApp permanecem bloqueadas até escolha de provedor, credenciais e ambiente de teste.

## Estado verificado

- Baseline no SHA de origem: 52 arquivos/150 testes passaram; typecheck, lint e build passaram.
- O inventário encontrou quatro organizações candidatas no ambiente atual; nenhuma foi presumida como a organização real e nenhum identificador interno foi versionado.
- Não foi aplicada migration, criada conta, enviada mensagem, executada cobrança ou alterado deployment neste ciclo documental.

## Entradas externas pendentes

- Confirmação pelos Sócios FLERNK da organização e cadastros autorizados.
- Planilhas/fontes reais de alunos, planos, saldos, turmas e horários.
- Identidades das contas individuais da equipe, sem compartilhamento de senha.
- Provedores, contas sandbox e credenciais de pagamento/WhatsApp.
- Materiais comerciais reais da landing e responsável pelo aceite.

## Próximo passo

Iniciar a Task 04 pelo contrato técnico: modelo de dados, estados, limites de cada integração, fonte única de cobranças, idempotência e scheduler. Depois, a Task 05 prepara CI, Playwright e ambientes isolados antes das migrations de produto.
