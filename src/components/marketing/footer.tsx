import Link from "next/link";
import { Brand } from "../shared/brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            Assessoria de corrida para descobrir o seu ritmo, passo a passo.
          </p>
        </div>
        <nav aria-label="Links do rodapé">
          <a href="#flernk">A FLERNK</a>
          <a href="#como-comecar">Como começar</a>
          <a href="#turmas">Turmas</a>
          <Link href="/login">Entrar</Link>
          <a href="#contato">Falar com a FLERNK</a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FLERNK.</span>
        <span>Corrida com direção.</span>
      </div>
    </footer>
  );
}
