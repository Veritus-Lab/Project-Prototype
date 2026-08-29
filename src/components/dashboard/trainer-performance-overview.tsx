import type { TrainerPerformanceData } from "@/lib/services/trainer-performance.service";

export function TrainerPerformanceOverview({
  performance,
}: {
  performance: TrainerPerformanceData;
}) {
  const highestDailyExecutions = Math.max(
    ...performance.days.map((day) => day.executions),
    1,
  );

  return (
    <div className="trainer-performance-overview">
      <div className="trainer-performance-metrics">
        {performance.metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.hint}</small>
          </div>
        ))}
      </div>

      <div className="trainer-performance-chart" aria-label="Execuções concluídas por dia">
        <div className="trainer-performance-chart-heading">
          <span>Execuções concluídas por dia</span>
          {performance.rpeAverage ? (
            <small>RPE médio registrado: {performance.rpeAverage}</small>
          ) : null}
        </div>
        <ol>
          {performance.days.map((day) => {
            const height = day.executions
              ? Math.max((day.executions / highestDailyExecutions) * 100, 12)
              : 0;

            return (
              <li className={day.isToday ? "is-today" : undefined} key={day.dateKey}>
                <span className="trainer-performance-bar-track">
                  <span
                    aria-label={`${day.executions} execução(ões)`}
                    className="trainer-performance-bar"
                    style={{ height: `${height}%` }}
                  />
                </span>
                <strong>{day.executions}</strong>
                <small>{day.weekday}</small>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
