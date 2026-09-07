# Revisão documental da Task 03 — jornadas e navegação

Data: 07/09/2026. Estado: PASSOU para a entrega documental. QA-A permanece PARCIAL/PENDENTE até a Task 04 e a revisão consolidada. Ambiente: análise documental local; não foram executadas rotas, componentes, banco, RLS, checkout, webhook, fila, pagamento ou envio.

## Requisitos e evidências

| Verificação | Evidência | Resultado |
| --- | --- | --- |
| Rotas segregadas e legado explícito | Arquitetura de informação | Passou |
| Desktop/móvel para quatro públicos | Arquitetura e wireframes | Passou |
| Cobrança com checkout, retorno sem baixa, webhook, atualização e erro | Jornada de cobrança | Passou |
| Chamada com lote, cancelamento, correção e justificativa | Jornada e wireframe móvel | Passou |
| Cadastro/convite e conversão sem duplicidade | Jornadas correspondentes | Passou |
| Lembrete cancelado por quitação | Jornada de lembrete | Passou |
| Professor recebe exclusivamente quatro estados agregados | Matriz e telas de professor/alunos | Passou por revisão textual |
| Matriz menu, servidor e RLS/RPC | Matriz de acesso | Passou |
| Telas essenciais têm objetivo, dados, ações, estados e links | Seção de wireframes | Passou |
| Indicadores do sócio apontam para listas e não mascaram erro | Painel do sócio e estados comuns | Passou |
| Landing sem conteúdo comercial fictício | Landing, slots e jornada de interesse | Passou |

## Verificações executadas

- Revisão de cada papel contra os critérios globais e rastreabilidade documentada.
- Busca textual focada no conteúdo de professor confirmou somente `em dia`, `pendente`, `não configurado` e `indisponível` como estados financeiros expostos; o texto veda valor, vencimento, cobrança, pagamento e ação financeira.
- Revisão de rotas confirmou prefixos exclusivos `/socio`, `/professor` e `/aluno`, e estratégia explícita para `/treinador` na Task 09.
- `git diff --check` passa na versão documental desta task.

## Limites e pendências

Esta revisão não prova autorização por rota, Server Action, RLS/RPC, idempotência de webhook/fila ou comportamento móvel real; essas evidências pertencem às Tasks 04, 07–09, 13, 19–23 e aos marcos posteriores. QA-A só será concluída após a Task 04 e revisão consolidada de requisitos, contratos e casos.
