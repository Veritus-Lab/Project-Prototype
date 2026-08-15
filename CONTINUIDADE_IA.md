# FLERNK — Continuidade do dashboard do atleta

## Contexto confirmado

- A aplicação atual **não** usa Next.js, React, TypeScript ou Supabase.
- A stack real é uma SPA em `index.html`, servida por Express (`server.js`), com SQLite (`banco.sqlite`).
- A base existente já tinha autenticação e o painel do treinador; ela não foi reescrita.
- A tabela existente é `usuarios`, com o campo `tipo`. A API de login já devolve esse campo.

## Alterações implementadas nesta etapa

### Dashboard do atleta

Foram criados dois arquivos novos, mantendo o `index.html` como entrada da SPA:

- `athlete-dashboard.js`: dados MOCK centralizados em `athleteData`, renderização do dashboard e interações.
- `athlete-dashboard.css`: design responsivo e isolado do painel existente.

O dashboard contém:

- sidebar com a navegação do atleta e ajuda;
- header personalizado, notificações, mensagens e perfil;
- resumo da semana;
- próximo treino;
- treino do dia com progresso circular e etapas interativas;
- próximos treinos;
- gráfico de evolução de distância sem imagem estática;
- gráfico donut de zonas cardíacas sem biblioteca externa;
- calendário funcional como componente HTML;
- mensagens do treinador;
- status discreto da assinatura;
- navegação mobile com menu lateral;
- feedbacks de sucesso/informação utilizando o sistema de toast já existente.

Os valores demonstrativos ficam somente em `athleteData`; a integração futura deve substituir essa estrutura por dados da API, sem espalhar valores pelo HTML.

### Login por papel

`index.html` foi ajustado para:

1. Carregar os arquivos do dashboard do atleta.
2. Criar o container `#athlete-dashboard-view`.
3. Alterar `setLoggedInUser(user)` para direcionar `user.tipo === 'atleta'` ao dashboard do atleta.
4. Manter o painel do treinador como comportamento para `treinador` e para o modo de demonstração offline.
5. Esconder corretamente os dois painéis ao efetuar logout.

### API

`server.js` agora valida `tipo` no cadastro: somente `treinador` ou `atleta` são aceitos. Isso preserva o modelo atual e evita valores arbitrários no banco.

## Arquivos alterados/criados

| Arquivo | Situação |
| --- | --- |
| `index.html` | Modificado: roteamento visual por papel e inclusão dos assets do atleta. |
| `server.js` | Modificado: validação do papel no cadastro. |
| `athlete-dashboard.js` | Novo: dados MOCK, UI e interações do atleta. |
| `athlete-dashboard.css` | Novo: estilos desktop, tablet e mobile. |
| `CONTINUIDADE_IA.md` | Novo: este handoff. |

## Validações realizadas

- `node --check athlete-dashboard.js` passou.
- `node --check server.js` passou.
- Não houve alteração destrutiva no SQLite nem no painel do treinador.

## Limitações atuais e próximos passos recomendados

1. O banco atual só possui `usuarios`; ainda não há tabelas para treinos, mensagens, métricas, provas, calendário ou assinaturas. Por isso o dashboard usa dados MOCK.
2. A sessão atual é apenas estado de frontend; o backend não tem tokens, cookies de sessão ou middleware de autorização. Não é seguro expor dados privados por rotas futuras sem implementar autenticação e checagem de `usuario.id` no backend.
3. Não criar um segundo login. A evolução deve reutilizar `usuarios.tipo`, como a implementação atual já faz.
4. Antes de criar tabelas, alinhar com Gabriel o modelo de atletas vinculados a treinadores. Uma evolução mínima provável é uma tabela `athletes` ligada a `usuarios`, seguida por `trainings`, `training_assignments`, `training_logs`, `messages`, `events` e, mais adiante, `subscriptions`/`payments`.
5. Ao criar as APIs, obter o atleta autenticado no servidor e filtrar todas as consultas por seu `usuario.id`; nunca aceitar um `athlete_id` livre enviado pelo navegador como autorização.
6. O diretório analisado não continha `.git` nem remoto configurado. Antes de publicar, confirmar o repositório correto, inicializar/clonar no local adequado e não enviar `node_modules` ou `banco.sqlite` sem decisão da equipe.

## Como testar a rota do atleta

Insira ou cadastre um usuário cujo `tipo` seja `atleta`, faça login normalmente e a SPA chamará `showAthleteDashboard(usuario)`. Usuários `treinador` continuam abrindo o painel existente.

