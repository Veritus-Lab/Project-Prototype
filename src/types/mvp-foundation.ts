export const TEAM_MEMBER_ROLES = ["socio", "professor"] as const
export type TeamMemberRole = (typeof TEAM_MEMBER_ROLES)[number]

export const TEAM_MEMBER_STATUSES = ["active", "inactive"] as const
export type TeamMemberStatus = (typeof TEAM_MEMBER_STATUSES)[number]

export const ENROLLMENT_STATUSES = ["active", "suspended", "ended"] as const
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "excused",
  "not_recorded",
] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const SUBSCRIPTION_STATUSES = [
  "draft",
  "active",
  "paused",
  "ended",
  "canceled",
  "exempt",
] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const CHARGE_STATUSES = [
  "draft",
  "open",
  "overdue",
  "paid",
  "reversed",
  "canceled",
  "exempt",
] as const
export type ChargeStatus = (typeof CHARGE_STATUSES)[number]

export const CHECKOUT_STATUSES = [
  "created",
  "active",
  "paid",
  "expired",
  "canceled",
  "failed",
] as const
export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number]

export const PAYMENT_STATUSES = [
  "pending",
  "authorized",
  "confirmed",
  "failed",
  "canceled",
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const SETTLEMENT_STATUSES = ["pending", "received", "reversed"] as const
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number]

export const REFUND_STATUSES = [
  "requested",
  "confirmed",
  "reversed",
  "failed",
  "canceled",
] as const
export type RefundStatus = (typeof REFUND_STATUSES)[number]

export const DISPUTE_STATUSES = [
  "open",
  "under_review",
  "won",
  "lost",
  "reversed",
  "canceled",
] as const
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number]

export const EXPENSE_STATUSES = ["planned", "paid", "canceled"] as const
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number]

export const PROVIDER_EVENT_STATUSES = [
  "received",
  "processing",
  "processed",
  "retryable_failure",
  "dead_letter",
  "ignored",
] as const
export type ProviderEventStatus = (typeof PROVIDER_EVENT_STATUSES)[number]

export const MESSAGE_STATUSES = [
  "queued",
  "claimed",
  "submitted",
  "delivered",
  "read",
  "retryable_failure",
  "canceled",
  "dead_letter",
] as const
export type MessageStatus = (typeof MESSAGE_STATUSES)[number]

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "trial_scheduled",
  "converted",
  "closed",
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type BrlCents = number & { readonly __brand: "BrlCents" }
export type IsoDate = string & { readonly __brand: "IsoDate" }
export type UtcTimestamp = string & { readonly __brand: "UtcTimestamp" }
