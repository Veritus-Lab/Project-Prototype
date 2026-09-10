import { ArrowUpRight, UsersRound } from "lucide-react";
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
          <p>PARA QUEM QUER CORRER COM A FLERNK</p>
          <h2 id="audiences-title">Uma assessoria perto da sua rotina.</h2>
        </header>
        <div className="audience-grid">
          <article className="audience-block coach-block">
            <UsersRound aria-hidden="true" />
            <p className="eyebrow">Para novos alunos</p>
            <h3>Comece com uma equipe que acompanha você.</h3>
            <p>
              Conheça a FLERNK, encontre a turma adequada e fale com a equipe.
            </p>
            <Link className={buttonClassName()} href="#contato">
              Quero conhecer a FLERNK
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
          <article className="audience-block athlete-block">
            <UsersRound aria-hidden="true" />
            <p className="eyebrow">Para alunos</p>
            <h3>Seu acesso reúne o que importa para sua rotina.</h3>
            <p>
              Consulte sua turma, presença e informações financeiras em um só lugar.
            </p>
            <Link className={buttonClassName("secondary")} href="/login">
              Acessar minha conta
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
