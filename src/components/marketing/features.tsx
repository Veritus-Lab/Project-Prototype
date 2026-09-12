import { Footprints, HeartHandshake, UsersRound } from "lucide-react";
import { Card } from "../ui/card";

const features = [
  {
    icon: Footprints,
    title: "Começo sem pressão",
    text: "Você pode chegar com dúvidas, vontade de se movimentar e o seu próprio ritmo.",
  },
  {
    icon: UsersRound,
    title: "Uma turma para pertencer",
    text: "A corrida ganha outra energia quando existe gente para compartilhar o caminho.",
  },
  {
    icon: HeartHandshake,
    title: "Apoio para seguir",
    text: "Converse com a equipe e entenda como participar da FLERNK no seu momento.",
  },
];

export function Features() {
  return (
    <section className="section features-section" id="flernk" aria-labelledby="features-title">
      <div className="container">
        <header className="section-heading">
          <p>A FLERNK É PARA VOCÊ</p>
          <h2 id="features-title">O primeiro quilômetro também conta.</h2>
          <span className="section-intro">
            A assessoria é um lugar para começar, criar constância e celebrar cada avanço da sua jornada.
          </span>
        </header>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }, index) => (
            <Card key={title} elevated={index === 1} className="feature-card">
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
