import { ArrowRight, Bolt, CalendarCheck, UsersRound } from "lucide-react";
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
            Corra com a FLERNK.
            <br />
            <em>Com acompanhamento de verdade.</em>
          </h1>
          <p className="hero-lead">
            Uma assessoria para quem busca constância, comunidade e orientação
            na corrida.
          </p>
          <div
            className="hero-actions"
            role="group"
            aria-label="Escolha como acessar"
          >
            <Link className={buttonClassName()} href="#contato">
              Quero correr com a FLERNK
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className={buttonClassName("secondary")} href="/login">
              Já sou aluno
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ul className="hero-signals" aria-label="Destaques da plataforma">
            <li><CalendarCheck aria-hidden="true" /> Turmas e rotina organizada</li>
            <li><UsersRound aria-hidden="true" /> Gestão próxima dos alunos</li>
          </ul>
        </div>

        <aside className="performance-panel" aria-label="Exemplo de evolução de atleta">
          <div className="panel-topline">
            <span>SEMANA 08</span>
            <span className="live-status">NO RITMO</span>
          </div>
          <p className="panel-kicker">Volume acumulado</p>
          <strong className="panel-value">48,2 km</strong>
          <div className="pace-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <dl className="panel-metrics">
            <div>
              <dt>Ritmo médio</dt>
              <dd>04:20 /km</dd>
            </div>
            <div>
              <dt>Evolução</dt>
              <dd>+12,4%</dd>
            </div>
          </dl>
          <Bolt className="panel-bolt" aria-hidden="true" />
        </aside>
      </div>
    </section>
  );
}
