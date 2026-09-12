import Link from "next/link";

import { buttonClassName } from "../ui/button";
import { FLERNK_INSTAGRAM_URL } from "./contact-channel";

export function Contact() {
  return (
    <section className="section audience-section" id="contato" aria-labelledby="contact-title">
      <div className="container section-heading">
        <p>VAMOS CONVERSAR</p>
        <h2 id="contact-title">Seu próximo passo pode começar agora.</h2>
        <p className="hero-lead">A FLERNK recebe quem está começando. Fale com a equipe no Instagram para tirar dúvidas e conhecer as opções para participar.</p>
        <div className="hero-actions">
          <a
            className={buttonClassName()}
            href={FLERNK_INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
          >
            Falar com a FLERNK no Instagram
          </a>
          <Link className={buttonClassName("secondary")} href="/login">Já sou aluno</Link>
        </div>
      </div>
    </section>
  );
}
