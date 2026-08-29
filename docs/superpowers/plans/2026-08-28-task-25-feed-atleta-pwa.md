# Task 25: Feed do Atleta e PWA Leve Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir o treino prioritario do atleta em `/atleta` e tornar o FLERNK instalavel como PWA, sem manter informacoes autenticadas offline.

**Architecture:** Um servico server-side consulta e normaliza atribuicoes do atleta autenticado para selecionar treino de hoje, proximo treino ou estado vazio. A pagina do atleta combina esse contrato com as metricas existentes. A camada PWA fica separada em manifesto, icones, service worker limitado a recursos publicos e componentes clientes pequenos para registro e instalacao.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase SSR, Vitest, Testing Library, CSS global.

**Spec:** `docs/superpowers/specs/2026-08-28-task-25-feed-atleta-pwa-design.md`

## Global Constraints

- Consultar apenas atribuicoes de `treinos_atletas` cujo `atleta_id` seja o usuario autenticado e cujo `assessoria_id` corresponda a sessao.
- Priorizar treino agendado no dia local de cada atribuicao; sem treino hoje, usar o proximo agendamento cronologico.
- Reutilizar `TrainingExecutionForm`; nao criar uma segunda acao para iniciar ou concluir treino.
- Service worker nunca armazena documentos autenticados, respostas Supabase, sessoes, perfis ou treinos.
- Cache permitido: manifesto, icones, pagina offline e arquivos `/_next/static/` do mesmo host.
- Ocultar o comando de instalacao quando `beforeinstallprompt` nao estiver disponivel; nao disparar prompt automaticamente.
- Manter a interface funcional em desktop e mobile, com suporte a `prefers-reduced-motion` existente.

---

## File Structure

- Create: `src/lib/services/athlete-feed.service.ts` - contrato do feed, consulta escopada, selecao e formatacao.
- Create: `src/lib/services/athlete-feed.service.test.ts` - testes de escopo, prioridade, vazio e falha.
- Create: `src/components/dashboard/athlete-daily-feed.tsx` - bloco visual do treino prioritario e historico.
- Create: `src/components/dashboard/athlete-daily-feed.test.tsx` - estados de renderizacao do bloco.
- Modify: `src/app/(dashboard)/atleta/page.tsx` - consumir feed e metricas reais.
- Modify: `src/app/(dashboard)/dashboard-pages.test.tsx` - mockar e validar a nova dependencia da pagina.
- Modify: `src/app/globals.css` - layout responsivo dos blocos do feed e PWA.
- Create: `src/app/manifest.ts`, `src/app/icon.tsx`, `src/app/apple-icon.tsx` - metadata e icones PWA.
- Create: `src/components/pwa/service-worker-registration.tsx` e `src/components/pwa/install-app-button.tsx` - comportamento client-side.
- Create: `src/components/pwa/install-app-button.test.tsx`, `public/offline.html`, `public/sw.js`.
- Modify: `src/app/layout.tsx` - metadata mobile e registro PWA.
- Modify: `next.config.ts` - cabeçalhos de seguranca e atualizacao do service worker.

### Task 1: Contrato do Feed Diario do Atleta

**Files:**
- Create: `src/lib/services/athlete-feed.service.ts`
- Create: `src/lib/services/athlete-feed.service.test.ts`

**Interfaces:**
- Consumes: `SessionUser` de `src/lib/auth/session.ts` e `createServerClient` de `src/lib/supabase/server.ts`.
- Produces: `getAthleteDailyFeed(user: SessionUser, now?: Date): Promise<{ data: AthleteDailyFeedData } | { error: string }>`.
- Produces: `AthleteDailyFeedData` com `priority: AthleteFeedAssignment | null` e `recent: AthleteFeedAssignment[]`.
- Produces: `AthleteFeedAssignment` com `id`, `title`, `detail`, `when`, `status`, `isToday` e `scheduledAt`.

- [ ] **Step 1: Write the failing test**

Usar mocks encadeados de Supabase como em `dashboard.service.test.ts`. Cobrir atribuicao de hoje em `America/Sao_Paulo`, proxima atribuicao, lista vazia, erro e os dois filtros de sessao.

```ts
await expect(
  getAthleteDailyFeed(athleteUser, new Date("2026-08-28T12:00:00.000Z")),
).resolves.toMatchObject({
  data: { priority: { id: "today", isToday: true, status: "atribuido" } },
});
expect(athleteEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
expect(assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/services/athlete-feed.service.test.ts`

