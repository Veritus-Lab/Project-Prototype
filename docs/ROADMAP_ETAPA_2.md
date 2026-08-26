# FLERNK — Roadmap da Etapa 2

> Criado em 25/08/2026. Este roadmap orienta a Etapa 2 antes de novas implementações. Segurança, isolamento multi-tenant, LGPD, RLS e rastreabilidade são requisitos de todas as tasks.

## Objetivo

Transformar a base autenticada da Etapa 1 em uma operação real de assessoria esportiva: dashboards úteis, gestão de atletas, criação e atribuição de treinos, biblioteca de corrida e exercícios, financeiro de assinaturas e preparação para automações futuras como WhatsApp.

## Princípios de Segurança

- Papel e tenant continuam vindo somente de `profiles`.
- Toda leitura/mutação de dados de negócio filtra por `assessoria_id` e depende de RLS.
- Atleta não pode acessar dados de outro atleta ou outra assessoria.
- Treinador só vê dados da própria assessoria.
- Server Actions validam entrada com Zod e delegam a services.
- Nenhum componente React escreve direto no Supabase.
- Nada de `service_role` no app, cliente, logs ou repositório.
- Migrations são forward-only.
- Dados financeiros e mensagens de cobrança exigem trilha de auditoria.
- WhatsApp exige opt-in, templates aprovados e limite de frequência.

## Pesquisa Inicial de Treinos de Corrida

Fontes consultadas:

