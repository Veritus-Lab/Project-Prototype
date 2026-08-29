# Task 30 - Acesso e identidade do atleta

## Entrega

- O login continua a decidir o destino pelo `papel` persistido em `profiles`.
  A escolha visual no formulario nao envia nem altera permissao.
- O aceite de convite conclui imediatamente quando o Supabase retorna sessao.
- Quando a confirmacao de e-mail estiver ativa e o cadastro nao retornar sessao,
  o convite permanece pendente. O callback autenticado conclui a mesma RPC antes
  de redirecionar o atleta para `/atleta`.
- O formulario informa que a confirmacao por e-mail e necessaria, em vez de
  aparentar que o acesso ja foi criado.

## Seguranca

- `aceitar_convite` continua validando `auth.uid()`, o e-mail convidado, o
  token de uso unico e o estado do convite no banco.
- Nenhum papel vem do formulario de login ou do callback.
- O token do convite so e usado no retorno de confirmacao para concluir a RPC;
  a associacao final continua protegida pelo e-mail autenticado e pela RLS.

## Verificacao

- Testes de convite, login e formulario: 16 aprovados.
- `npm run typecheck`: aprovado.
- `git diff --check`: aprovado.

## Roteiro manual

1. Como treinador, crie um convite para um e-mail que ainda nao possua perfil.
2. Abra o convite, cadastre o atleta com o mesmo e-mail e confirme o e-mail se
   a configuracao do Supabase exigir.
3. Confirme que o retorno abre `/atleta` e que um novo login desse e-mail
   permanece na area do atleta, mesmo que a preferencia visual indique
   treinador.
4. Confirme que usar um e-mail diferente, um convite expirado ou reutilizado
   mostra erro e nao cria vinculo.

## Pendencia da proxima task

Task 31 conecta a navegacao de apresentacao do atleta entre dashboard, meus
treinos, calendario e registro de execucao. Nao deve alterar as regras de
papel ou o aceite de convite desta task.
