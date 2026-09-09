-- Task 06: additive target schema. No legacy row is changed in this migration.
begin;

create type public.team_member_role as enum ('socio', 'professor');
create type public.team_member_status as enum ('active', 'inactive');
create type public.enrollment_status as enum ('active', 'suspended', 'ended');
create type public.attendance_status as enum ('present', 'absent', 'excused', 'not_recorded');
create type public.subscription_status as enum ('draft', 'active', 'paused', 'ended', 'canceled', 'exempt');
create type public.charge_status as enum ('draft', 'open', 'overdue', 'paid', 'reversed', 'canceled', 'exempt');
create type public.checkout_status as enum ('created', 'active', 'paid', 'expired', 'canceled', 'failed');
create type public.payment_status as enum ('pending', 'authorized', 'confirmed', 'failed', 'canceled');
create type public.settlement_status as enum ('pending', 'received', 'reversed');
create type public.refund_status as enum ('requested', 'confirmed', 'reversed', 'failed', 'canceled');
create type public.dispute_status as enum ('open', 'under_review', 'won', 'lost', 'reversed', 'canceled');
create type public.expense_status as enum ('planned', 'paid', 'canceled');
create type public.provider_event_status as enum ('received', 'processing', 'processed', 'retryable_failure', 'dead_letter', 'ignored');
create type public.message_status as enum ('queued', 'claimed', 'submitted', 'delivered', 'read', 'retryable_failure', 'canceled', 'dead_letter');
create type public.lead_status as enum ('new', 'contacted', 'trial_scheduled', 'converted', 'closed');

create table public.team_members (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, profile_id uuid not null,
  role public.team_member_role not null, status public.team_member_status not null default 'active',
  activated_at timestamptz not null default now(), deactivated_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (profile_id), unique (assessoria_id, profile_id),
  foreign key (assessoria_id) references public.assessorias(id) on delete restrict,
  foreign key (assessoria_id, profile_id) references public.profiles(assessoria_id, id) on delete restrict,
  check ((status = 'active' and deactivated_at is null) or (status = 'inactive' and deactivated_at is not null))
);

create table public.students (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, auth_user_id uuid, legacy_atleta_id uuid,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  email text check (email is null or (email = lower(btrim(email)) and char_length(email) between 3 and 320 and position('@' in email) > 1)),
  phone text, birth_date date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, legacy_atleta_id),
  foreign key (assessoria_id) references public.assessorias(id) on delete restrict,
  foreign key (auth_user_id) references auth.users(id) on delete set null,
  foreign key (assessoria_id, legacy_atleta_id) references public.atletas(assessoria_id, id) on delete restrict
);
create unique index students_auth_user_unique_idx on public.students(auth_user_id) where auth_user_id is not null;
create index students_assessoria_name_idx on public.students(assessoria_id, lower(name), id);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, student_id uuid not null,
  status public.enrollment_status not null default 'active', starts_on date not null, ends_on date,
  suspension_reason text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  check (ends_on is null or ends_on >= starts_on), check (status <> 'ended' or ends_on is not null)
);
create unique index enrollments_one_current_student_idx on public.enrollments(assessoria_id, student_id) where status in ('active', 'suspended');

create table public.enrollment_history (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, enrollment_id uuid not null,
  previous_status public.enrollment_status, new_status public.enrollment_status not null, actor_team_member_id uuid,
  reason text, occurred_at timestamptz not null default now(), created_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, enrollment_id) references public.enrollments(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, actor_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check (previous_status is null or previous_status <> new_status)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null,
  name text not null check (char_length(btrim(name)) between 2 and 120), description text, active boolean not null default true,
  timezone text not null default 'America/Sao_Paulo', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, name), foreign key (assessoria_id) references public.assessorias(id) on delete restrict
);

create table public.class_memberships (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, class_id uuid not null, student_id uuid not null,
  enrollment_id uuid not null, starts_on date not null, ends_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id),
  foreign key (assessoria_id, class_id) references public.classes(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, enrollment_id) references public.enrollments(assessoria_id, id) on delete restrict,
  check (ends_on is null or ends_on >= starts_on)
);
create unique index class_memberships_one_current_idx on public.class_memberships(assessoria_id, class_id, student_id) where ends_on is null;

