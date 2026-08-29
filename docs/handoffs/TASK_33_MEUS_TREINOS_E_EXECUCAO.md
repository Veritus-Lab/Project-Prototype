# Task 33 - Meus treinos e execucao

## Entrega

- Cada item de Calendario e Meus treinos abre `/atleta/treinos/[id]`.
- O detalhe mostra data programada, prescricao, status e o formulario de
  iniciar/concluir a atribuicao.
- O retorno para a lista de treinos permanece disponivel em estados de sucesso
  e de treino indisponivel.

## Seguranca

- A consulta do detalhe filtra simultaneamente `id`, `assessoria_id` e
  `atleta_id` do usuario autenticado.
- A URL nao concede acesso a outra atribuicao por tentativa de id.
- O formulario de execucao continua usando as Server Actions existentes, que
  revalidam autoria no servidor.

## Verificacao

- Testes de paginas/feed: 6 aprovados.
- `npm run typecheck`: aprovado.
- `git diff --check`: aprovado.

## Proxima task

Task 34 aplica a mesma hierarquia visual de apresentacao ao painel do
treinador, usando dados operacionais da assessoria.
