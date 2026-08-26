# Etapa 2 Operação da Assessoria Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Security review is required before every migration, server action, webhook, or finance-related change.

**Goal:** turn the authenticated MVP into a secure coaching operations product with real dashboards, athletes, workouts, scheduling, execution logs, subscription finance, and WhatsApp-ready collection workflows.

**Architecture:** Next.js App Router pages call server services/actions. Services enforce trainer/athlete context through `profiles` and Supabase RLS. Database migrations are forward-only, covered by isolation tests, and documented before implementation.

**Tech Stack:** Next.js 16, TypeScript, Supabase, Postgres RLS, Zod, Vitest, pgTAP, Playwright when UI flows require browser validation.

**Spec:** `docs/ROADMAP_ETAPA_2.md`

## Global Constraints

- Do not trust route params, form fields, or client role claims.
- Derive role and tenant from `profiles`.
- Every business table must include tenant-safe access through `assessoria_id` or a validated relationship to it.
- Every mutation must be server-side, Zod validated, and covered by authorization tests.
- Do not version secrets, provider tokens, private keys, or realistic financial/phone test data.
- Financial data and communication events require audit history.
- WhatsApp sending requires opt-in, provider isolation, webhook signature verification, idempotency, and opt-out handling.

## Task 12: Fundação Segura da Etapa 2

**Files/Interfaces:** `docs/ARQUITETURA.md`, `docs/SEGURANCA.md`, `docs/ROADMAP_ETAPA_2.md`, future `supabase/migrations/*`.

- [x] Define final ERD for exercises, workout models, workout blocks, athlete subscriptions, charges, finance events, and communication preferences.
- [x] Define RLS policy matrix for trainer, athlete, and unauthenticated access.
- [x] Define data classification for finance, phone, notes, and messaging fields.
- [x] Draft migration sequence before applying it.
- [x] Add pgTAP coverage plan for cross-tenant denial, same-tenant success, and athlete self-access.

## Task 13: Detalhe do Atleta

**Files/Interfaces:** `src/app/(dashboard)/treinador/atletas/[id]/page.tsx`, `src/lib/services/athlete.service.ts`, `src/lib/services/athlete.service.test.ts`.

- [x] Add tests for valid trainer access, other-tenant denial, and missing athlete.
- [x] Implement `getTrainerAthleteDetail`.
- [x] Render athlete identity, relationship status, entry date, and recent workouts.
- [x] Use generic not-found/denied messaging.
- [x] Run unit tests, lint, and typecheck.

## Task 14: Cadastro e Edição Operacional do Atleta

**Files/Interfaces:** athlete operational profile migration, `src/lib/actions/athlete.actions.ts`, athlete detail/edit UI.

- [x] Add minimal operational fields: phone, internal notes, goal, level, optional birth date, optional emergency contact.
- [x] Keep operational data separate from Auth and base `profiles`.
- [x] Add Zod schemas with length, format, and optionality rules.
- [x] Restrict notes to trainer-side reads.
- [x] Test authorization, validation, and tenant isolation.

## Task 15: Biblioteca de Exercícios

**Files/Interfaces:** exercise migration/seed, `src/lib/services/exercise.service.ts`, trainer workout UI selectors.

- [ ] Create read-only global catalog for running support exercises.
- [ ] Seed initial categories: força, mobilidade, core, pliometria, técnica.
- [ ] Include descriptions, safe generic instructions, warning text, and level.
- [ ] Prevent user edits to global catalog.
- [ ] Test read access and blocked writes for normal users.

## Task 16: Biblioteca de Tipos e Modelos de Treino

**Files/Interfaces:** workout model migration, JSON schema, `src/lib/services/training-template.service.ts`.

- [ ] Model the 10 initial running workout types from the roadmap.
- [ ] Validate structured blocks server-side.
- [ ] Add size limits for names, descriptions, instructions, and block arrays.
- [ ] Keep model creation trainer-owned and tenant-scoped.
- [ ] Test invalid structures, cross-tenant access, and successful creation.

## Task 17: Criação Manual de Treinos

