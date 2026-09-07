# FLERNK — MVP de gestão e financeiro

Data: 07/09/2026. Estado: regras operacionais da Task 01 concluídas; implementação não iniciada.

Este documento orienta o novo produto junto de `TASKS_MVP_FLERNK.md`. Para o novo MVP, substitui as prioridades dos roadmaps anteriores. Os documentos históricos continuam como evidência de implementações, não como sequência de execução atual.

O processo de desenvolvimento, as skills por task, os papéis de revisão por agentes e os marcos de testes estão definidos em [SKILLS_E_TESTES_MVP_FLERNK.md](SKILLS_E_TESTES_MVP_FLERNK.md). A implementação funcional permanece não iniciada.

## 1. Objetivo e decisões confirmadas

Sistema personalizado para a assessoria de corrida FLERNK organizar alunos, operação e financeiro. A implantação atende uma única assessoria, com dois sócios com acesso completo e um professor contratado com acesso operacional. O aluno tem acesso apenas às suas informações.

Não haverá cadastro público de assessorias, contratação de software por outros treinadores, seletor de organizações, cobrança pelo uso do SaaS ou administração de múltiplos clientes.

A landing page será comercial para prospectar alunos da FLERNK. O produto interno será centrado em gestão e financeiro. Não se deve confundir a mensagem comercial da assessoria com a venda de um software de gestão.

## 2. Premissas operacionais do MVP

Estas escolhas permitem delimitar o trabalho, mas não substituem respostas sobre a operação real:

- Incluir despesas e fluxo de caixa simples, além de mensalidades.
- Professor acessa todas as turmas da FLERNK e consulta somente um indicador de situação financeira do aluno: `em dia`, `pendente`, `não configurado` ou `indisponível`. Não acessa valores, saldo devedor, cobranças detalhadas, receitas, despesas ou configurações de pagamento.
- Chamada feita pela equipe; aluno consulta frequência e pode solicitar justificativa, sem alterar a chamada.
- Site responsivo com experiência adequada no celular; sem aplicativo nativo.
- Um único provedor de pagamentos para Pix e cartão, escolhido antes da implementação por suportar checkout seguro; uma integração de WhatsApp. Não há conta, provedor ou número real selecionado neste documento.
- Dinheiro recebido diretamente na conta da FLERNK no provedor; sem split ou intermediação financeira da plataforma.
- Conversão de interessado para aluno feita pela equipe; não haverá matrícula pública com ativação automática no MVP.
- Cobrança não bloqueia automaticamente acesso ou presença; suspensão será uma ação administrativa explícita.
- Preservar as funções de treino existentes como módulo secundário, sem novas integrações esportivas.

## 3. Papéis e permissões

Cada pessoa usa conta própria. Dois sócios têm o mesmo papel e acesso completo, sem compartilhamento de credenciais. Não criar contas reais ou atribuir papéis com base em nomes presumidos.

| Função | Sócio | Professor | Aluno |
| --- | --- | --- | --- |
| Visão geral financeira | Completa | Apenas indicador em dia/pendente/não configurado/indisponível por aluno | Apenas própria situação |
| Alunos e contatos operacionais | Todos | Consulta e edição operacional | Próprio perfil permitido |
| Matrícula, plano, suspensão e cancelamento | Gerencia | Consulta situação operacional | Consulta próprio vínculo |
| Valores, cobranças e pagamentos | Gerencia | Sem acesso | Consulta e paga os próprios |
| Despesas, caixa, exportação financeira | Gerencia | Sem acesso | Sem acesso |
| Turmas, agenda e chamada | Gerencia | Gerencia | Consulta próprias turmas e presença |
| Justificativas de falta | Decide | Decide | Solicita para si |
| Treinos existentes | Gerencia | Gerencia | Consulta/registra os próprios |
| Interessados e aula experimental | Gerencia | Acompanha atendimento e agenda | Formulário público |
| Mensagens automáticas de cobrança | Configura e acompanha | Sem acesso | Recebe conforme preferências |
| Usuários, permissões e integrações | Gerencia | Sem acesso | Sem acesso |
| Auditoria | Consulta | Sem acesso global | Sem acesso |

