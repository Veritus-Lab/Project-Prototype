import { ArrowDown, MessageCircleMore, SearchCheck, UserRoundPlus } from "lucide-react";

const steps = [
  {
    icon: MessageCircleMore,
    title: "Conte onde você está",
    text: "Compartilhe com a equipe o que você procura ao começar a correr.",
  },
  {
    icon: SearchCheck,
    title: "Conheça a FLERNK",
    text: "Entenda as opções disponíveis e tire suas dúvidas antes de entrar.",
  },
  {
    icon: UserRoundPlus,
    title: "Entre para a turma",
    text: "Conclua sua inscrição com a equipe e comece a fazer parte.",
  },
];

export function HowItWorks() {
  return (
    <section className="section journey-section" id="como-comecar" aria-labelledby="journey-title">
      <div className="container">
        <header className="section-heading section-heading-left journey-heading">
          <p>COMO COMEÇAR</p>
          <h2 id="journey-title">Um passo de cada vez.</h2>
          <span className="section-intro">Você não precisa resolver tudo sozinho. A conversa inicial mostra o caminho para chegar à FLERNK.</span>
        </header>
        <ol className="journey-list">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <span className="journey-number">0{index + 1}</span>
              <Icon aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              {index < steps.length - 1 && <ArrowDown className="journey-arrow" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
