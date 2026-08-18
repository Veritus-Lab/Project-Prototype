import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/shared/brand";

const navigation = [
  ["Início", "#inicio"],
  ["Para Atletas", "#atletas"],
  ["Para Treinadores", "#treinadores"],
  ["Planos", "#planos"],
  ["Contato", "#contato"],
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between gap-6">
        <Brand />
        <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
          {navigation.map(([label, href], index) => (
            <Link
              className={`text-sm font-semibold transition-colors hover:text-brand ${index === 0 ? "text-brand" : "text-muted"}`}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Button className="px-5" href="/login">
          Entrar
        </Button>
      </div>
      <nav
        aria-label="Navegação rápida"
        className="container flex gap-5 overflow-x-auto border-t border-white/5 py-2 md:hidden"
      >
        {navigation.slice(1, 4).map(([label, href]) => (
          <Link className="shrink-0 text-xs font-semibold text-muted" href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
