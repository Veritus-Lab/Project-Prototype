# Task 29.1 - Correcao do Novo treino

## Causa raiz

O campo oculto `blocos` era renderizado somente na etapa Estrutura do
assistente. O envio ocorre na etapa Revisao, quando esse campo ja nao fazia
parte do formulario. A server action recebia `null`, interrompia antes da
sessao e do Supabase, e retornava `Blocos de treino invalidos.`.

Uma segunda barreira foi identificada: a coluna opcional `tipo_treino_id` foi
adicionada depois do grant inicial de `INSERT` em `treinos`. O servico sempre
inclui essa coluna no insert, inclusive com `null`, portanto o banco recusaria
o envio depois de corrigido o formulario.

## Correcao

- `TrainingForm` preserva a serializacao de `blocos` durante todas as etapas.
- Teste de regressao percorre a revisao e confirma que o campo enviado existe.
- Migration `20260829150000_grant_training_type_insert.sql` concede apenas
  `INSERT (tipo_treino_id)` a `authenticated`; as policies RLS nao foram
  alteradas.

## Verificacao

- O teste novo falhou antes da alteracao porque nao encontrou o campo `blocos`
  na etapa Revisao e passou apos a correcao.
- Testes do formulario, action e service: 8 testes aprovados.
- A migration foi aplicada ao Supabase conectado e aparece no historico remoto.
- Consulta de privilegios confirmou os sete campos de insert de `treinos`,
  incluindo `tipo_treino_id`.

## Observacao de ambiente

O ESLint permanece pendente neste Windows mesmo quando limitado a dois arquivos;
o processo foi encerrado apos nao produzir resultado. O build e o typecheck
tambem nao retornaram mensagem final ao harness, embora seus processos tenham
encerrado sem erro. A verificacao funcional focada e a validacao remota do
schema foram concluidas.
