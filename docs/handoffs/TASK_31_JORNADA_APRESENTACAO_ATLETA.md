# Task 31 - Jornada de apresentacao do atleta

## Entrega

- A navegacao `Meus treinos` agora abre `/atleta/treinos`.
- A nova rota reutiliza a consulta autorizada e o controle de execucao que ja
  sustentam o calendario, evitando uma segunda fonte de dados para o atleta.
- Os treinos listados no painel sao atalhos para `Meus treinos`.
- Calendario e Meus treinos mantem o mesmo formulario de inicio/conclusao por
  `treinos_atletas.id`; a acao segue autorizada no servidor para o atleta da
  atribuicao.

## Fluxo demonstravel

1. Atleta entra em `/atleta`.
2. Abre `Meus treinos` pela lateral ou pela lista do painel.
3. Consulta o treino agendado e inicia ou conclui a propria atribuicao.
4. Pode alternar para `Calendario` sem mudar de fonte ou permissao.

## Verificacao

- `npm run typecheck`: aprovado.
- `git diff --check`: aprovado.
- O Vitest local nao devolveu relatorio ao executar os testes de pagina e o
  teste isolado do feed nesta sessao; a cobertura existente foi atualizada com
  a assercao do link do painel, mas precisa ser reexecutada no QA/CI.

## Proxima task

Task 32 reorganiza visualmente o painel do atleta conforme a referencia
aprovada. Ela deve preservar as rotas `/atleta`, `/atleta/treinos` e
`/atleta/calendario` estabelecidas aqui.
