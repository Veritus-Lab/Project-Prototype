import {
  CalendarDays,
  ChartColumnIncreasing,
  Cloud,
  MessagesSquare,
  Trophy,
} from "lucide-react";
import { Card } from "../ui/card";

const features = [
  {
    icon: CalendarDays,
    title: "Treinos personalizados",
    text: "Planos de treino feitos sob medida para cada objetivo e evolução.",
  },
  {
    icon: ChartColumnIncreasing,
    title: "Acompanhe sua evolução",
    text: "Resultados claros, métricas úteis e decisões orientadas por dados.",
  },
  {
    icon: MessagesSquare,
    title: "Comunicação direta",
    text: "Treinador e atleta alinhados antes, durante e depois de cada treino.",
  },
  {
    icon: Trophy,
    title: "Provas e resultados",
    text: "Histórico organizado para transformar cada conquista em aprendizado.",
  },
  {
    icon: Cloud,
    title: "Acesse de qualquer lugar",
    text: "A rotina da assessoria disponível com segurança onde você estiver.",
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
