import Link from "next/link";

import type { BillingReminderSummary } from "@/lib/services/reminder-dashboard.service";

export function BillingReminderList({
  reminders,
}: {
  reminders: BillingReminderSummary[];
}) {
  if (!reminders.length) {
    return (
      <p className="dashboard-empty-state">
        Nenhum lembrete financeiro foi preparado.
      </p>
    );
  }

  return (
    <ul className="trainer-reminder-list">
      {reminders.map((reminder) => (
        <li key={reminder.id}>
          <div>
            <Link href={`/treinador/atletas/${reminder.athleteId}`}>
              {reminder.athleteName}
            </Link>
            <span>{reminder.template}</span>
          </div>
          <time>{reminder.scheduledFor}</time>
          <small data-status={reminder.status.toLowerCase()}>{reminder.status}</small>
        </li>
      ))}
    </ul>
  );
}
