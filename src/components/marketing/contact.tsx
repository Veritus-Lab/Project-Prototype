import Link from "next/link";

import { buttonClassName } from "../ui/button";

export function Contact() {
  return (
    <section className="section audience-section" id="contato" aria-labelledby="contact-title">
      <div className="container section-heading">
        <p>VAMOS CONVERSAR</p>
        <h2 id="contact-title">Seu próximo passo pode começar agora.</h2>
        <p className="hero-lead">A FLERNK recebe quem está começando. Conheça as turmas e, quando estiver pronto, converse com a equipe sobre como participar.</p>
        <div className="hero-actions">
          <Link className={buttonClassName()} href="/login">Já sou aluno</Link>
          <a className={buttonClassName("secondary")} href="#turmas">Conhecer as turmas</a>
        </div>
      </div>
    </section>
  );
}