Professor não pode elevar permissões, alterar matrícula comercial, dar baixa financeira ou exportar dados financeiros. Restrições devem existir no servidor e no banco; esconder menus é insuficiente. Mudanças de papel precisam invalidar o acesso anterior no fluxo protegido. Impedir a remoção do último sócio ativo.

## 4. Escopo funcional

### 4.1 Painel dos sócios

- Indicadores do período: recebido bruto, taxas registradas, recebido líquido, contas a receber, atrasos e despesas pagas.
- Fluxo de caixa realizado e previsto apresentados separadamente. Não chamar cobrança emitida de receita recebida nem saldo de caixa de lucro contábil.
- Alunos ativos, novas matrículas, cancelamentos, frequência e interessados aguardando atendimento.
- Acesso às listas que explicam cada indicador, com filtro por período.

### 4.2 Painel do professor

- Agenda do dia, próximas turmas, lista de alunos e chamada pendente.
- Faltas recorrentes e justificativas aguardando avaliação.
- Cadastro operacional e treinos existentes.
- Indicador em dia/pendente/não configurado/indisponível no cadastro e na lista de alunos; nenhum valor financeiro em tela ou resposta de API. O servidor entrega apenas a situação agregada, sem conceder leitura das tabelas financeiras ao professor.

### 4.3 Alunos e matrícula

- Cadastro pela equipe antes da criação de conta de acesso; convite posterior vincula a conta ao cadastro existente, sem duplicar aluno.
- Nome, contato, situação, turma e observações operacionais; coletar apenas informações necessárias.
- Matrícula ativa, suspensa ou encerrada; histórico das alterações.
- Separar status de matrícula, assinatura e cobrança: atraso não equivale automaticamente a cancelamento.
- Busca, filtros e importação inicial com validação e relatório de rejeições.
- Histórico financeiro só para sócios e para o próprio aluno.

### 4.4 Planos, assinaturas e cobrança

- Catálogo de planos com nome, preço e periodicidade; edição futura não altera cobranças passadas.
- Assinatura do aluno com condições contratadas, início, vencimento e término quando houver.
- Cobrança por competência/ciclo, sem duplicação. Um único responsável pela geração recorrente: provedor ou aplicação, definido na integração.
- Estados explícitos de cobrança e pagamento, com vencimento calculado no fuso da operação.
- Regra para meses curtos, primeira cobrança, suspensão, cancelamento, desconto e reajuste definida na Task 01.
- Baixa manual com valor, data, meio, responsável e motivo; correção auditável.
- Pagamento online com confirmação pelo provedor, nunca apenas pelo retorno do navegador.
- Registrar taxas e liquidação quando fornecidas; não tratar autorização de cartão como dinheiro disponível em caixa.
- Tratar falha, expiração, estorno e contestação. Solicitação de estorno pode ocorrer no painel do provedor no MVP, com sincronização local.
- Sem exclusão destrutiva de histórico financeiro pela interface.
- Renovação contratual é diferente de vencimento de parcela. Avisos e datas devem refletir o evento correto.

### 4.5 Despesas e caixa básico

- Categorias, descrição, valor, vencimento, situação e data de pagamento.
- Receitas avulsas registradas separadamente para evitar duplicação com mensalidades.
- Saldo inicial documentado e fluxo por período, com previsto separado de realizado.
- Exportação CSV para conferência. Sem contabilidade fiscal, emissão de nota, folha salarial ou conciliação bancária completa.
- Pagamento de despesa significa registrar uma saída realizada; o sistema não fará transferências bancárias a fornecedores.

### 4.6 Turmas, encontros e frequência

- Turmas com nome, local, horário, professor e alunos vinculados.
- Agenda recorrente gera encontros identificáveis; cancelamento de encontro não gera falta.
- Presença, falta, falta justificada e não registrado são estados distintos.
- Chamada em lote no celular, correção com responsável e data, histórico por aluno.
- Taxa de presença usa encontros elegíveis da matrícula; não usar treino não registrado como falta presencial.
- Alerta interno após três faltas consecutivas em encontros elegíveis, com limiar configurável. Sem pontuação de risco por IA.

