import Link from "next/link";

const questions = [
  {
    question: "Preciso já saber correr?",
    answer: "Não. A FLERNK recebe pessoas que estão começando. Na conversa inicial, você pode contar sobre o seu momento e suas dúvidas.",
  },
  {
    question: "Como escolho uma turma?",
    answer: "As turmas representam momentos diferentes da jornada. A equipe apresenta as opções disponíveis e ajuda você a entender qual delas conhecer primeiro.",
  },
  {
    question: "Como entro para a FLERNK?",
    answer: "O primeiro passo é conversar com a equipe. Ela explica o que é necessário para participar e conduz a inscrição.",
  },
];

export function Faq() {
  return (
    <section className="section faq-section" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <header className="section-heading section-heading-left faq-heading">
          <p>DÚVIDAS DE QUEM COMEÇA</p>
          <h2 id="faq-title">Antes do primeiro passo, uma boa conversa.</h2>
          <p className="section-body-copy">Se você já faz parte da FLERNK, suas informações ficam no seu acesso.</p>
          <Link href="/login">Entrar na minha conta</Link>
        </header>
        <div className="faq-list">
          {questions.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
