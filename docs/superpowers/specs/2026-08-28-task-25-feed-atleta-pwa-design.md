# Task 25: feed do atleta e PWA leve

## Objetivo

Tornar o treino do dia acessivel no celular e permitir a instalacao do FLERNK
como PWA, sem criar um aplicativo nativo e sem expor dados autenticados no
cache do dispositivo.

## Escopo aprovado

1. O painel em `/atleta` destacara primeiro o treino agendado para o dia
   corrente. Se nao houver treino hoje, mostrara o proximo treino agendado.
2. O destaque apresentara somente dados reais ja armazenados: titulo, horario,
   orientacao do treinador e status da atribuicao.
3. O atleta podera iniciar o treino ou registrar a conclusao pelo fluxo de
   execucao existente. Nenhuma nova regra de registro de treino sera criada.
4. O painel conservara metricas reais e exibira historico recente de
   atribuicoes, incluindo estados vazios claros para quem ainda nao recebeu
   treinos.
5. A aplicacao recebera manifesto, icones da identidade FLERNK, metadados para
   dispositivos moveis e instalacao como PWA.
6. O comando de instalacao sera discreto e aparecera somente quando o navegador
   disponibilizar suporte. Nao havera popup automatico.

## Dados e seguranca

O feed sera montado no servidor a partir de `treinos_atletas`, com o usuario
autenticado como unico atleta consultado e `assessoria_id` mantido em todos os
filtros. A selecao de "hoje" sera calculada com a data agendada e o timezone
da atribuicao; a ordem do proximo treino permanecera cronologica.

O service worker nao podera gravar documentos autenticados, respostas do
Supabase, dados de sessao, nem qualquer payload de treino ou perfil. Ele podera
atender somente recursos publicos e neutros: manifesto, icones, pagina offline
e arquivos estaticos versionados do Next.js. Quando uma navegacao depender da
rede e ela estiver indisponivel, a resposta sera uma pagina generica que pede
reconexao; ela nao mostrara dados previamente acessados por outro usuario do
mesmo dispositivo.

## Arquitetura

Um servico de feed do atleta concentrara a consulta, a normalizacao dos joins,
o calculo de prioridade (hoje, proximo ou vazio) e a lista de historico. A rota
`/atleta` continuara sendo Server Component e consumira esse contrato. Os
componentes de apresentacao receberao apenas o modelo serializavel necessario;
os controles de inicio e conclusao reutilizarao `TrainingExecutionForm`.

O comportamento de instalacao ficara em um pequeno componente cliente, pois o
evento `beforeinstallprompt` e a chamada `prompt()` pertencem ao navegador. O
restante da experiencia do painel continuara renderizado no servidor. A
instalacao que o navegador nao suportar simplesmente nao exibira controle.

## Interface

No celular, o treino prioritario sera o primeiro bloco util do painel, com
hierarquia visual clara para titulo, horario, orientacao e acao disponivel. Se
o treino estiver concluido, o bloco indicara essa condicao sem oferecer uma
acao invalida. O historico e as metricas aparecem depois, em dimensoes
adequadas para leitura vertical.

No desktop, a mesma informacao se adapta a grade existente sem criar uma tela
separada ou duplicar fontes de dados. Nao serao adicionadas animacoes sem uma
relacao espacial clara; transicoes direcionais ficam fora desta task.

## Erros e estados vazios

- Falha na consulta do feed: mensagem objetiva e sem detalhes internos.
- Sem treino hoje: proximo treino, quando existente, recebe o destaque.
- Sem qualquer treino agendado: estado vazio orienta o atleta a aguardar a
  programacao do treinador.
- Sem conexao: pagina offline neutra explica que os dados pessoais precisam de
  conexao para carregar.
- Navegador sem suporte PWA: nao mostra acao de instalacao e nao interrompe o
  uso normal pelo navegador.

## Validacao

Serao cobertos por testes o calculo de treino de hoje, a escolha do proximo,
estado vazio, isolamento por atleta e falha controlada. A pagina e os
componentes terao testes de renderizacao para os estados principais. A entrega
tambem inclui typecheck, lint, build, verificacao manual em viewport mobile e
desktop, e conferencias de manifesto e rota offline.

## Fora do escopo

- Aplicativo nativo ou React Native.
- Dados autenticados, treinos ou perfis disponiveis offline.
- Sincronizacao de execucoes em segundo plano.
- Notificacoes push.
- Armazenamento local de informacoes clinicas, financeiras ou de mensagens.

