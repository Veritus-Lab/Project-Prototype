# Task 27 - Aderencia de Treinos

Data: 29/08/2026

## Entrega

- O detalhe do atleta para o treinador passa a exibir `Prescrito x executado` para ate oito treinos concluidos.
- O calculo usa exclusivamente os blocos preservados em `treinos.estrutura` e a execucao registrada pelo atleta.
- Distancia prescrita soma `distanciaMetros * repeticoes`; duracao prescrita soma as duracoes dos blocos.
- Cada metrica compara real e prevista de forma independente: abaixo de 85%, proximo entre 85% e 115%, acima de 115%, ou nao informado quando falta um dos dados.
- RPE e observacao do atleta aparecem no mesmo card. Nenhuma conclusao clinica ou alteracao do historico e feita.

## Seguranca

- A consulta filtra `assessoria_id` e `atleta_id`; o acesso do treinador continua sujeito ao RLS existente de execucoes e atribuicoes.
- Nao houve migration nem integracao externa.

## Validacao

- `npx tsc --noEmit --pretty false`: aprovado.
- `git diff --check`: aprovado.
- Teste unitario cobre somatorio, repeticoes, faixa proxima e dados ausentes.
- Vitest iniciou mas nao emitiu o relatorio final neste worktree, comportamento intermitente tambem observado na Task 26. Reexecutar a cobertura e o build em ambiente estavel antes de declarar a etapa totalmente validada.

## Proxima Task

Task 28: avaliacoes de desempenho e zonas de ritmo, com entradas revisaveis pelo treinador e sem prescricao automatica.