Expected: FAIL because `athlete-feed.service.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Selecionar `id`, `status`, `atribuido_em`, `agendado_para`, `timezone`, `observacao_treinador` e `treinos(titulo, descricao, origem)`. Aplicar:

```ts
.eq("assessoria_id", user.assessoriaId)
.eq("atleta_id", user.id)
.not("agendado_para", "is", null)
.order("agendado_para", { ascending: true })
.limit(12)
```

Normalizar joins array/objeto. Comparar a parte de data de `scheduledAt` e `now` com `Intl.DateTimeFormat("en-CA", { timeZone })`, usando `timezone ?? "UTC"`. Selecionar primeiro item de hoje; sem ele, primeiro instante maior ou igual a `now`; limitar `recent` aos tres itens mais recentes. Retornar `{ error: "Nao foi possivel carregar seu treino de hoje." }` quando houver erro e um contrato vazio quando nao houver linhas.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/services/athlete-feed.service.test.ts`

Expected: PASS with priority, empty, error and session filters covered.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/athlete-feed.service.ts src/lib/services/athlete-feed.service.test.ts
git commit -m "feat: add athlete daily feed service"
```

### Task 2: Painel Diario do Atleta

**Files:**
- Create: `src/components/dashboard/athlete-daily-feed.tsx`
- Create: `src/components/dashboard/athlete-daily-feed.test.tsx`
- Modify: `src/app/(dashboard)/atleta/page.tsx`
- Modify: `src/app/(dashboard)/dashboard-pages.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `AthleteDailyFeedData` e `AthleteFeedAssignment` do servico criado na Task 1.
- Consumes: `TrainingExecutionForm({ assignmentId, status })` existente.
- Produces: `AthleteDailyFeed({ feed }: { feed: AthleteDailyFeedData })`.

- [ ] **Step 1: Write the failing component tests**

```tsx
render(<AthleteDailyFeed feed={{ priority: null, recent: [] }} />);
expect(screen.getByText("Nenhum treino programado")).toBeInTheDocument();

render(<AthleteDailyFeed feed={todayFeed} />);
expect(screen.getByRole("heading", { name: "Seu treino de hoje" })).toBeInTheDocument();
expect(screen.getByText("Intervalado 6x400m")).toBeInTheDocument();
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/dashboard/athlete-daily-feed.test.tsx`

Expected: FAIL because `AthleteDailyFeed` does not exist.

- [ ] **Step 3: Implement the component and page wiring**

Usar `Card elevated` no destaque. Mostrar `Seu treino de hoje` quando `priority.isToday` e `Proximo treino` caso contrario. Exibir titulo, horario, orientacao e estado. Reutilizar `TrainingExecutionForm` apenas com status `atribuido` ou `em_andamento`. Renderizar historico sem repetir a atribuicao prioritária.

Na pagina, iniciar os dois carregamentos juntos:

```ts
const [dashboard, feedResult] = await Promise.all([
  getAthleteDashboardData(user),
  getAthleteDailyFeed(user),
]);
```

Renderizar falha do feed com `role="alert"`, preservando metricas do dashboard. Atualizar o teste de pagina com mock de `getAthleteDailyFeed`.

- [ ] **Step 4: Add responsive CSS and run tests**

Adicionar classes isoladas do feed. Em telas pequenas, o destaque ocupa uma coluna, a acao nao estoura o container e nenhum texto e truncado.

Run: `npm test -- src/components/dashboard/athlete-daily-feed.test.tsx src/app/(dashboard)/dashboard-pages.test.tsx`

Expected: PASS for today, next, empty, error and existing page rendering.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/athlete-daily-feed.tsx src/components/dashboard/athlete-daily-feed.test.tsx src/app/(dashboard)/atleta/page.tsx src/app/(dashboard)/dashboard-pages.test.tsx src/app/globals.css
git commit -m "feat: add athlete daily training panel"
```

### Task 3: PWA Instalavel com Cache Publico

**Files:**
- Create: `src/app/manifest.ts`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`
- Create: `src/components/pwa/service-worker-registration.tsx`
- Create: `src/components/pwa/install-app-button.tsx`
- Create: `src/components/pwa/install-app-button.test.tsx`
- Create: `public/offline.html`, `public/sw.js`
- Modify: `src/app/layout.tsx`, `src/app/(dashboard)/atleta/page.tsx`, `src/app/globals.css`, `next.config.ts`

**Interfaces:**
- Consumes: `navigator.serviceWorker`, evento `beforeinstallprompt` e `Button` existente.
- Produces: `/manifest.webmanifest`, icones, `ServiceWorkerRegistration` e `InstallAppButton`.
- Produces: worker em `/sw.js` que entrega apenas fallback offline neutro.

- [ ] **Step 1: Write the failing install button test**

