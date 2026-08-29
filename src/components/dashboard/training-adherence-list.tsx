import { Card } from "@/components/ui/card";
import type { AdherenceMetric, TrainingAdherenceItem } from "@/lib/services/training-adherence.service";

const statusLabels = {
  abaixo: "Abaixo do planejado",
  proximo: "Próximo do planejado",
  acima: "Acima do planejado",
  nao_informado: "Não informado",
} as const;

function formatValue(metric: AdherenceMetric, unit: "km" | "min") {
  const format = (value: number) => unit === "km"
    ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value / 1000)
    : String(value);
  if (metric.planned === null && metric.actual === null) return "Sem dados";
  return `${metric.actual === null ? "—" : format(metric.actual)} / ${metric.planned === null ? "—" : format(metric.planned)} ${unit}`;
}

function Metric({ label, metric, unit }: { label: string; metric: AdherenceMetric; unit: "km" | "min" }) {
  return <div className="training-adherence-metric"><span>{label}</span><strong>{formatValue(metric, unit)}</strong><small className={`training-adherence-status training-adherence-status-${metric.status}`}>{statusLabels[metric.status]}</small></div>;
}

export function TrainingAdherenceList({ items }: { items: TrainingAdherenceItem[] }) {
  if (!items.length) return <p className="dashboard-empty-state">Nenhum treino concluído com dados disponíveis para comparação.</p>;
  return <ul className="training-adherence-list">{items.map((item) => <li key={item.executionId}><Card elevated className="training-adherence-card"><div className="training-adherence-heading"><h3>{item.title}</h3><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(item.recordedAt))}</span></div><div className="training-adherence-metrics"><Metric label="Distância real / prevista" metric={item.distance} unit="km" /><Metric label="Duração real / prevista" metric={item.duration} unit="min" /></div><div className="training-adherence-feedback"><span>RPE: {item.rpe ?? "não informado"}</span>{item.note ? <p>Observação do atleta: {item.note}</p> : <p>Sem observação do atleta.</p>}</div></Card></li>)}</ul>;
}
