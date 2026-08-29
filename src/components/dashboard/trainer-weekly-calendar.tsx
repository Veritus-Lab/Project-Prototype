import Link from "next/link";

import type { TrainerWeeklySchedule } from "@/lib/services/trainer-calendar.service";

export function TrainerWeeklyCalendar({
  schedule,
}: {
  schedule: TrainerWeeklySchedule;
}) {
  return (
    <div
      aria-label={`Agenda semanal no timezone ${schedule.timezone}`}
      className="trainer-week-calendar-scroll"
      tabIndex={0}
    >
      <ol className="trainer-week-calendar">
        {schedule.days.map((day) => (
          <li
            aria-current={day.isToday ? "date" : undefined}
            className={day.isToday ? "is-today" : undefined}
            key={day.dateKey}
          >
            <div className="trainer-week-day-heading">
              <span>{day.weekday}</span>
              <strong>{day.dayNumber}</strong>
            </div>
            {day.events.length ? (
              <ul>
                {day.events.map((event) => (
                  <li key={event.id}>
                    <time>{event.time}</time>
                    <Link href={`/treinador/atletas/${event.athleteId}`}>
                      {event.athleteName}
                    </Link>
                    <span>{event.trainingTitle}</span>
                    <small>{event.status}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem treino</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
