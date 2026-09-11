import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Meu financeiro — FLERNK" };

export default async function StudentFinancialPage() {
  await requireRole("aluno");

  return (
    <div className="dashboard-page">
      <p className="eyebrow">Meu financeiro</p>
      <h1 className="dashboard-title">Pagamentos e cobranças</h1>
      <p className="dashboard-subtitle">
        Acompanhe somente as informações financeiras vinculadas ao seu acesso.
      </p>
      <section className="dashboard-section">
        <Card elevated>
          <h2>Histórico financeiro</h2>
          <p className="dashboard-empty-state">
            Suas cobranças e pagamentos serão apresentados aqui na próxima etapa financeira.
          </p>
        </Card>
      </section>
    </div>
  );
}
