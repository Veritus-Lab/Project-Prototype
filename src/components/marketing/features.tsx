import { BarChart3, CalendarDays, Cloud, MessageSquare, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  [CalendarDays, "Treinos Personalizados", "Planos de treino feitos sob medida para o seu objetivo e evolução."],
  [BarChart3, "Acompanhe sua Evolução", "Visualize seus resultados com gráficos e métricas avançadas."],
  [MessageSquare, "Comunicação Direta", "Fale com seu treinador, tire dúvidas e receba orientações."],
  [Trophy, "Provas e Resultados", "Guarde suas conquistas e acompanhe sua história."],
  [Cloud, "Acesse de Qualquer Lugar", "Seus treinos sempre disponíveis, em qualquer dispositivo."],
] as const;

export function Features() {
  return (
    <section className="section-block border-b border-white/5" aria-labelledby="features-title">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Recursos que fazem a diferença</p>
          <h2 id="features-title">Tudo que você precisa em um só lugar</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map(([Icon, title, description]) => (
            <Card className="group p-5 transition-colors hover:border-brand/40 hover:bg-surface-elevated" key={title}>
              <span className="mb-5 grid size-11 place-items-center rounded-lg border border-border bg-background text-brand transition-colors group-hover:bg-brand group-hover:text-ink">
                <Icon aria-hidden size={20} />
              </span>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-subtle">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
