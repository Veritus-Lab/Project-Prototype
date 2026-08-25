# FLERNK - Etapa 1: migracao para Next.js e Supabase

## Objetivo

Substituir o prototipo em Express, SQLite e HTML por uma fatia vertical funcional em Next.js, TypeScript, Tailwind CSS e Supabase. A entrega deve cobrir a jornada entre cadastro do treinador, criacao da assessoria, confirmacao de e-mail, autenticacao, convite seguro e entrada inicial do atleta, preservando o prototipo anterior em `legacy/`.

## Escopo

Esta etapa inclui:

- landing page e telas de autenticacao com o padrao visual FLERNK;
- cadastro aberto apenas para treinadores;
- confirmacao de e-mail pelo Supabase Auth;
- criacao da assessoria e do perfil do treinador no mesmo fluxo;
- login e redirecionamento por papel;
- painel inicial do treinador com geracao e revogacao de convites;
- convite vinculado ao e-mail e a assessoria, de uso unico e valido por sete dias;
- cadastro do atleta exclusivamente por convite valido;
- painel inicial do atleta;
- schema multi-tenant e Row Level Security desde a primeira migration;
- testes do dominio de convites e verificacao de build, rotas e isolamento;
- documentacao de configuracao e operacao da Etapa 1.

Ficam fora desta etapa: envio automatico de convite por e-mail, pagamentos, prescricao completa de treinos, comunicacao em tempo real e migracao dos dados SQLite.

## Arquitetura

A raiz passara a usar Next.js App Router. O codigo sera organizado em grupos de rotas para marketing, autenticacao e dashboards. Componentes React nao realizarao mutacoes diretamente no Supabase. Formularios chamarao Server Actions, que validarao os dados e delegarao regras para `lib/services/`.

Estrutura principal:

```text
src/
  app/
    (marketing)/
    (auth)/
    (dashboard)/
    auth/callback/
  components/
    ui/
    shared/
    marketing/
    auth/
    dashboard/
  lib/
    auth/
    services/
    supabase/
    validators/
  types/
supabase/
  migrations/
legacy/
docs/
```

O middleware renovara a sessao Supabase e protegera as rotas de dashboard. O papel persistido no banco, e nao um parametro do cliente, decidira o painel permitido.

## Modelo de dados

O schema inicial tera:

- `assessorias`: tenant raiz, nome, slug e campos opcionais de marca;
- `profiles`: usuario autenticado, assessoria, nome e papel;
- `treinadores`: extensao do perfil do treinador;
- `atletas`: extensao do perfil do atleta e dados previstos de vinculo;
- `convites_atletas`: assessoria, treinador emissor, e-mail, hash do token, expiracao, uso e revogacao;
- `treinos`: estrutura minima preparada para a etapa seguinte;
- `treinos_atletas`: associacao entre treino e atleta.

Toda tabela de negocio tera `assessoria_id`. Indices compostos apoiarao as consultas por tenant. O token bruto do convite nunca sera armazenado: apenas seu hash SHA-256. O link exibira o token uma unica vez apos a criacao.

## Autenticacao e cadastro do treinador

O treinador informa nome, nome da assessoria, e-mail e senha. A Server Action valida os dados e chama o cadastro do Supabase Auth com metadados minimos. Uma funcao transacional no banco cria a assessoria, o perfil e a extensao de treinador. O Supabase envia a confirmacao de e-mail e o callback troca o codigo por sessao.

Enquanto o e-mail nao for confirmado, o sistema mostra uma tela de orientacao. Depois da confirmacao, o treinador entra em `/treinador`.

Erros esperados, como e-mail ja cadastrado, senha fraca e slug indisponivel, serao traduzidos em mensagens claras. Falhas parciais do cadastro serao evitadas por funcao transacional no banco.

## Convite e cadastro do atleta

O treinador informa o e-mail do atleta no painel. O service gera um token criptograficamente aleatorio, armazena apenas o hash e define expiracao para sete dias. O link segue o formato `/convite/<token>`.

