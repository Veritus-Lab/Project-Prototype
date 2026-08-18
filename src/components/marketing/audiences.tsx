import { ArrowRight, Check, Gauge, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const athleteBenefits = [
  "Treinos pensados para o seu momento",
  "Métricas claras para acompanhar sua evolução",
  "Contato direto com seu treinador",
  "Histórico de provas e conquistas",
];

const plans = [
  { audience: "Para Atletas", name: "Starter", price: "R$ 29", description: "Organização e evolução desde o primeiro treino.", href: "/login", featured: false },
  { audience: "Para Atletas Pro", name: "Pro Athlete", price: "R$ 59", description: "Alta performance com análises detalhadas.", href: "/login", featured: true },
  { audience: "Para Assessorias", name: "Treinador & Equipe", price: "R$ 149", description: "Gestão completa para até 50 atletas.", href: "/cadastro", featured: false },
] as const;

export function Audiences() {
  return (
    <>
      <section className="section-block bg-black" id="atletas">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Para atletas e treinadores</p>
            <h2 className="section-title">A solução completa para sua assessoria esportiva</h2>
            <p className="mt-5 max-w-xl leading-7 text-muted">
              Planejamento, acompanhamento e comunicação no mesmo ambiente para transformar consistência em resultado.
            </p>
            <ul className="mt-7 grid gap-4">
              {athleteBenefits.map((benefit) => (
                <li className="flex items-center gap-3 font-semibold text-white" key={benefit}>
                  <span className="grid size-6 place-items-center rounded-full bg-brand text-ink"><Check aria-hidden size={14} /></span>
                  {benefit}
                </li>
              ))}
            </ul>
            <Button className="mt-8" href="/login">Sou Atleta <ArrowRight aria-hidden size={18} /></Button>
          </div>

          <Card className="dashboard-preview overflow-hidden p-5 sm:p-7" id="treinadores">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <p className="text-xs font-bold uppercase text-brand">Painel da assessoria</p>
                <p className="mt-1 text-xl font-black text-white">Visão do treinador</p>
              </div>
              <UsersRound aria-hidden className="text-brand" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[ ["Atletas ativos", "42"], ["Treinos na semana", "126"], ["Conclusão", "89%"] ].map(([label, value]) => (
                <div className="rounded-lg border border-border bg-background p-3" key={label}>
                  <p className="text-[11px] text-subtle">{label}</p>
                  <p className="mt-1 text-xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-border bg-background p-5">
              <div className="flex items-center gap-3"><Gauge aria-hidden className="text-brand" /><span className="font-bold text-white">Evolução semanal da equipe</span></div>
              <div className="mt-7 flex h-28 items-end gap-3">
                {[42, 58, 50, 72, 64, 84, 92].map((height, index) => (
                  <span className="flex-1 rounded-t bg-brand/75" key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <Button className="mt-5 w-full" href="/cadastro" variant="secondary">Sou Treinador <ArrowRight aria-hidden size={18} /></Button>
          </Card>
        </div>
      </section>

      <section className="section-block border-y border-white/5" id="planos">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Investimento no seu potencial</p>
            <h2>Escolha o plano ideal para você</h2>
            <p>Evolua sem limites com planos flexíveis para atletas e assessorias esportivas.</p>
          </div>
          <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card className={`flex min-h-80 flex-col p-7 ${plan.featured ? "border-brand bg-surface-elevated shadow-[0_0_35px_rgba(226,255,0,.1)]" : ""}`} key={plan.name}>
                <p className={`text-xs font-bold uppercase ${plan.featured ? "text-brand" : "text-subtle"}`}>{plan.audience}</p>
                <h3 className="mt-2 text-2xl font-black text-white">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{plan.description}</p>
                <p className="mt-8 text-4xl font-black text-white">{plan.price}<span className="text-sm font-normal text-subtle">/mês</span></p>
                <Button className="mt-auto w-full" href={plan.href} variant={plan.featured ? "primary" : "ghost"}>
                  {plan.featured ? "Começar Agora" : plan.name === "Starter" ? "Assinar Starter" : "Testar Grátis 14 dias"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-14">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-7 rounded-lg bg-brand p-7 text-ink sm:p-10 lg:flex-row">
            <h2 className="max-w-3xl text-center text-2xl font-black uppercase lg:text-left sm:text-4xl">Pronto para levar seus resultados para o próximo nível?</h2>
            <Button className="shrink-0 bg-black text-white hover:bg-surface" href="/cadastro">Comece Agora <ArrowRight aria-hidden className="text-brand" size={18} /></Button>
          </div>
        </div>
      </section>
    </>
  );
}
