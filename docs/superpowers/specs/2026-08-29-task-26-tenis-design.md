# Task 26: equipamentos e quilometragem de tenis

## Objetivo

Permitir controlar a rodagem de tenis com base apenas nas execucoes registradas no FLERNK.

## Dados e isolamento

Adicionar `tenis_atletas` e `tenis_execucoes` conforme a fundacao segura: ambos possuem `assessoria_id`; o tenis pertence a um atleta; a associacao referencia uma execucao da mesma assessoria. Uma execucao pode usar no maximo um tenis.

RLS: atleta faz CRUD somente dos proprios tenis e vinculos; treinador apenas seleciona equipamentos e vinculos da propria assessoria. Nenhuma politica permite alteracao do treinador.

## Produto

O atleta cadastra nome, data inicial opcional, quilometragem inicial e limite opcional, podendo desativar o tenis. Ao concluir um treino, pode associar um tenis ativo. A rodagem atual e `quilometragem_inicial_metros + sum(distancia_real_metros)` das execucoes vinculadas.

O aviso e operacional: acompanhar aos 80% do limite e limite atingido aos 100%. Sem limite ou distancia registrada, nao ha percentual. A interface informa que isso nao e recomendacao medica nem garantia de prevencao de lesao.

## Validacao

Testar migration/RLS, escopo por atleta e assessoria, unicidade por execucao, calculo de rodagem, limites 80/100, formulario e estados vazios. Executar typecheck, lint, build e QA mobile/desktop antes de publicar.

## Fora do escopo

Nao inclui recomendacao clinica, integracao com relogios, importacao GPX/FIT, sincronizacao externa ou substituicao automatica de equipamento.