### 4.7 WhatsApp

- Integração oficial ou provedor compatível com a plataforma oficial; definição de número, conta e modelos antes do desenvolvimento.
- Lembretes de vencimento e atraso, com acesso à cobrança. Cadência padrão configurável: D−5, D−1 e D+3.
- Preferências de contato, evidência de autorização e opção de interrupção.
- Fila persistente, identificação de envio, status, tentativas limitadas e tratamento de falhas.
- Revalidar cobrança, matrícula e preferência antes de enviar; cancelar lembretes de cobranças quitadas/canceladas.
- Evitar envios duplicados entre a aplicação e as notificações nativas do gateway.
- MVP sem IA conversacional: mensagem orienta pagamento ou contato humano. Não interpretar “já paguei” como confirmação de recebimento.
- Disparos de marketing em massa e cobrança por faltas ficam fora do MVP.

### 4.8 Portal do aluno

- Resumo com plano, próxima cobrança e atalhos de pagamento.
- Histórico financeiro próprio, confirmação de pagamento e referência do comprovante disponível.
- Agenda, frequência e solicitação de justificativa.
- Perfil e preferências de contato editáveis dentro dos limites definidos.
- Treinos existentes acessíveis como recurso secundário.
- Canal para falar com a FLERNK. Sem acesso a outros alunos ou ao caixa da assessoria.

### 4.9 Landing page e captação

Objetivo: transformar visitante interessado em contato para matrícula ou aula experimental, se a FLERNK oferecer essa modalidade.

Estrutura proposta:

1. Apresentação: “Corra com orientação. Evolua com a FLERNK.” Texto sujeito à validação da marca.
2. Para quem é a assessoria: iniciantes e corredores com objetivos diferentes, conforme atendimento real.
3. Como funciona: conhecer a equipe, escolher a turma/plano e começar.
4. Diferenciais reais, locais e horários de atendimento.
5. Equipe com fotos e informações fornecidas pelo cliente.
6. Depoimentos autorizados; omitir a seção se não houver material real.
7. Interesse em planos ou aula experimental; preços públicos somente após decisão dos Sócios FLERNK e recebimento de material comercial real.
8. Perguntas frequentes e contato.

CTA principal: “Quero correr com a FLERNK”. CTA secundário: “Já sou aluno”. Acesso da equipe discreto. Remover comunicação de cadastrar assessoria ou vender software a treinadores.

Formulário mínimo: nome, WhatsApp, objetivo opcional e preferência de turma quando aplicável. Registrar interessado, origem e situação: novo, em contato, experimental agendada, convertido ou encerrado. Proteção contra spam e reenvio duplicado. Enviar formulário não cria usuário, assinatura ou cobrança. WhatsApp abre contato somente por ação do visitante; envio automático posterior respeita a preferência registrada.

## 5. Navegação proposta

- Sócios: Visão geral; Alunos; Financeiro; Turmas e agenda; Frequência; Interessados; Mensagens; Treinos; Configurações.
- Professor: Minha gestão; Alunos; Turmas e agenda; Frequência; Interessados; Treinos.
- Aluno: Início; Meu financeiro; Agenda; Minha frequência; Meus treinos; Perfil.

## 6. Estratégia técnica de transição

O inventário de origem/destino, classificação pendente e estratégia de carga está em [TASK_02_INVENTARIO_MIGRACAO.md](TASK_02_INVENTARIO_MIGRACAO.md). A identificação explícita da organização FLERNK e dos dados aprovados é um gate antes de migrations de dados ou carga.

Manter Next.js, Supabase e componentes aproveitáveis. A assessoria FLERNK será provisionada de forma controlada; cadastro público não poderá criar organizações nem papéis de equipe.

Manter `assessoria_id` internamente evita uma migração destrutiva desnecessária. Isso não cria uma oferta multiassessoria no produto. As outras organizações encontradas no ambiente não devem ser apagadas ou incorporadas à FLERNK por suposição. Identificar a organização e os cadastros corretos antes de migrar.

