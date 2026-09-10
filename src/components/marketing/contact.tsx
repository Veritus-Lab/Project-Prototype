import Link from "next/link";

import { buttonClassName } from "../ui/button";

export function Contact() {
  return (
    <section className="section audience-section" id="contato" aria-labelledby="contact-title">
      <div className="container section-heading">
        <p>VAMOS CONVERSAR</p>
        <h2 id="contact-title">Quer correr com a FLERNK?</h2>
        <p className="hero-lead">Conte para a nossa equipe o que você procura. A matrícula é feita com atendimento humano, no momento certo para você.</p>
        <div className="hero-actions">
          <Link className={buttonClassName()} href="/login">Já sou aluno</Link>
          <a className={buttonClassName("secondary")} href="#top">Conhecer a FLERNK</a>
        </div>
      </div>
    </section>
  );
}
