import Link from "next/link";
import { Brand } from "../shared/brand";
import { buttonClassName } from "../ui/button";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="primary-nav" aria-label="Navegação principal">
          <a href="#recursos">A FLERNK</a>
          <a href="#para-quem">Como começar</a>
          <a href="#contato">Contato</a>
        </nav>
        <Link className={buttonClassName("ghost", "header-login")} href="/login">
          Entrar
        </Link>
      </div>
    </header>
  );
}