Revisar o bootstrap atual de treinador no banco: retirar apenas o botão público não impede criação pelo fluxo antigo. Redesenhar usuários da equipe e separar cadastro de aluno da conta autenticada.

Entidades propostas: membros da equipe/papéis, alunos/matrículas, planos, assinaturas, cobranças, pagamentos, eventos do provedor, movimentações/despesas, turmas, vínculos, encontros, presenças, justificativas, interessados e fila de mensagens. Mapear para tabelas existentes antes de adicionar novas.

Migrations aditivas, migração explícita de papéis e testes de permissões. Backup e restauração verificados antes da carga/virada. Preview não deve usar pagamentos ou envios reais. Integrações precisam de idempotência, validação de autenticidade e conciliação de eventos perdidos.

## 7. Fora do MVP

Cadastro de outras assessorias; planos SaaS; marketplace; split; aplicativo nativo; chat com IA; redes sociais internas; integrações novas com relógios; novas ferramentas avançadas de prescrição; folha de pagamento; notas fiscais; contabilidade completa; automação de transferências; editor de landing page; campanhas de marketing em massa.

## 8. Critérios globais de entrega

- Cada sócio tem conta individual e acesso completo; professor consulta apenas a situação `em dia`, `pendente`, `não configurado` ou `indisponível` e é impedido de consultar detalhes ou alterar financeiro inclusive por URL/API; aluno acessa somente seus dados.
- Cadastro público não cria assessoria nem membro da equipe.
- Interessado pode ser convertido em aluno sem duplicação; aluno pode existir sem login.
- Ciclos geram cobranças únicas; pagar atualiza o portal e o painel sem duplicação por webhook repetido.
- Valores recebidos e saídas batem com a conferência do piloto; dados previstos e realizados não se confundem.
- Cobrança paga não recebe novos lembretes pendentes; falhas ficam visíveis para os sócios.
- Professor conclui chamada pelo celular; encontro cancelado não gera falta.
- Landing capta interesse real e não apresenta funcionalidades, equipe ou depoimentos inventados.
- Importação validada, documentação de operação, acesso administrativo e plano de recuperação entregues.
- Homologação percorre um ciclo de cobrança completo em ambiente de teste; após publicação, piloto acompanhado verifica a operação real.

## 9. Regras operacionais fechadas na Task 01

- Matrícula, assinatura, cobrança e pagamento são estados e históricos separados. Atraso não suspende nem encerra matrícula automaticamente; suspensão e encerramento dependem de ação administrativa explícita.
- Cada plano define dia de vencimento e se renova automaticamente. O padrão é renovação mensal automática; não há rateio automático complexo. Desconto, reajuste, cancelamento de cobrança já emitida e exceções de pausa são ações manuais auditáveis.
- A primeira cobrança é o próximo vencimento igual ou posterior ao início da assinatura. Se o dia configurado não existir no mês, usa-se o último dia daquele mês. Todo cálculo de data usa `America/Sao_Paulo`.
- Pausa interrompe a geração de novos ciclos a partir da data efetiva, sem apagar histórico nem alterar automaticamente cobranças já emitidas. Qualquer ajuste é manual e auditável.
- Pix e cartão serão oferecidos pelo mesmo provedor escolhido, que deve fornecer checkout seguro. A confirmação de pagamento vem do provedor; nenhuma conta ou provedor real é presumido.
- A cadência padrão de cobrança por WhatsApp é D-5, D-1 e D+3, configurável. Antes de cada envio, revalidar cobrança, matrícula e preferência; respeitar opt-out. A Task 01 não envia mensagens.
- Após três faltas consecutivas em encontros elegíveis, gerar alerta interno configurável. O aluno solicita justificativa; a equipe decide. Encontro cancelado ou não registrado não conta como falta.
- A landing capta interesse para plano ou aula experimental quando essa modalidade estiver disponível. A equipe converte manualmente; preços permanecem ocultos até haver decisão dos Sócios FLERNK e material comercial real.

## 10. Entradas externas ainda necessárias

Estas não são decisões operacionais em aberto: são valores, identidades, materiais, credenciais ou aceite humano que só os Sócios FLERNK podem fornecer. Nenhum deles é inventado nesta especificação.

