import { ArrowRight, Bolt, Footprints, UsersRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { buttonClassName } from "../ui/button";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <Badge>
            <Bolt size={15} aria-hidden="true" />
            Assessoria esportiva FLERNK
          </Badge>
          <h1 id="hero-title">
            <span>A chama</span>{" "}
            <em>que te move.</em>
          </h1>
          <p className="hero-lead">
            Começar na corrida é mais leve quando você tem uma equipe por perto.
            Conheça a FLERNK e encontre uma forma de dar seu primeiro passo.
          </p>
          <div
            className="hero-actions"
            role="group"
            aria-label="Escolha como acessar"
          >
            <Link className={buttonClassName()} href="#contato">
              Quero começar na FLERNK
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className={buttonClassName("secondary")} href="/login">
              Já sou aluno
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ul className="hero-signals" aria-label="Destaques da assessoria">
            <li><Footprints aria-hidden="true" /> Para quem está começando</li>
            <li><UsersRound aria-hidden="true" /> Uma equipe para caminhar junto</li>
          </ul>
        </div>

        <aside className="beginner-panel" aria-label="Como começar na FLERNK">
          <div className="panel-topline">
            <span>SEU PRIMEIRO PASSO</span>
            <span className="live-status">COMEÇA AQUI</span>
          </div>
          <h2>Você não precisa chegar pronto.</h2>
          <p>Conte o que você busca. A equipe ajuda a entender como a FLERNK pode fazer parte da sua rotina.</p>
          <ol className="beginner-steps">
            <li><span>01</span><div><strong>Converse com a equipe</strong><small>Compartilhe seu momento e suas dúvidas.</small></div></li>
            <li><span>02</span><div><strong>Conheça as opções</strong><small>Entenda como participar da assessoria.</small></div></li>
            <li><span>03</span><div><strong>Comece no seu momento</strong><small>Encontre uma nova forma de se movimentar.</small></div></li>
          </ol>
          <Bolt className="panel-bolt" aria-hidden="true" />
        </aside>
      </div>
    </section>
  );
}