create table public.class_meetings (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, class_id uuid not null,
  starts_at timestamptz not null, ends_at timestamptz not null, canceled_at timestamptz, cancellation_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, class_id, id), unique (class_id, starts_at),
  foreign key (assessoria_id, class_id) references public.classes(assessoria_id, id) on delete restrict,
  check (ends_at > starts_at), check ((canceled_at is null and cancellation_reason is null) or (canceled_at is not null and char_length(btrim(cancellation_reason)) > 0))
);

create table public.attendances (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, class_id uuid not null,
  meeting_id uuid not null, membership_id uuid not null, student_id uuid not null, status public.attendance_status not null default 'not_recorded',
  recorded_by_team_member_id uuid, recorded_at timestamptz, note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (meeting_id, student_id),
  foreign key (assessoria_id, class_id, meeting_id) references public.class_meetings(assessoria_id, class_id, id) on delete restrict,
  foreign key (assessoria_id, membership_id) references public.class_memberships(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, recorded_by_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check ((status = 'not_recorded' and recorded_at is null) or (status <> 'not_recorded' and recorded_at is not null))
);

create table public.absence_justifications (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, attendance_id uuid not null,
  submitted_by_user_id uuid not null, reason text not null check (char_length(btrim(reason)) between 2 and 1000),
  submitted_at timestamptz not null default now(), reviewed_by_team_member_id uuid, reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (attendance_id),
  foreign key (assessoria_id, attendance_id) references public.attendances(assessoria_id, id) on delete restrict,
  foreign key (submitted_by_user_id) references auth.users(id) on delete restrict,
  foreign key (assessoria_id, reviewed_by_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check ((reviewed_by_team_member_id is null and reviewed_at is null) or (reviewed_by_team_member_id is not null and reviewed_at is not null))
);

create table public.plans (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null,
  name text not null check (char_length(btrim(name)) between 2 and 120), description text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, name), foreign key (assessoria_id) references public.assessorias(id) on delete restrict
);

create table public.plan_versions (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, plan_id uuid not null,
  version_number integer not null check (version_number > 0), amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'), periodicity text not null check (periodicity in ('monthly','quarterly','semiannual','annual')),
  due_day integer not null check (due_day between 1 and 31), rules jsonb not null default '{}'::jsonb check (jsonb_typeof(rules) = 'object'),
  effective_from date not null, effective_until date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, plan_id, id), unique (plan_id, version_number),
  foreign key (assessoria_id, plan_id) references public.plans(assessoria_id, id) on delete restrict,
  check (effective_until is null or effective_until >= effective_from)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, student_id uuid not null, enrollment_id uuid not null,
  plan_id uuid not null, plan_version_id uuid not null, status public.subscription_status not null default 'draft',
  amount_cents bigint not null check (amount_cents >= 0), currency text not null default 'BRL' check (currency = 'BRL'),
  periodicity text not null check (periodicity in ('monthly','quarterly','semiannual','annual')), due_day integer not null check (due_day between 1 and 31),
  starts_on date not null, ends_on date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, enrollment_id) references public.enrollments(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, plan_id, plan_version_id) references public.plan_versions(assessoria_id, plan_id, id) on delete restrict,
  check (ends_on is null or ends_on >= starts_on)
);
create unique index subscriptions_one_current_student_idx on public.subscriptions(assessoria_id, student_id) where status in ('draft', 'active', 'paused', 'exempt');

create table public.subscription_history (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, subscription_id uuid not null,
  previous_status public.subscription_status, new_status public.subscription_status not null, actor_team_member_id uuid,
  reason text, occurred_at timestamptz not null default now(), created_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, subscription_id) references public.subscriptions(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, actor_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check (previous_status is null or previous_status <> new_status)
);

create table public.billing_cycles (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, subscription_id uuid not null,
  cycle_key date not null, period_starts_on date not null, period_ends_on date not null, due_on date not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (subscription_id, cycle_key),
  foreign key (assessoria_id, subscription_id) references public.subscriptions(assessoria_id, id) on delete restrict,
  check (period_ends_on >= period_starts_on), check (due_on >= period_starts_on)
);

create table public.billing_generation_runs (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null,
  window_starts_on date not null, window_ends_on date not null, status text not null check (status in ('running','completed','partial','failed')),
  expected_count integer not null default 0 check (expected_count >= 0), generated_count integer not null default 0 check (generated_count >= 0),
  error_code text, started_at timestamptz not null default now(), completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id) references public.assessorias(id) on delete restrict,
  check (window_ends_on >= window_starts_on), check (generated_count <= expected_count),
  check ((status = 'running' and completed_at is null) or (status <> 'running' and completed_at is not null))
);

