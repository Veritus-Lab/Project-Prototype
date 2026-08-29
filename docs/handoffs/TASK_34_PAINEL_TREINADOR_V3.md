# Task 34 - Painel do treinador v3

## Entrega

- O cabeçalho do treinador prioriza a leitura operacional e a acao `Novo treino`.
- A faixa de indicadores usa os tres dados existentes do painel e, quando o
  servico de desempenho responde, soma adesao semanal e distancia registrada,
  chegando aos cinco blocos da referencia.
- A composicao central explicita treinos programados, acoes operacionais,
  atletas em destaque e agenda dos proximos dias.
- Calendario semanal, desempenho e lembretes continuam nos blocos inferiores,
  preservando a navegacao responsiva ja existente.

## Integridade dos dados

- Adesao e distancia sao derivados somente de execucoes e atribuicoes reais
  da assessoria do treinador autenticado.
- Se desempenho nao estiver disponivel, a faixa apresenta apenas os
  indicadores de origem conhecida; nenhum numero e inventado.
- A secao de atletas em destaque continua baseada em motivos operacionais de
  atencao, nao em ranking simulado.

## Verificacao

- Testes de paginas: 3 aprovados.
- `npm run typecheck`: aprovado.
- `git diff --check`: aprovado.

## Proxima task

Task 35 prepara dados demo isolados para os dois papeis e permite revisar a
experiencia visual autenticada no navegador sem afetar contas reais.
