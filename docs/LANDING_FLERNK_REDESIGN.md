# Landing FLERNK — plano de redesign

Data: 12/09/2026. Status: etapas 1 e 2 concluídas; etapas 3 a 6 pendentes.

## Objetivo e direção aprovada pelo pedido

Apresentar a assessoria de corrida FLERNK e incentivar iniciantes a conversar com a equipe. “A chama que te move” é o slogan principal da marca e deve ocupar o título da primeira seção. O botão principal comunica a ação: “Quero começar na FLERNK”. O acesso de alunos fica disponível no cabeçalho com menor destaque.

Direção proposta: esportiva, acolhedora e editorial. Preservar a marca e seus tons escuros com acentos em verde-lima; usar áreas claras para dar respiro, tipografia expressiva e fotos reais da comunidade, quando disponíveis. A chama pode inspirar um traço gráfico discreto. Priorizar pertencimento e primeiros passos na comunicação.

## Diagnóstico da página atual

- O slogan está no botão e perde sua função de assinatura da marca.
- O hero mostra métricas ilustrativas de volume, ritmo e evolução que não representam evidências reais da assessoria e remetem à funcionalidade legada.
- Os benefícios enfatizam o software administrativo e financeiro.
- A seção de contato não oferece atendimento: seus links levam ao login e ao topo.
- Os arquivos públicos inspecionados contêm a marca, mas não fotografias da equipe/comunidade.

## Etapas e critérios de entrega

### 1. Mensagem e jornada de entrada

Skills previstas: frontend-design-direction, brand-voice.

Definir a hierarquia do hero: identificação “Assessoria de corrida”, título “A chama que te move”, texto de apoio para iniciantes e CTA “Quero começar na FLERNK”. Texto-base proposto: “Seu primeiro passo na corrida pode ser com a FLERNK. Conheça a assessoria e encontre uma turma para começar.” Revisar navegação e remover métricas fictícias e discurso de produto digital da captação.

Aceite: em poucos segundos, o visitante entende quem é a FLERNK, que iniciantes são bem-vindos e qual ação deve tomar. Nenhuma promessa de resultado, aula gratuita ou disponibilidade de vaga é presumida.

Resultado em 12/09/2026: hero reescrito com o slogan no título, CTA “Quero começar na FLERNK” para a seção de contato, login separado para alunos e painel “Você não precisa chegar pronto”. Foram removidas as métricas ilustrativas de desempenho. Validação: teste de página, TypeScript, ESLint, build e Playwright em desktop e celular.

### 2. Composição visual e conteúdo

Skills previstas: frontend-design-direction, frontend-patterns.

Desenhar e implementar primeiro para celular, com adaptação para desktop. Ordem das seções: hero; convite para quem está começando; benefícios da assessoria; como começar (conversar, conhecer as opções, concluir inscrição com a equipe); apresentação das turmas; dúvidas frequentes; contato final. Usar as quatro turmas existentes sem expor listas ou informações pessoais dos alunos. Equipe, locais, horários e depoimentos entram apenas com conteúdo confirmado.

Aceite: slogan legível, hierarquia clara, boa alternância de seções e imagens com recortes adequados. Fotografia real depende do fornecimento de material; enquanto isso, usar composição tipográfica e elementos da marca, sem apresentar imagens geradas como comunidade real.

Resultado em 12/09/2026: a landing ganhou a sequência de acolhimento, benefícios, como começar, turmas, dúvidas e contato. As quatro turmas atuais foram apresentadas sem nomes de alunos, locais, horários ou alegações não confirmadas. A composição usa tipografia, grade, contraste e elementos gráficos da marca enquanto não há fotos autorizadas da comunidade.

### 3. Captação funcional

Skills previstas: frontend-patterns; api-design e security-review caso haja formulário persistido.

Fazer todos os CTAs de novos alunos chegarem ao mesmo atendimento real. O canal confirmado é o Instagram da FLERNK, aberto por decisão do visitante em uma nova aba. Se o funil de interessados já estiver funcional, avaliar reaproveitar seu formulário em vez de criar uma segunda entrada. Login continua acessível pelo cabeçalho.

Aceite: CTA funciona em celular e desktop, não entra em ciclo entre seções e não encaminha o interessado ao login. Não instalar dependências pagas nem adicionar disparos automáticos nesta etapa.

Resultado em 12/09/2026: os CTAs de captação apontam para o perfil oficial informado da FLERNK no Instagram e são abertos em nova aba com `rel="noreferrer"`. Não há captura, persistência ou rastreamento de dados nesta etapa.

### 4. Animações e transições

Skills previstas: motion-design, frontend-patterns.

Personalidade: energética com movimentos curtos e controlados. Entrada do slogan com deslocamento discreto e opacidade; sequência breve para apoio e CTA; revelação de seções ao entrar na tela; transições de botões e ícones; abertura suave das perguntas frequentes; traço gráfico da marca como movimento ambiente pontual. Tempos de referência: feedback entre 120 e 180 ms, transições entre 200 e 300 ms e entrada principal até 500 ms. Priorizar CSS e recursos nativos antes de adicionar biblioteca.

Aceite: movimento orienta o olhar sem atrasar a leitura, bloquear cliques, controlar a rolagem ou causar deslocamentos de layout. Respeitar prefers-reduced-motion; conteúdo deve continuar legível sem JavaScript. Evitar vídeos automáticos e efeitos contínuos pesados.

### 5. Revisão visual, acessibilidade e testes

Skills previstas: e2e-testing, verification-before-completion; accessibility para a revisão de navegação e contraste.

Validar em navegador com Playwright: desktop e celular, texto e imagens, expansão das perguntas, navegação por teclado, destinos de CTA/login, movimento reduzido e ausência de rolagem horizontal. Usar dados sintéticos em testes. Revisar a página em larguras de 360, 390, 768 e 1440 px, conferir contraste e foco e verificar carregamento das imagens. Executar testes relevantes, lint, TypeScript e build. Caso delegada, a revisão de testes deve receber este roteiro e relatar evidências e limitações.

Aceite: sem erros bloqueantes nas jornadas; nenhum conteúdo importante depende de animação; sem exposição de dados dos alunos. Registrar evidências visuais e resultados medidos, sem afirmar aprovação apenas com a build.

### 6. Publicação e handoff

Skills previstas: verification-before-completion.

Revisar o diff final, versionar e publicar conforme a autorização já existente do projeto. Confirmar que o deployment de produção corresponde ao commit entregue e verificar a landing publicada, incluindo CTA e login. Atualizar este documento com evidências e pendências reais.

Aceite: Vercel READY, URL de produção verificada e breve registro da entrega. A conclusão desta melhoria visual não encerra as demais tasks financeiras ou administrativas do MVP.

## Insumos externos

- Número oficial de atendimento para concluir a etapa 3.
- Fotos autorizadas da FLERNK para a composição fotográfica; não bloqueiam o trabalho de estrutura e tipografia.
- Endereços, horários e respostas comerciais confirmadas antes de publicar essas informações.

O pedido atual define as etapas. O próximo passo de implementação é a etapa 1, seguida da composição visual da etapa 2.