create table public.billing_generation_watermarks (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, subscription_id uuid not null,
  last_cycle_key date not null, generation_run_id uuid not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (subscription_id),
  foreign key (assessoria_id, subscription_id) references public.subscriptions(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, generation_run_id) references public.billing_generation_runs(assessoria_id, id) on delete restrict
);

create table public.charges (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, student_id uuid not null, subscription_id uuid not null,
  billing_cycle_id uuid not null, cycle_key date not null, status public.charge_status not null default 'draft',
  amount_cents bigint not null check (amount_cents >= 0), currency text not null default 'BRL' check (currency = 'BRL'), due_on date not null,
  paid_at timestamptz, effective_fact_at timestamptz, legacy_cobranca_id uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (subscription_id, cycle_key), unique (assessoria_id, legacy_cobranca_id),
  foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, subscription_id) references public.subscriptions(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, billing_cycle_id) references public.billing_cycles(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, legacy_cobranca_id) references public.cobrancas(assessoria_id, id) on delete restrict,
  check ((status in ('paid','reversed') and paid_at is not null) or (status not in ('paid','reversed') and paid_at is null))
);

create table public.charge_adjustments (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, charge_id uuid not null,
  kind text not null check (kind in ('discount','increase','cancellation','exemption','correction')),
  amount_cents bigint not null check (amount_cents >= 0), reason text not null check (char_length(btrim(reason)) between 2 and 1000),
  actor_team_member_id uuid not null, created_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, charge_id) references public.charges(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, actor_team_member_id) references public.team_members(assessoria_id, id) on delete restrict
);

create table public.payment_checkouts (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, charge_id uuid not null,
  provider text not null check (provider in ('asaas')), method text not null check (method in ('pix','credit_card')),
  status public.checkout_status not null default 'created', idempotency_key text not null,
  provider_checkout_id text, checkout_url text, expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (charge_id, idempotency_key), unique (provider, provider_checkout_id),
  foreign key (assessoria_id, charge_id) references public.charges(assessoria_id, id) on delete restrict
);
create unique index payment_checkouts_one_active_idx on public.payment_checkouts(charge_id, method) where status in ('created', 'active');

create table public.payments (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, charge_id uuid not null,
  provider text not null check (provider in ('asaas','manual')), external_payment_id text, idempotency_key text,
  status public.payment_status not null default 'pending', amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'), authorized_at timestamptz, confirmed_at timestamptz,
  provider_occurred_at timestamptz, provider_sequence bigint, effective_fact_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (provider, external_payment_id), unique (assessoria_id, idempotency_key),
  foreign key (assessoria_id, charge_id) references public.charges(assessoria_id, id) on delete restrict,
  check (provider <> 'asaas' or external_payment_id is not null), check (provider <> 'manual' or idempotency_key is not null),
  check (status <> 'authorized' or authorized_at is not null), check (status <> 'confirmed' or confirmed_at is not null)
);

create table public.payment_settlements (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, payment_id uuid not null,
  status public.settlement_status not null default 'pending', gross_amount_cents bigint not null check (gross_amount_cents >= 0),
  fee_amount_cents bigint not null default 0 check (fee_amount_cents >= 0), net_amount_cents bigint not null check (net_amount_cents >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'), external_settlement_id text,
  received_at timestamptz, available_at timestamptz, effective_fact_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (payment_id), unique (external_settlement_id),
  foreign key (assessoria_id, payment_id) references public.payments(assessoria_id, id) on delete restrict,
  check (gross_amount_cents = fee_amount_cents + net_amount_cents),
  check ((status = 'pending' and received_at is null) or (status <> 'pending' and received_at is not null))
);

create table public.payment_refunds (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, payment_id uuid not null,
  provider text not null, external_refund_id text not null, status public.refund_status not null default 'requested',
  amount_cents bigint not null check (amount_cents > 0), reason text, provider_occurred_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (provider, external_refund_id),
  foreign key (assessoria_id, payment_id) references public.payments(assessoria_id, id) on delete restrict
);

create table public.payment_disputes (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, payment_id uuid not null,
  provider text not null, external_dispute_id text not null, status public.dispute_status not null default 'open',
  amount_cents bigint check (amount_cents is null or amount_cents > 0), reason text, provider_occurred_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (provider, external_dispute_id),
  foreign key (assessoria_id, payment_id) references public.payments(assessoria_id, id) on delete restrict
);

create table public.financial_categories (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null,
  kind text not null check (kind in ('expense','revenue')), name text not null check (char_length(btrim(name)) between 2 and 120), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, kind, name), foreign key (assessoria_id) references public.assessorias(id) on delete restrict
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, category_id uuid not null,
  description text not null check (char_length(btrim(description)) between 2 and 240), status public.expense_status not null default 'planned',
  amount_cents bigint not null check (amount_cents > 0), currency text not null default 'BRL' check (currency = 'BRL'),
  due_on date, paid_at timestamptz, created_by_team_member_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, category_id) references public.financial_categories(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, created_by_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check ((status = 'paid' and paid_at is not null) or (status <> 'paid' and paid_at is null))
);

