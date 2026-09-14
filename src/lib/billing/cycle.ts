export type BillingPeriodicity = "monthly" | "quarterly" | "semiannual" | "annual";

export function dueDateInMonth(month: string, dueDay: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return `${month}-${String(Math.min(dueDay, lastDay)).padStart(2, "0")}`;
}

export function firstBillingDueDate(startsOn: string, dueDay: number, periodicity: BillingPeriodicity) {
  const interval = { monthly: 1, quarterly: 3, semiannual: 6, annual: 12 }[periodicity];
  const [year, month] = startsOn.slice(0, 7).split("-").map(Number);
  let candidateMonth = new Date(Date.UTC(year, month - 1, 1));
  let due = dueDateInMonth(`${candidateMonth.getUTCFullYear()}-${String(candidateMonth.getUTCMonth() + 1).padStart(2, "0")}`, dueDay);
  if (due < startsOn) {
    candidateMonth.setUTCMonth(candidateMonth.getUTCMonth() + interval);
    due = dueDateInMonth(`${candidateMonth.getUTCFullYear()}-${String(candidateMonth.getUTCMonth() + 1).padStart(2, "0")}`, dueDay);
  }
  return due;
}

export function isBillingActiveOn(startsOn: string, dueOn: string, changes: ReadonlyArray<{ effectiveOn: string; status: string }>) {
  if (dueOn < startsOn) return false;
  const latest = changes.filter((change) => change.effectiveOn <= dueOn).sort((a, b) => b.effectiveOn.localeCompare(a.effectiveOn))[0];
  return (latest?.status ?? "active") === "active";
}
