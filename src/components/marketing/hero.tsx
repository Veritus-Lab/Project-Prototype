import { ArrowRight, Bolt, CalendarCheck, ChartNoAxesCombined } from "lucide-react";
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
            Plataforma de assessoria esportiva
          </Badge>
          <h1 id="hero-title">
            FLERNK: evolua.
            <br />
            Supere. <em>Alcance mais.</em>
          </h1>
          <p className="hero-lead">
            A plataforma ideal para treinadores e atletas alcançarem seus
            melhores resultados juntos.
          </p>
          <div
            className="hero-actions"
            role="group"
            aria-label="Escolha como acessar"
          >
            <Link className={buttonClassName()} href="/cadastro">
              Sou Treinador
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className={buttonClassName("secondary")} href="/login">
              Sou Atleta
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <ul className="hero-signals" aria-label="Destaques da plataforma">
            <li>
              <CalendarCheck aria-hidden="true" /> Treinos personalizados
            </li>
            <li>
              <ChartNoAxesCombined aria-hidden="true" /> Evolução visível
            </li>
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
