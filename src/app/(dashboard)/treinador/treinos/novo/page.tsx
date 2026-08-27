import Link from "next/link";

import { TrainingForm } from "@/components/dashboard/training-form";
import { requireRole } from "@/lib/auth/session";
import { listTrainingTypeCatalog } from "@/lib/services/training-template.service";

export const metadata = { title: "Novo treino — FLERNK" };

export default async function NewTrainingPage() {
  await requireRole("treinador");
  const catalogResult = await listTrainingTypeCatalog();
  const trainingTypes = "data" in catalogResult && catalogResult.data ? catalogResult.data : [];

  return <div className="dashboard-page"><p className="eyebrow">Treinos</p><h1 className="dashboard-title">Novo treino</h1><p className="dashboard-subtitle">Defina os blocos manualmente. A biblioteca orienta a estrutura, mas a revisão continua sendo sua.</p>{"error" in catalogResult ? <p className="form-error" role="alert">{catalogResult.error}</p> : null}<TrainingForm trainingTypes={trainingTypes} /><Link className="dashboard-link" href="/treinador/treinos">Voltar para treinos</Link></div>;
}
