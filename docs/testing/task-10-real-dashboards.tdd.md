# Task 10 — Dashboards com dados reais

## Fonte

Task definida após fechamento da Etapa 1: substituir os dashboards demo por dados reais do Supabase antes de iniciar novos CRUDs da Etapa 2.

## Jornada

- Como treinador autenticado, quero ver contadores e treinos recentes da minha assessoria para acompanhar a operação real.
- Como atleta autenticado, quero ver meus treinos atribuídos e status reais para acompanhar minha rotina.

## RED

Comando:

```powershell
npm test -- src/lib/services/dashboard.service.test.ts --maxWorkers=1
```

Resultado:

- Falhou porque `src/lib/services/dashboard.service.ts` ainda não existia.
- Evidência: `Failed to resolve import "./dashboard.service"`.

## GREEN

Comandos:

```powershell
npm test -- src/lib/services/dashboard.service.test.ts 'src/app/(dashboard)/dashboard-pages.test.tsx' --maxWorkers=1
npm run typecheck
npm run lint
npm test -- --maxWorkers=1
npm run build
```

Resultados:

- Testes focados: 2 arquivos, 4 testes, todos verdes.
- Suíte completa: 24 arquivos, 75 testes, todos verdes.
- Typecheck, lint e build aprovados.
- Primeiro build sem rede falhou apenas no download da fonte Inter pelo `next/font`; build repetido com rede aprovada passou.

## Garantias

| Garantia | Teste | Resultado |
| --- | --- | --- |
| Dashboard do treinador consulta dados reais por `assessoria_id` e `treinador_id`. | `src/lib/services/dashboard.service.test.ts` | PASS |
| Convites pendentes do treinador filtram status ativo, uso, revogação e expiração. | `src/lib/services/dashboard.service.test.ts` | PASS |
| Dashboard do atleta consulta apenas atribuições do atleta autenticado no tenant atual. | `src/lib/services/dashboard.service.test.ts` | PASS |
| Páginas `/treinador` e `/atleta` renderizam dados do service, sem texto de demonstração. | `src/app/(dashboard)/dashboard-pages.test.tsx` | PASS |

## Lacunas

- O schema atual ainda não possui data de agenda futura do treino; por isso a Task 10 usa treinos recentes e atribuições recentes.
- Roteiro multi-tenant real no Supabase hospedado continua dependendo de autorização operacional.
