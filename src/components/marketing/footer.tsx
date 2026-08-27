import Link from "next/link";
import { Brand } from "../shared/brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            Tecnologia e metodologia para atletas que buscam evolução
            constante e resultados reais.
          </p>
        </div>
        <nav aria-label="Links do rodapé">
          <a href="#recursos">Recursos</a>
          <a href="#para-quem">Para quem</a>
          <Link href="/login">Entrar</Link>
          <Link href="/cadastro">Cadastrar</Link>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FLERNK.</span>
        <span>Corrida com direção.</span>
      </div>
    </footer>
  );
}
