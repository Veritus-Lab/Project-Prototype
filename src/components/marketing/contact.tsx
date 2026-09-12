import Link from "next/link";

import { buttonClassName } from "../ui/button";

export function Contact() {
  return (
    <section className="section audience-section" id="contato" aria-labelledby="contact-title">
      <div className="container section-heading">
        <p>VAMOS CONVERSAR</p>
        <h2 id="contact-title">Quer dar seu primeiro passo?</h2>
        <p className="hero-lead">A FLERNK recebe quem está começando. Conte para a equipe o que você procura e conheça as opções para participar.</p>
        <div className="hero-actions">
          <Link className={buttonClassName()} href="/login">Já sou aluno</Link>
          <a className={buttonClassName("secondary")} href="#top">Conhecer a FLERNK</a>
        </div>
      </div>
    </section>
  );
}
