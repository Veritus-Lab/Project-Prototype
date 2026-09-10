import { CalendarDays, CircleDollarSign, HeartHandshake, UsersRound } from "lucide-react";
import { Card } from "../ui/card";

const features = [
  {
    icon: CalendarDays,
    title: "Turmas organizadas",
    text: "Uma rotina clara para você acompanhar sua participação.",
  },
  {
    icon: UsersRound,
    title: "Equipe próxima",
    text: "Uma assessoria que organiza a experiência dos seus alunos.",
  },
  {
    icon: CircleDollarSign,
    title: "Financeiro transparente",
    text: "Consulte suas cobranças e pagamentos no seu próprio acesso.",
  },
  {
    icon: HeartHandshake,
    title: "Atendimento humano",
    text: "Fale com a FLERNK para conhecer as opções disponíveis.",
  },
  {
    icon: CalendarDays,
    title: "Acesso simples",
    text: "Informações da sua jornada reunidas em um só lugar.",
  },
];

export function Features() {
  return (
    <section className="section" id="recursos" aria-labelledby="features-title">
      <div className="container">
        <header className="section-heading">
          <p>RECURSOS QUE FAZEM A DIFERENÇA</p>
          <h2 id="features-title">Tudo que você precisa em um só lugar</h2>
        </header>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }, index) => (
            <Card key={title} elevated={index === 1}>
              <Icon className="card-icon" aria-hidden="true" />
              <span className="card-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
