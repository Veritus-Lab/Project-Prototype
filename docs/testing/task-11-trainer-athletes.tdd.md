# Task 11 — Listagem real de atletas do treinador

## Fonte

Primeira fatia do bloco de Etapa 2 “CRUD de atletas e avaliações”: entregar uma rota operacional para o treinador consultar atletas reais antes de avançar para criação/edição/detalhe.

## Jornada

- Como treinador autenticado, quero abrir `/treinador/atletas` para ver os atletas vinculados a mim dentro da minha assessoria.

## RED

Comando:

```powershell
npm test -- src/lib/services/athlete.service.test.ts 'src/app/(dashboard)/treinador/atletas/page.test.tsx' --maxWorkers=1
```

Resultado:

- Falhou porque `src/lib/services/athlete.service.ts` e `src/app/(dashboard)/treinador/atletas/page.tsx` ainda não existiam.

## GREEN

Comando:

```powershell
npm test -- src/lib/services/athlete.service.test.ts 'src/app/(dashboard)/treinador/atletas/page.test.tsx' --maxWorkers=1
```

Resultado:

- 2 arquivos, 4 testes, todos verdes.

## Garantias

| Garantia | Teste | Resultado |
| --- | --- | --- |
| A listagem filtra atletas por `assessoria_id` e `treinador_id` do usuário autenticado. | `src/lib/services/athlete.service.test.ts` | PASS |
| Falhas do Supabase retornam mensagem pública segura. | `src/lib/services/athlete.service.test.ts` | PASS |
| `/treinador/atletas` exige papel treinador e renderiza atletas do service. | `src/app/(dashboard)/treinador/atletas/page.test.tsx` | PASS |
| A página mostra estado vazio quando não há atletas. | `src/app/(dashboard)/treinador/atletas/page.test.tsx` | PASS |

## Próximas fatias

- Detalhe do atleta.
- Edição de dados operacionais do atleta.
- Avaliações e histórico.