- ACSM, [Healthy Habits for Distance Running](https://acsm.org/distance-running-form-tips/): recomenda introdução gradual de mudanças, fortalecimento da cadeia cinética, mobilidade e hábitos de corrida saudáveis.
- World Athletics, [How to build aerobic fitness](https://worldathletics.org/personal-best/performance/how-build-aerobic-fitness-tips-advice-running): destaca corrida fácil/baixa intensidade, progressão gradual de volume e cautela com aumentos bruscos.
- PubMed, [Effects of Strength Training on Running Economy in Highly Trained Runners](https://pubmed.ncbi.nlm.nih.gov/26694507/): força e pliometria 2-3x por semana por 8-12 semanas podem melhorar economia de corrida em corredores treinados.
- PubMed, [Systematic review on strength training methods and running economy](https://pubmed.ncbi.nlm.nih.gov/38165636/): treino de força pesado, pliométrico e combinado pode melhorar economia de corrida, dependendo de método, velocidade e nível do atleta.
- PMC, [Effect of Strength Training on Running Performance and Running Economy](https://pmc.ncbi.nlm.nih.gov/articles/PMC9653533/): treino resistido pesado pode favorecer economia de corrida e contrarrelógio quando bem integrado.
- PMC, [Strength Training for Middle- and Long-Distance Performance](https://pmc.ncbi.nlm.nih.gov/articles/PMC5889786/): revisa efeitos positivos de força, potência e pliometria em corredores de média e longa distância.

### Biblioteca inicial de tipos de treino

1. Corrida fácil
   - Objetivo: base aeróbica, recuperação ativa, volume semanal.
   - Campos: duração/distância, zona/RPE, observações.

2. Corrida regenerativa
   - Objetivo: recuperação pós-treino forte/prova.
   - Campos: duração curta, intensidade muito leve, restrição de ritmo.

3. Longão
   - Objetivo: resistência aeróbica e tolerância muscular.
   - Campos: distância/duração, hidratação, terreno, progressão final opcional.

4. Tempo/limiar
   - Objetivo: sustentar ritmo moderadamente forte.
   - Campos: blocos, duração por bloco, recuperação, ritmo/RPE.

5. Intervalado VO2/speed
   - Objetivo: velocidade, potência aeróbica e tolerância a esforço intenso.
   - Campos: repetições, distância/tempo, recuperação, alvo de ritmo.

6. Subidas
   - Objetivo: força específica, técnica e potência.
   - Campos: inclinação percebida, duração/repetições, recuperação.

7. Fartlek
   - Objetivo: variação de ritmo menos rígida.
   - Campos: blocos livres ou estruturados, sensação, terreno.

8. Progressivo
   - Objetivo: controle de intensidade e final forte.
   - Campos: fases de ritmo, duração por fase.

9. Ritmo de prova
   - Objetivo: especificidade para 5K, 10K, 21K, 42K ou prova-alvo.
   - Campos: distância, ritmo-alvo, prova vinculada.

10. Técnica/educativos/strides
    - Objetivo: coordenação, economia e mecânica.
    - Campos: educativo, séries, distância curta, recuperação completa.

### Biblioteca inicial de exercícios

1. Agachamento.
2. Afundo/passada.
3. Levantamento terra romeno/hinge.
4. Elevação de panturrilha.
5. Ponte de glúteo/hip thrust.
6. Caminhada lateral com elástico.
7. Step-up.
8. Prancha frontal.
9. Prancha lateral.
10. Dead bug.
11. Saltitos/pogos.
12. Saltos pliométricos simples.
13. Mobilidade de tornozelo.
14. Mobilidade de quadril.
15. Fortalecimento intrínseco do pé.

Observação: a plataforma deve tratar essa biblioteca como ferramenta do treinador, não prescrição médica automática. Alertas de dor, lesão, retorno pós-lesão e progressão agressiva devem orientar o atleta a procurar profissional qualificado.

## Roadmap por Tasks

### Task 10 — Dashboards com dados reais — concluída em desenvolvimento

- Dashboard do treinador lê contadores e treinos reais.
- Dashboard do atleta lê atribuições reais.
- `src/lib/demo/dashboard.ts` removido.

### Task 11 — Listagem de atletas do treinador — concluída em desenvolvimento

- `/treinador/atletas` lista atletas reais por `assessoria_id` e `treinador_id`.
- Menu lateral do treinador ganhou link real para Atletas.

### Task 12 — Fundação segura da Etapa 2

Objetivo: criar base documental e técnica para as próximas migrations sem quebrar o schema atual.

Status: concluída em planejamento técnico em `docs/ETAPA_2_FUNDACAO_SEGURA.md`.

Entregas:

- Definir entidades novas: `exercicios`, `modelos_treino`, `blocos_treino`, `assinaturas_atletas`, `cobrancas`, `eventos_financeiros`, `preferencias_comunicacao`.
- Especificar RLS por entidade.
- Mapear dados sensíveis e retenção.
- Criar plano de migrations forward-only.

Critérios:

- Nenhuma mutation remota sem autorização.
- Testes pgTAP planejados antes da migration.
- Documento de arquitetura atualizado.

### Task 13 — Detalhe do atleta

Objetivo: transformar a lista em uma visão útil do atleta.

Status: concluída em desenvolvimento com rota `/treinador/atletas/[id]`, service `getTrainerAthleteDetail` e evidência TDD em `docs/testing/task-13-athlete-detail.tdd.md`.

Entregas:

- Rota `/treinador/atletas/[id]`.
- Service `getTrainerAthleteDetail`.
- Dados: nome, vínculo, data de entrada, treinos atribuídos recentes, status financeiro resumido quando existir.
- Estado seguro quando atleta não pertence ao treinador/tenant.

Segurança:

- Filtro por `assessoria_id`.
- Não confiar em `id` de URL sem validação.
- Mensagem genérica para acesso negado ou inexistente.

### Task 14 — Cadastro/edição operacional de atleta

Objetivo: permitir que o treinador complemente dados operacionais do atleta sem mexer no Auth indevidamente.

Status: concluída em desenvolvimento com tabela `atletas_operacionais`, formulário no detalhe do atleta, Server Action validada e evidência TDD em `docs/testing/task-14-athlete-operational-profile.tdd.md`.

Entregas:

- Campos operacionais: telefone, observações internas, objetivo, nível, data de nascimento opcional, contato de emergência opcional.
- Tabela separada de perfil operacional, evitando poluir `profiles`.
- Server Actions com Zod.

Segurança/LGPD:

- Campos opcionais e mínimos.
- Observações internas visíveis só ao treinador.
- Sem dados médicos detalhados nesta fase.
- Mutation confirma `assessoria_id`, `treinador_id` e atleta antes do upsert.

### Task 15 — Biblioteca de exercícios

Objetivo: criar catálogo inicial de exercícios de força, mobilidade e técnica para corrida.

Entregas:

- Tabela `exercicios`.
- Categorias: força, mobilidade, core, pliometria, técnica.
- Campos: nome, categoria, descrição curta, instruções, contraindicação/alerta genérico, nível.
- Seed inicial com a biblioteca deste roadmap.

Segurança:

- Catálogo global somente leitura para usuários comuns.
- Customizações futuras por assessoria em tabela separada.

### Task 16 — Biblioteca de tipos/modelos de treino de corrida

Objetivo: permitir que o treinador crie treino a partir de tipos estruturados.

Entregas:

- Tipos: fácil, regenerativo, longão, tempo/limiar, intervalado, subidas, fartlek, progressivo, ritmo de prova, técnica/strides.
- Estrutura JSON validada por schema.
- UI inicial de criação com blocos.

Segurança:

- Validação server-side da estrutura.
- Limites de tamanho em textos/blocos.
- Sem geração automática sem revisão humana.

### Task 17 — Criação manual de treinos

Objetivo: treinador criar treinos reais.

Entregas:

- Rota `/treinador/treinos/novo`.
- Formulário por blocos.
- Service `createTraining`.
- Listagem `/treinador/treinos`.

Critérios:

- Treino fica ligado a `assessoria_id` e `treinador_id`.
- Testes de criação, validação e isolamento.

### Task 18 — Atribuição de treino a atleta

Objetivo: ligar treino real a um ou mais atletas.

Entregas:

- Ação de atribuir treino na tela de treino ou atleta.
- Inserts em `treinos_atletas`.
- Dashboard do atleta mostra treino atribuído.

Segurança:

- Treino e atleta precisam pertencer à mesma assessoria.
- FK composta e RLS devem bloquear cross-tenant.

### Task 19 — Calendário operacional

Objetivo: deixar de usar “treinos recentes” e passar a agenda real.

Entregas:

- Campo/tabela de agendamento.
- Visão semanal/mensal simples.
- Próximos treinos nos dashboards.

Critérios:

- Timezone definido por assessoria.
- Datas validadas no servidor.

### Task 20 — Registro de execução pelo atleta

Objetivo: atleta marcar treino como iniciado/concluído e registrar percepção.

Entregas:

- Status: atribuído, em andamento, concluído, cancelado.
- RPE/percepção, observação curta, duração/distância realizada opcionais.
- Histórico no detalhe do atleta.

Segurança:

- Atleta só altera a própria atribuição.
- Treinador vê apenas atletas da assessoria.

### Task 21 — Financeiro: assinaturas dos atletas

Objetivo: acompanhar mensalidades, vencimentos e status de cobrança.

Entregas:

- Tabelas `assinaturas_atletas`, `cobrancas`, `eventos_financeiros`.
- Rota `/treinador/financeiro`.
- Status: em dia, próximo do vencimento, vencido, suspenso, isento.
- Valor, vencimento, periodicidade, método previsto.

Segurança:

- Valores financeiros são dados sensíveis.
- Auditoria de alterações.
- Sem gateway de pagamento nesta task.

### Task 22 — Alertas financeiros e preparação para WhatsApp

Objetivo: preparar automação de cobrança sem enviar mensagens ainda.

Entregas:

- Preferências de comunicação por atleta.
- Consentimento/opt-in de WhatsApp.
- Templates internos de lembrete.
- Fila lógica de lembretes a enviar.

Segurança/Compliance:

- Não enviar cobrança sem opt-in.
- Logs de tentativa/envio.
- Rate limit por atleta.
- Nenhum token de provedor no repositório.

### Task 23 — Integração WhatsApp controlada

Objetivo: enviar lembretes próximos ao vencimento via provedor aprovado.

Entregas:

- Adapter isolado para provedor WhatsApp.
- Webhook assinado.
- Templates parametrizados.
- Tela de histórico de mensagens.

Segurança:

- Verificação de assinatura de webhook.
- Idempotência em eventos recebidos.
- Redação sem expor dados sensíveis além do necessário.
- Opt-out respeitado.

### Task 24 — Dashboards v2

Objetivo: aproximar visual e funcionalmente os dashboards do produto final.

Entregas treinador:

- Atletas que exigem atenção.
- Próximos vencimentos.
- Treinos da semana.
- Convites pendentes.
- Ações rápidas.

Entregas atleta:

- Próximo treino.
- Progresso semanal.
- Pendência financeira visível com cuidado.
- Histórico recente.

Critérios:

- Sem cards fake.
- Estados vazios úteis.
- Responsivo desktop/mobile.

## Sequência Recomendada

1. Task 12: fundação segura e plano de migrations.
2. Task 13: detalhe do atleta.
3. Task 14: edição operacional do atleta.
4. Task 15: biblioteca de exercícios.
5. Task 16: biblioteca/modelos de treino.
6. Task 17: criação manual de treinos.
7. Task 18: atribuição de treino.
8. Task 19: calendário.
9. Task 20: execução pelo atleta.
10. Task 21: financeiro.
11. Task 22: preparação WhatsApp.
12. Task 23: integração WhatsApp.
13. Task 24: dashboards v2.

## Critério de Pronto da Etapa 2

- Treinador gerencia atletas, treinos, agenda e financeiro básico.
- Atleta vê e registra treinos atribuídos.
- Dashboard usa apenas dados reais.
- Assinaturas e vencimentos são rastreáveis.
- WhatsApp está preparado ou integrado com opt-in e auditoria.
- RLS e testes de isolamento cobrem todas as novas tabelas.
- Nenhum segredo versionado.
- Testes, lint, typecheck e build verdes.