```tsx
render(<InstallAppButton />);
expect(screen.queryByRole("button", { name: "Instalar app" })).not.toBeInTheDocument();
window.dispatchEvent(installPromptEvent);
expect(await screen.findByRole("button", { name: "Instalar app" })).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/pwa/install-app-button.test.tsx`

Expected: FAIL because `InstallAppButton` does not exist.

- [ ] **Step 3: Implement metadata and installation behavior**

Em `manifest.ts`, definir `name: "FLERNK"`, `short_name: "FLERNK"`, `start_url: "/atleta"`, `display: "standalone"`, `lang: "pt-BR"`, cores existentes e icones 192/512 gerados por `icon.tsx` e `apple-icon.tsx`. Em `ServiceWorkerRegistration`, registrar `/sw.js` dentro de `useEffect` apenas em producao. Em `InstallAppButton`, guardar o evento adiado em state/ref, chamar `prompt()` somente no clique e ocultar o botao apos `userChoice`.

Em `layout.tsx`, exportar `viewport` com `themeColor`, configurar `appleWebApp` e renderizar o registro. Renderizar `InstallAppButton` somente em `/atleta`.

Em `next.config.ts`, implementar `async headers()` com uma entrada exclusiva para `/sw.js` que declara `Content-Type: application/javascript; charset=utf-8`, `Cache-Control: no-cache, no-store, must-revalidate` e `Content-Security-Policy: default-src 'self'; script-src 'self'`.

- [ ] **Step 4: Implement the service worker allowlist**

Definir `CACHE_NAME = "flernk-public-shell-v1"`. No install, adicionar somente `/offline.html`, `/manifest.webmanifest` e `/flernk-logo.jpg`. No fetch, tratar cache-first somente para caminhos same-origin em `/_next/static/`; para navegacao, tentar rede e, apenas em falha, retornar `caches.match("/offline.html")`. Nunca executar `cache.put` para navegacoes, APIs, `/atleta`, respostas Supabase ou requests de dados. No activate, excluir apenas caches com prefixo `flernk-public-shell-` diferentes do atual.

- [ ] **Step 5: Run tests and verify PWA artifacts**

```bash
npm test -- src/components/pwa/install-app-button.test.tsx
npm run typecheck
npm run build
```

Expected: PASS. Abrir `/manifest.webmanifest`, verificar icones, simular offline e confirmar que `/atleta` recebe somente `offline.html` quando nao houver rede.

- [ ] **Step 6: Commit**

```bash
git add src/app/manifest.ts src/app/icon.tsx src/app/apple-icon.tsx src/components/pwa/service-worker-registration.tsx src/components/pwa/install-app-button.tsx src/components/pwa/install-app-button.test.tsx public/offline.html public/sw.js src/app/layout.tsx src/app/(dashboard)/atleta/page.tsx src/app/globals.css next.config.ts
git commit -m "feat: add secure athlete pwa shell"
```

### Task 4: Regressao, QA e Entrega

**Files:**
- Modify: `docs/handoffs/TASK_25_FEED_ATLETA_PWA.md`
- Modify: `docs/ROADMAP_ETAPA_2.md`

**Interfaces:**
- Consumes: entregas das Tasks 1-3.
- Produces: evidencias de testes, handoff e roadmap atualizado.

- [ ] **Step 1: Execute focused regression**

```bash
npm test -- src/lib/services/athlete-feed.service.test.ts src/components/dashboard/athlete-daily-feed.test.tsx src/components/pwa/install-app-button.test.tsx src/app/(dashboard)/dashboard-pages.test.tsx
npm run lint
npm run typecheck
npm run build
```

Expected: todos os testes passam; aviso preexistente deve ser anotado no handoff sem mascarar falhas.

- [ ] **Step 2: Complete visual and security QA**

Abrir `/atleta` autenticado em desktop e mobile. Verificar hoje, proximo, vazio, inicio e conclusao. Conferir menu mobile, manifesto e worker. Em Cache Storage, confirmar ausencia de documentos autenticados; simular offline e confirmar somente a pagina neutra.

- [ ] **Step 3: Update delivery documentation**

Marcar Task 25 como concluida em `docs/ROADMAP_ETAPA_2.md` apenas depois da validacao. Criar handoff com escopo, limites de cache, comandos, QA, commit, push, deploy e proxima task: equipamentos e quilometragem de tenis.

- [ ] **Step 4: Commit, publish and verify production**

```bash
git add docs/ROADMAP_ETAPA_2.md docs/handoffs/TASK_25_FEED_ATLETA_PWA.md
git commit -m "docs: finalize task 25 handoff"
git push origin HEAD:main
```

Esperar a Vercel reportar `READY`, abrir a producao e repetir a verificacao basica do manifesto e da rota `/atleta` autenticada.
