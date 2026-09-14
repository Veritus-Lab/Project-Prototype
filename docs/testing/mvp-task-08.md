# Evidências de teste — Task 08

Data: 13/09/2026.

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Cadastro público legado | PASSOU | Playwright redireciona `/cadastro` para `/login` em desktop e celular; o formulário não chama o Supabase. |
| Provisionamento por convite | PASSOU | Teste unitário cobre criação da conta somente pelo token, normalização do e-mail, callback de confirmação e aceite por RPC. |
| Bootstrap e privilégios remotos | PASSOU | Supabase remoto confirma execução negada a `anon` e `authenticated` no bootstrap; somente `authenticated` executa a RPC controlada de convite. |
| Proteção de último sócio | PASSOU no banco remoto | Trigger `prevent_last_socio_removal` está presente; pgTAP adiciona os cenários de remoção permitida e bloqueada para o CI. |
| pgTAP local | BLOQUEADO no host | O runner falha fechado porque Docker/Podman não está instalado. A suíte `task_08_access.sql` será executada pelo workflow de banco no GitHub. |

Comandos concluídos localmente: `npm run lint`, `npm run typecheck`, testes unitários focados e `npx playwright test --grep 'cadastro público legado'` com ambiente isolado.
