# Task 26 - Equipamentos e Rodagem

Data: 29/08/2026

## Entrega

- Migration `202608290001_add_athlete_equipment.sql` aplicada no projeto Supabase `hrmyqrekasuqhiqmqske`.
- Tabelas `tenis_atletas` e `tenis_execucoes` com RLS forcada, FKs compostas e unicidade por execucao.
- Tipos TypeScript regenerados a partir do schema remoto.
- Painel do atleta permite cadastrar e desativar tenis, consultar rodagem e vincular uma execucao concluida sem equipamento.
- Rodagem e alertas sao calculados no servidor: 80% para acompanhamento e 100% para limite atingido. O texto e operacional, nao clinico.
- Actions exigem `requireRole("atleta")`; RLS garante leitura ao treinador somente na propria assessoria.

## Integridade e historico

- O historico remoto continha as migrations de agenda, execucao, financeiro e comunicacao com timestamps diferentes dos arquivos locais. Os arquivos locais foram reconciliados com as versoes realmente aplicadas (`20260828022132`, `20260828022956`, `20260828162451`, `20260828163251`) antes do push do banco.
- A migration de equipamentos precisou adicionar a chave unica composta de `execucoes_treino (assessoria_id, id)` para a FK tenant-first de `tenis_execucoes`. A primeira tentativa falhou sem aplicacao parcial; a segunda foi concluida.

## Validacao

- `npx supabase migration list --linked`: historico local/remoto alinhado ate `202608290001`.
- `npx tsc --noEmit --pretty false`: aprovado.
- `git diff --check`: aprovado.
- Teste unitario de calculo criado para soma, 80%, 100% e ausencia de limite. O Vitest iniciou, mas ficou sem relatorio final neste worktree; o mesmo ocorreu com lint, portanto ambos exigem nova execucao em ambiente estavel.

## Pendencias da Task 26

- Executar teste de RLS com atleta proprio, outro atleta e treinador.
- Cobrir o componente e as actions com testes de interface.
- Fazer QA manual desktop/mobile e confirmar build/lint completos.
- Expor a leitura detalhada de equipamentos no perfil do atleta para o treinador.
- Publicar os commits da Task 26 em `main` e confirmar o deploy Vercel READY.
