import { ArrowRight, BarChart3, CalendarCheck, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const highlights = [
  [CalendarCheck, "Treinos Personalizados"],
  [BarChart3, "Acompanhamento de Resultados"],
  [MessageSquare, "Comunicação Integrada"],
  [ShieldCheck, "100% Online e Seguro"],
] as const;

export function Hero() {
  return (
    <section className="hero-grid overflow-hidden border-b border-white/5" id="inicio">
      <div className="container grid min-h-[calc(100svh-4.5rem)] items-center gap-12 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
        <div className="max-w-3xl text-center lg:text-left">
          <Badge className="mb-6 gap-2">
            <span className="size-2 rounded-full bg-brand" />
            Plataforma completa de assessoria esportiva
          </Badge>
          <h1 className="text-hero font-black uppercase text-white">
            Evolua.<br />Supere.<br />
            <span className="text-brand">Alcance mais.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-xl lg:mx-0">
            A plataforma ideal para treinadores e atletas alcançarem seus melhores resultados juntos.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button className="px-8 py-4" href="/login">
              Sou Atleta <ArrowRight aria-hidden size={18} />
            </Button>
            <Button className="px-8 py-4" href="/cadastro" variant="secondary">
              Sou Treinador <ArrowRight aria-hidden size={18} />
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-7 sm:grid-cols-4">
            {highlights.map(([Icon, label]) => (
              <div className="flex items-center gap-3 text-left" key={label}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-brand">
                  <Icon aria-hidden size={18} />
                </span>
                <span className="text-xs font-semibold leading-4 text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="hero-visual relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-surface shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_15%,rgba(226,255,0,.08)_42%,transparent_70%)]" />
            <div className="absolute left-7 top-7 border-l-2 border-t-2 border-brand p-10" />
            <div className="absolute bottom-7 right-7 border-b-2 border-r-2 border-brand p-10" />
            <div className="absolute inset-x-8 top-[24%] text-center">
              <span className="text-[clamp(4.5rem,14vw,8.5rem)] font-black text-brand/12">F</span>
              <p className="text-xs font-bold uppercase text-brand">Performance conectada</p>
              <p className="mt-2 text-3xl font-black text-white">Cada treino conta.</p>
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/10 bg-background/90 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-brand text-ink">
                    <Zap aria-hidden fill="currentColor" size={18} />
                  </span>
                  <div>
                    <p className="text-xs text-muted">Ritmo médio hoje</p>
                    <p className="text-lg font-black text-white">04:20 <span className="text-xs text-brand">min/km</span></p>
                  </div>
                </div>
                <Badge className="normal-case text-emerald-300">+12,4% evolução</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