| Entrada externa | Responsável | Task bloqueada |
| --- | --- | --- |
| Dados reais de alunos, planos, ferramenta atual e saldo inicial | Sócios FLERNK | 02, 14, 18 e 28 |
| Valores, dias de vencimento, descontos, reajustes e condições comerciais efetivas | Sócios FLERNK | 14, 15 e 30 |
| Provedor escolhido, conta, credenciais e ambiente de teste para Pix/cartão | Sócios FLERNK | 19 e 20 |
| Número, conta, modelos aprovados e credenciais de WhatsApp | Sócios FLERNK | 22 e 23 |
| Turmas, locais, horários e atribuição real de professor | Sócios FLERNK | 02, 12 e 25 |
| Materiais comerciais, oferta de experimental, fotos, depoimentos autorizados e decisão sobre preços públicos | Sócios FLERNK | 27 |
| Identidades das contas da equipe e aceite operacional final | Sócios FLERNK | 08, 30 e 31 |
| Prazo e orçamento operacional | Sócios FLERNK | 31 e 32 |

## 11. Evidências e limites do diagnóstico histórico

Este é um diagnóstico externo histórico; não é evidência da QA documental da Task 01 nem afirma integração atual.

Em 06/09/2026, o diagnóstico associou o HEAD local e o commit GitHub `6ee81a2` a deployment Vercel de produção READY. No Supabase `hrmyqrekasuqhiqmqske`, registrou 20 tabelas públicas com RLS e 13 versões de migrations correspondentes às locais; os contadores retornados foram quatro assessorias e cinco atletas, sem linhas reportadas em financeiro/comunicação. Correspondência de versões não substitui comparação integral de schema.

Em 07/09/2026, auditoria posterior no [commit GitHub `55863f0da0ea082c0052016e7b030f744686cec5`](https://github.com/Veritus-Lab/Project-Prototype/commit/55863f0da0ea082c0052016e7b030f744686cec5) confirmou a disponibilidade atual do alias/deployment público [project-prototype-ashy.vercel.app](https://project-prototype-ashy.vercel.app/login) e do project ref Supabase `hrmyqrekasuqhiqmqske`, sem registrar credenciais. Essa confirmação posterior não transforma o diagnóstico em teste de integração, checkout ou QA-A.

Código financeiro atual cria só a cobrança inicial, grava operações separadamente e precisa de revisão de datas. Políticas financeiras remotas atuais não dão leitura ao aluno. Comunicação prepara lembretes, sem envio identificado; nenhuma Edge Function listada. Não foi realizada nova suíte completa de testes nem validação autenticada ponta a ponta nesta análise.

Referências consultadas no diagnóstico anterior:
- Asaas: https://docs.asaas.com/docs/visao-geral e https://docs.asaas.com/docs/faq-assinaturas
- Eventos: https://docs.asaas.com/docs/eventos-para-checkout
- WhatsApp: https://business.whatsapp.com/policy/preview?lang=pt_BR
- Vercel: https://vercel.com/pricing — ambiente encontrado em Hobby; planejar hospedagem compatível com uso comercial.
- Supabase: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable — revisar avisos de funções privilegiadas e proteção de senhas antes da liberação; alerta não equivale a exploração confirmada.

Provedores, condições comerciais e documentação técnica devem ser revalidados nas tasks de integração.

## Autorização de execução e regra do indicador

Usuário autorizou executar todo o roadmap com o escopo informado. Não repetir confirmação das regras já fixadas; adotar padrões documentados e configuráveis para avançar. Dados comerciais reais, contas de provedores e aceite humano não podem ser inventados.

Professor: pendente quando existir cobrança vencida, não paga e não cancelada/isenta; em dia quando houver vínculo financeiro válido sem cobrança vencida pendente. Cadastro ainda sem plano/dados financeiros mostra 'Não configurado'; erro de consulta mostra 'Indisponível', nunca 'Em dia'. O indicador não bloqueia chamada ou participação automaticamente. Essas regras operacionais são padrões de implementação, configuráveis caso necessário.