**Files/Interfaces:** `src/app/(dashboard)/treinador/treinos/novo/page.tsx`, `src/lib/actions/training.actions.ts`, `src/lib/services/training.service.ts`.

- [ ] Build block-based workout form.
- [ ] Save workouts with `assessoria_id` and `treinador_id`.
- [ ] Add listing at `/treinador/treinos`.
- [ ] Validate all submitted blocks on the server.
- [ ] Test creation, listing, validation errors, and tenant isolation.

## Task 18: Atribuição de Treino a Atleta

**Files/Interfaces:** `treinos_atletas`, training detail UI, athlete dashboard query.

- [ ] Add assignment flow from workout or athlete context.
- [ ] Enforce same-assessoria relationship between trainer, workout, and athlete.
- [ ] Show assigned workout on athlete dashboard.
- [ ] Prevent duplicate assignment where business rules require uniqueness.
- [ ] Test trainer success, cross-tenant denial, and athlete visibility.

## Task 19: Calendário Operacional

**Files/Interfaces:** schedule fields/table, trainer calendar route, dashboard queries.

- [ ] Add scheduled date/time and timezone model.
- [ ] Render weekly/monthly operational view.
- [ ] Feed upcoming workouts into dashboards.
- [ ] Validate dates and timezone server-side.
- [ ] Test ordering, timezone boundaries, and authorization.

## Task 20: Registro de Execução pelo Atleta

**Files/Interfaces:** assignment status fields/table, athlete workout UI, trainer athlete detail history.

- [ ] Add statuses: atribuído, em andamento, concluído, cancelado.
- [ ] Add RPE, short note, optional actual duration, and optional actual distance.
- [ ] Let athletes update only their own assigned workouts.
- [ ] Show execution history to the trainer.
- [ ] Test self-update, trainer read, and cross-athlete denial.

## Task 21: Financeiro de Assinaturas

**Files/Interfaces:** `assinaturas_atletas`, `cobrancas`, `eventos_financeiros`, `/treinador/financeiro`.

- [ ] Model subscriptions, charges, financial status, payment method, value, and due date.
- [ ] Add audit events for create/update/status changes.
- [ ] Build finance dashboard with due soon, overdue, paid/current, suspended, exempt.
- [ ] Avoid payment gateway integration in this task.
- [ ] Test sensitive access, audit creation, validation, and dashboard summaries.

## Task 22: Preparação para WhatsApp

**Files/Interfaces:** `preferencias_comunicacao`, reminder templates, logical reminder queue.

- [ ] Capture WhatsApp opt-in and communication preferences.
- [ ] Create internal reminder templates without sending messages.
- [ ] Queue reminders based on due date windows.
- [ ] Add logs and rate-limit metadata.
- [ ] Test no-opt-in blocks, due-date selection, and audit records.

## Task 23: Integração WhatsApp Controlada

**Files/Interfaces:** provider adapter, signed webhook route, message history UI.

- [ ] Add provider adapter behind an interface.
- [ ] Store provider credentials only in environment variables.
- [ ] Verify webhook signatures and idempotency keys.
- [ ] Respect opt-out and message frequency limits.
- [ ] Test webhook validation, duplicate events, send failures, and history visibility.

## Task 24: Dashboards v2

**Files/Interfaces:** trainer dashboard, athlete dashboard, shared dashboard services.

- [ ] Replace first-pass dashboard cards with operational widgets.
- [ ] Trainer widgets: athletes needing attention, upcoming payments, week workouts, pending invites, quick actions.
- [ ] Athlete widgets: next workout, weekly progress, careful finance status, recent history.
- [ ] Keep dashboards backed only by real data and useful empty states.
- [ ] Run Playwright smoke checks on desktop and mobile sizes.

## Delivery Gate Per Task

- [ ] Documentation updated when behavior or schema changes.
- [ ] Tests added or explicitly justified.
- [ ] `npm run lint`, `npm run typecheck`, and relevant test suite pass.
- [ ] RLS and authorization checks reviewed for all data-bearing features.
- [ ] Commit created with a task-scoped message after verification.