create table public.other_revenues (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, category_id uuid not null,
  description text not null check (char_length(btrim(description)) between 2 and 240), status text not null default 'planned' check (status in ('planned','received','canceled')),
  amount_cents bigint not null check (amount_cents > 0), currency text not null default 'BRL' check (currency = 'BRL'),
  expected_on date, received_at timestamptz, created_by_team_member_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, category_id) references public.financial_categories(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, created_by_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check ((status = 'received' and received_at is not null) or (status <> 'received' and received_at is null))
);

create table public.cash_movements (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null,
  direction text not null check (direction in ('in','out')), source_type text not null check (source_type in ('settlement','settlement_reversal','settlement_restoration','expense','expense_correction','other_revenue','other_revenue_correction')),
  source_id uuid not null, idempotency_key text not null, amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'BRL' check (currency = 'BRL'), occurred_at timestamptz not null, created_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, idempotency_key), foreign key (assessoria_id) references public.assessorias(id) on delete restrict
);

create table public.provider_events (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, provider text not null,
  external_event_id text not null, event_type text not null, status public.provider_event_status not null default 'received',
  resource_type text, resource_external_id text, sanitized_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(sanitized_payload) = 'object'),
  provider_occurred_at timestamptz, provider_sequence bigint, received_at timestamptz not null default now(),
  processing_started_at timestamptz, lease_expires_at timestamptz, attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error_code text, processed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (provider, external_event_id), foreign key (assessoria_id) references public.assessorias(id) on delete restrict
);

create table public.integration_attempts (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, provider text not null, operation text not null,
  correlation_id uuid not null, resource_type text, resource_id uuid, status text not null check (status in ('started','succeeded','retryable_failure','failed')),
  attempt_number integer not null default 1 check (attempt_number > 0), response_code text, error_code text,
  started_at timestamptz not null default now(), completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (provider, operation, correlation_id, attempt_number),
  foreign key (assessoria_id) references public.assessorias(id) on delete restrict,
  check ((status = 'started' and completed_at is null) or (status <> 'started' and completed_at is not null))
);

create table public.contact_preferences (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, student_id uuid not null,
  whatsapp_phone text, whatsapp_opt_in boolean not null default false, whatsapp_opt_in_at timestamptz, whatsapp_opt_out_at timestamptz,
  billing_messages_enabled boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (student_id), foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  check ((whatsapp_opt_in and whatsapp_opt_in_at is not null and whatsapp_opt_out_at is null) or (not whatsapp_opt_in and not billing_messages_enabled)),
  check (not billing_messages_enabled or whatsapp_phone is not null)
);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null,
  code text not null, version integer not null check (version > 0), provider text not null default 'meta', provider_template_name text,
  locale text not null default 'pt_BR', body_preview text not null, active boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, code, version), foreign key (assessoria_id) references public.assessorias(id) on delete restrict
);

create table public.message_jobs (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, charge_id uuid not null, student_id uuid not null,
  template_id uuid not null, template_version integer not null, cadence_offset integer not null,
  status public.message_status not null default 'queued', scheduled_for timestamptz not null,
  claimed_at timestamptz, lease_expires_at timestamptz, attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_message_id text, last_error_code text, submitted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (charge_id, cadence_offset, template_version),
  foreign key (assessoria_id, charge_id) references public.charges(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, student_id) references public.students(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, template_id) references public.message_templates(assessoria_id, id) on delete restrict
);

