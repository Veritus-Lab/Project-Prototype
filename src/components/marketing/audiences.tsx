import { ArrowUpRight, Dumbbell, UsersRound } from "lucide-react";
import Link from "next/link";
import { buttonClassName } from "../ui/button";

export function Audiences() {
  return (
    <section
      className="section audience-section"
      id="para-quem"
      aria-labelledby="audiences-title"
    >
      <div className="container">
        <header className="section-heading section-heading-left">
          <p>PARA ATLETAS E TREINADORES</p>
          <h2 id="audiences-title">Uma equipe. O mesmo objetivo.</h2>
        </header>
        <div className="audience-grid">
          <article className="audience-block coach-block">
            <UsersRound aria-hidden="true" />
            <p className="eyebrow">Para treinadores</p>
            <h3>Mais gestão. Mais atletas em evolução.</h3>
            <p>
              Prescreva treinos, acompanhe resultados e mantenha sua assessoria
              conectada em uma única rotina.
            </p>
            <Link className={buttonClassName()} href="/cadastro">
              Cadastrar minha assessoria
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
          <article className="audience-block athlete-block">
            <Dumbbell aria-hidden="true" />
            <p className="eyebrow">Para atletas</p>
            <h3>Seu próximo resultado começa no plano de hoje.</h3>
            <p>
              Receba orientações, registre seus treinos e enxergue sua evolução
              com clareza.
            </p>
            <Link className={buttonClassName("secondary")} href="/login">
              Acessar meus treinos
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
