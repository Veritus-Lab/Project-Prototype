import { ArrowUpRight, Flag } from "lucide-react";
import Link from "next/link";
import { buttonClassName } from "../ui/button";

const classes = [
  { label: "Adaptado", title: "Para começar com cuidado e presença.", text: "Uma porta de entrada para quem quer se movimentar e descobrir a corrida no seu tempo." },
  { label: "Turma 1 · Iniciantes", title: "Para colocar os primeiros passos em movimento.", text: "Um espaço para quem está conhecendo a corrida e quer criar uma nova rotina." },
  { label: "Turma 2 · Iniciantes intermediários", title: "Para seguir construindo constância.", text: "Para quem já começou e quer continuar encontrando seu ritmo com a turma." },
  { label: "Turma 3 · Iniciantes avançados", title: "Para levar a jornada mais adiante.", text: "Para quem deseja avançar na própria experiência de corrida com a FLERNK." },
];

export function Classes() {
  return (
    <section className="section classes-section" id="turmas" aria-labelledby="classes-title">
      <div className="container">
        <header className="section-heading section-heading-left classes-heading">
          <p>TURMAS FLERNK</p>
          <h2 id="classes-title">Encontre o ponto de partida que combina com você.</h2>
          <span className="section-intro">As turmas representam momentos diferentes de uma mesma jornada. A equipe ajuda você a entender qual delas conhecer primeiro.</span>
        </header>
        <div className="classes-grid">
          {classes.map((item, index) => (
            <article className="class-card" key={item.label}>
              <div className="class-card-topline">
                <span>{item.label}</span>
                <span>0{index + 1}</span>
              </div>
              <Flag aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <Link className={buttonClassName("secondary", "classes-cta")} href="#contato">
          Quero conhecer uma turma
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