create table public.message_events (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, message_job_id uuid,
  provider text not null default 'meta', external_event_id text not null, provider_message_id text not null,
  status public.message_status not null, provider_occurred_at timestamptz not null, received_at timestamptz not null default now(),
  sanitized_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(sanitized_payload) = 'object'), created_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (provider, external_event_id),
  foreign key (assessoria_id, message_job_id) references public.message_jobs(assessoria_id, id) on delete restrict
);

create table public.leads (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, name text not null check (char_length(btrim(name)) between 2 and 120),
  email text, phone text, deduplication_key text not null, status public.lead_status not null default 'new',
  source text, converted_student_id uuid, consent_at timestamptz, closed_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessoria_id, id), unique (assessoria_id, deduplication_key),
  foreign key (assessoria_id) references public.assessorias(id) on delete restrict,
  foreign key (assessoria_id, converted_student_id) references public.students(assessoria_id, id) on delete restrict,
  check (email is not null or phone is not null), check ((status = 'converted' and converted_student_id is not null) or status <> 'converted')
);

create table public.lead_history (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, lead_id uuid not null,
  previous_status public.lead_status, new_status public.lead_status not null, actor_team_member_id uuid,
  note text, occurred_at timestamptz not null default now(), created_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id, lead_id) references public.leads(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, actor_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check (previous_status is null or previous_status <> new_status)
);

create table public.audit_entries (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, actor_user_id uuid,
  actor_role text not null, action text not null, target_type text not null, target_id uuid,
  before_data jsonb check (before_data is null or jsonb_typeof(before_data) = 'object'),
  after_data jsonb check (after_data is null or jsonb_typeof(after_data) = 'object'),
  reason text, correlation_id uuid not null, occurred_at timestamptz not null default now(), created_at timestamptz not null default now(),
  unique (assessoria_id, id), foreign key (assessoria_id) references public.assessorias(id) on delete restrict,
  foreign key (actor_user_id) references auth.users(id) on delete restrict
);

-- Tenant-first and worker indexes. Partial indexes keep free-tier storage lean.
create index team_members_assessoria_role_status_idx on public.team_members(assessoria_id, role, status, id);
create index enrollments_assessoria_status_idx on public.enrollments(assessoria_id, status, id);
create index class_meetings_schedule_idx on public.class_meetings(assessoria_id, starts_at, id) where canceled_at is null;
create index attendances_student_status_idx on public.attendances(assessoria_id, student_id, status, id);
create index subscriptions_assessoria_status_idx on public.subscriptions(assessoria_id, status, id);
create index charges_due_status_idx on public.charges(assessoria_id, status, due_on, id) where status in ('open', 'overdue');
create index provider_events_pending_idx on public.provider_events(status, received_at, id) where status in ('received', 'retryable_failure');
create index message_jobs_pending_idx on public.message_jobs(status, scheduled_for, id) where status in ('queued', 'retryable_failure');
create index payments_charge_idx on public.payments(assessoria_id, charge_id, created_at desc);
create index cash_movements_period_idx on public.cash_movements(assessoria_id, occurred_at desc, id);
create index leads_status_idx on public.leads(assessoria_id, status, created_at desc, id);
create index audit_entries_target_idx on public.audit_entries(assessoria_id, target_type, target_id, occurred_at desc);

