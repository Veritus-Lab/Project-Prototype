import { BillingReminderList } from "@/components/dashboard/billing-reminder-list";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listTrainerBillingReminders } from "@/lib/services/reminder-dashboard.service";

export const metadata = { title: "Mensagens - FLERNK" };

export default async function TrainerMessagesPage() {
  const user = await requireRole("treinador");
  const remindersResult = await listTrainerBillingReminders(user, 20);

  return (
    <div className="dashboard-page trainer-messages-page">
      <p className="eyebrow">Painel do treinador</p>
      <h1 className="dashboard-title">Mensagens</h1>
      <p className="dashboard-subtitle">
        Acompanhe os lembretes financeiros preparados para a operação.
      </p>

      <section className="dashboard-section">
        <Card elevated className="trainer-messages-card">
          <div className="trainer-panel-heading">
            <div>
              <p className="eyebrow">Comunicação</p>
              <h2>Fila de lembretes</h2>
            </div>
          </div>
          <p className="field-hint">
            Preparar um lembrete não envia WhatsApp. O envio por provedor continua fora do escopo atual.
          </p>
          {"data" in remindersResult ? (
            <BillingReminderList reminders={remindersResult.data} />
          ) : (
            <p className="form-error" role="alert">{remindersResult.error}</p>
          )}
        </Card>
      </section>
    </div>
  );
}
