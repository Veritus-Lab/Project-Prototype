# Handoff — MVP FLERNK Task 08

Data: 13/09/2026. Status: **concluída**.

## Entregue

- `/cadastro` deixa de oferecer cadastro público e encaminha para o login;
- trigger de bootstrap permanece removido e sua função não pode ser executada por usuários públicos ou autenticados;
- sócio gera convite com papel persistido (`socio` ou `professor`), token aleatório e prazo de sete dias;
- pessoa convidada cria sua conta pelo próprio link, usando o e-mail convidado; a confirmação de e-mail conclui o vínculo de equipe no callback;
- conta existente pode entrar e aceitar o mesmo convite; o banco valida token, e-mail, prazo e papel sem aceitar campos de organização ou papel do navegador;
- remoção, desativação ou troca do último sócio ativo é bloqueada pelo banco.

## Operação pendente

Não foram criadas contas reais porque não foram fornecidos os e-mails dos dois sócios e do professor. Um sócio deve gerar os convites em `/treinador/equipe` quando os endereços estiverem definidos.

## Próxima task

Task 09 organiza os portais de sócio, professor e aluno: menus, layouts, recuperação de conta e remoção das referências ativas ao módulo de treino.