A pagina do convite verifica no servidor se o token existe, esta ativo, nao expirou e corresponde ao e-mail informado no cadastro. O atleta define nome e senha; o sistema cria sua conta vinculada a assessoria do convite. A conclusao marca o convite como usado de forma atomica. Convites usados, expirados ou revogados nunca podem ser reutilizados.

Nesta etapa, o treinador copia o link manualmente. O envio por API de e-mail sera uma etapa posterior e reutilizara o mesmo modelo de convite.

## Autorizacao e RLS

O isolamento multi-tenant sera aplicado em duas camadas:

- services verificam sessao, papel e propriedade para retornar erros adequados;
- RLS no Postgres bloqueia qualquer acesso cruzado mesmo diante de erro na aplicacao.

Treinadores podem ler e administrar dados da propria assessoria e seus convites. Atletas leem apenas o proprio perfil e seus proprios vinculos. Convites nao ficam publicamente consultaveis; sua validacao acontece por funcao controlada que recebe o token e expoe apenas dados necessarios para o cadastro.

Funcoes `SECURITY DEFINER` terao `search_path` fixo, permissoes explicitas e responsabilidades pequenas. Nenhuma chave secreta do Supabase sera enviada ao navegador.

## Design system

A interface usara Inter em toda a aplicacao e os tokens centrais da landing page:

- amarelo primario `#E2FF00`;
- hover `#C8E200`;
- fundo `#0A0C0E`;
- superficie `#14171A`;
- superficie elevada `#1A1E23`;
- borda `#23272D`;
- texto principal `#F3F4F6`;
- texto secundario em cinza frio.

A landing continuara expressiva; os dashboards serao mais densos, silenciosos e orientados a leitura repetida. Botoes, inputs, cards, badges, navegacao e estados de foco serao componentes compartilhados. A logo local sera reutilizada. Os controles terao contraste, foco visivel, rotulos acessiveis e dimensoes estaveis em desktop e mobile.

## Estados e tratamento de erros

Todos os fluxos terao estados de carregamento, sucesso, vazio e erro. Server Actions retornarao resultados estruturados, sem expor erros internos do banco. Rotas protegidas redirecionarao usuarios sem sessao para login e usuarios com papel incorreto para seu painel correto.

A falta de configuracao do Supabase interrompera a inicializacao com mensagem objetiva. Dados de exemplo poderao preencher apenas a apresentacao inicial dos dashboards; nao substituirao os testes reais de autenticacao e isolamento.

## Testes e verificacao

A Etapa 1 sera validada com:

- testes unitarios para token, expiracao e regras de convite;
- verificacao de tipos, lint e build de producao;
- teste manual de cadastro, confirmacao, login, convite, revogacao e aceite;
- teste de isolamento com duas assessorias e usuarios distintos;
- verificacao de rotas protegidas e redirecionamento por papel;
- inspecao visual e de acessibilidade em desktop e mobile com ECC/Chrome DevTools;
- verificacao de console e requisicoes com erro.

As migrations serao entregues no repositorio. Como a chave publishable nao autoriza alteracoes administrativas no banco, a migration inicial sera aplicada pelo SQL Editor ou CLI autenticada do Supabase e depois validada pela aplicacao.

## Migracao e compatibilidade

Antes da nova estrutura, os arquivos do prototipo atual serao movidos para `legacy/`, incluindo servidor, HTML, CSS, JavaScript, lote de inicializacao e banco local se existir. O historico Git permanece intacto. A logo sera movida para `public/` e compartilhada pela nova aplicacao.

Nao havera rota de producao para o legado. O diretorio servira como referencia durante a migracao das telas restantes.

## Entregaveis

Ao fim da Etapa 1, o repositorio tera a aplicacao Next.js funcional, configuracao local documentada, migration SQL com RLS, jornadas principais implementadas, testes da etapa, prototipo preservado e uma base documental que sera atualizada nas etapas seguintes. A documentacao final do sistema consolidara arquitetura, banco, seguranca, instalacao, operacao e evolucao planejada.