-- New public tables are deliberately closed until Task 07 adds role policies and grants.
alter table public.team_members enable row level security; alter table public.team_members force row level security;
alter table public.students enable row level security; alter table public.students force row level security;
alter table public.enrollments enable row level security; alter table public.enrollments force row level security;
alter table public.enrollment_history enable row level security; alter table public.enrollment_history force row level security;
alter table public.classes enable row level security; alter table public.classes force row level security;
alter table public.class_memberships enable row level security; alter table public.class_memberships force row level security;
alter table public.class_meetings enable row level security; alter table public.class_meetings force row level security;
alter table public.attendances enable row level security; alter table public.attendances force row level security;
alter table public.absence_justifications enable row level security; alter table public.absence_justifications force row level security;
alter table public.plans enable row level security; alter table public.plans force row level security;
alter table public.plan_versions enable row level security; alter table public.plan_versions force row level security;
alter table public.subscriptions enable row level security; alter table public.subscriptions force row level security;
alter table public.subscription_history enable row level security; alter table public.subscription_history force row level security;
alter table public.billing_cycles enable row level security; alter table public.billing_cycles force row level security;
alter table public.billing_generation_runs enable row level security; alter table public.billing_generation_runs force row level security;
alter table public.billing_generation_watermarks enable row level security; alter table public.billing_generation_watermarks force row level security;
alter table public.charges enable row level security; alter table public.charges force row level security;
alter table public.charge_adjustments enable row level security; alter table public.charge_adjustments force row level security;
alter table public.payment_checkouts enable row level security; alter table public.payment_checkouts force row level security;
alter table public.payments enable row level security; alter table public.payments force row level security;
alter table public.payment_settlements enable row level security; alter table public.payment_settlements force row level security;
alter table public.payment_refunds enable row level security; alter table public.payment_refunds force row level security;
alter table public.payment_disputes enable row level security; alter table public.payment_disputes force row level security;
alter table public.financial_categories enable row level security; alter table public.financial_categories force row level security;
alter table public.expenses enable row level security; alter table public.expenses force row level security;
alter table public.other_revenues enable row level security; alter table public.other_revenues force row level security;
alter table public.cash_movements enable row level security; alter table public.cash_movements force row level security;
alter table public.provider_events enable row level security; alter table public.provider_events force row level security;
alter table public.integration_attempts enable row level security; alter table public.integration_attempts force row level security;
alter table public.contact_preferences enable row level security; alter table public.contact_preferences force row level security;
alter table public.message_templates enable row level security; alter table public.message_templates force row level security;
alter table public.message_jobs enable row level security; alter table public.message_jobs force row level security;
alter table public.message_events enable row level security; alter table public.message_events force row level security;
alter table public.leads enable row level security; alter table public.leads force row level security;
alter table public.lead_history enable row level security; alter table public.lead_history force row level security;
alter table public.audit_entries enable row level security; alter table public.audit_entries force row level security;

revoke all on table
  public.team_members, public.students, public.enrollments, public.enrollment_history,
  public.classes, public.class_memberships, public.class_meetings, public.attendances, public.absence_justifications,
  public.plans, public.plan_versions, public.subscriptions, public.subscription_history,
  public.billing_cycles, public.billing_generation_runs, public.billing_generation_watermarks, public.charges, public.charge_adjustments,
  public.payment_checkouts, public.payments, public.payment_settlements, public.payment_refunds, public.payment_disputes,
  public.financial_categories, public.expenses, public.other_revenues, public.cash_movements,
  public.provider_events, public.integration_attempts, public.contact_preferences, public.message_templates, public.message_jobs, public.message_events,
  public.leads, public.lead_history, public.audit_entries
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.team_members, public.students, public.enrollments, public.classes, public.class_memberships, public.class_meetings,
  public.attendances, public.absence_justifications, public.plans, public.plan_versions, public.subscriptions,
  public.billing_cycles, public.billing_generation_runs, public.billing_generation_watermarks, public.charges,
  public.payment_checkouts, public.payments, public.payment_settlements, public.payment_refunds, public.payment_disputes,
  public.financial_categories, public.expenses, public.other_revenues, public.provider_events, public.integration_attempts,
  public.contact_preferences, public.message_templates, public.message_jobs, public.leads
to service_role;
grant select, insert on table public.enrollment_history, public.subscription_history, public.charge_adjustments,
  public.cash_movements, public.message_events, public.lead_history, public.audit_entries to service_role;

do $triggers$
declare table_name text;
begin
  foreach table_name in array array[
    'team_members','students','enrollments','classes','class_memberships','class_meetings','attendances','absence_justifications',
    'plans','plan_versions','subscriptions','billing_cycles','billing_generation_runs','billing_generation_watermarks','charges',
    'payment_checkouts','payments','payment_settlements','payment_refunds','payment_disputes','financial_categories','expenses',
    'other_revenues','provider_events','integration_attempts','contact_preferences','message_templates','message_jobs','leads'
  ] loop
    execute format('create trigger %I before update on public.%I for each row execute function private.set_updated_at()', table_name || '_set_updated_at', table_name);
  end loop;
end
$triggers$;

comment on table public.students is 'Administrative student record; auth and legacy athlete links are optional and explicit.';
comment on table public.audit_entries is 'Append-only audit facts. Payloads must be sanitized before insertion.';
comment on table public.provider_events is 'Minimal sanitized provider envelope; never stores card payloads or secrets.';

commit;
