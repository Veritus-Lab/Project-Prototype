import { TrainingScheduleForm } from "@/components/dashboard/training-schedule-form";
import { TrainerWeeklyCalendar } from "@/components/dashboard/trainer-weekly-calendar";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listTrainerAthletes } from "@/lib/services/athlete.service";
import { getTrainerWeeklySchedule } from "@/lib/services/trainer-calendar.service";
import { listTrainerTrainings } from "@/lib/services/training.service";

export const metadata = { title: "Calendário - FLERNK" };

export default async function TrainerCalendarPage() {
  const user = await requireRole("treinador");
  const [athleteResult, trainingResult, weeklyScheduleResult] = await Promise.all([
    listTrainerAthletes(user),
    listTrainerTrainings(user),
    getTrainerWeeklySchedule(user),
  ]);
  const athletes = "data" in athleteResult && athleteResult.data ? athleteResult.data : [];
  const trainings = "data" in trainingResult && trainingResult.data ? trainingResult.data : [];

  return (
    <div className="dashboard-page trainer-calendar-page">
      <p className="eyebrow">Painel do treinador</p>
      <h1 className="dashboard-title">Calendário</h1>
      <p className="dashboard-subtitle">Planeje os próximos treinos da assessoria.</p>

      <section className="dashboard-section">
        <Card elevated className="trainer-calendar-card">
          <h2>Agenda desta semana</h2>
          {"data" in weeklyScheduleResult ? (
            <TrainerWeeklyCalendar schedule={weeklyScheduleResult.data} />
          ) : (
            <p className="form-error" role="alert">{weeklyScheduleResult.error}</p>
          )}
        </Card>
      </section>

      <section className="dashboard-section">
        <Card elevated>
          <h2>Novo agendamento</h2>
          {"error" in athleteResult || "error" in trainingResult ? (
            <p className="form-error" role="alert">
              Não foi possível carregar os dados de agendamento.
            </p>
          ) : (
            <TrainingScheduleForm athletes={athletes} trainings={trainings} />
          )}
        </Card>
      </section>
    </div>
  );
}
