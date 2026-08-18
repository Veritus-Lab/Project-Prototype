import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/shared/brand";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-background py-14" id="contato">
      <div className="container grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Brand compact />
          <p className="mt-5 max-w-sm text-sm leading-6 text-subtle">Tecnologia e metodologia para atletas que buscam evolução constante e resultados reais.</p>
        </div>
        <div>
          <h2 className="font-bold text-white">Para Atletas</h2>
          <div className="mt-4 grid gap-2 text-sm text-subtle"><Link href="#atletas">Como funciona</Link><Link href="#planos">Planos</Link><Link href="/login">Entrar</Link></div>
        </div>
        <div>
          <h2 className="font-bold text-white">Para Treinadores</h2>
          <div className="mt-4 grid gap-2 text-sm text-subtle"><Link href="#treinadores">Ferramentas</Link><Link href="#planos">Planos</Link><Link href="/cadastro">Criar assessoria</Link></div>
        </div>
        <div>
          <h2 className="font-bold text-white">Contato</h2>
          <div className="mt-4 grid gap-3 text-sm text-subtle">
            <a className="flex items-center gap-2" href="tel:+5511999999999"><Phone aria-hidden className="text-brand" size={16} />(11) 99999-9999</a>
            <a className="flex items-center gap-2 break-all" href="mailto:contato@flernk.com.br"><Mail aria-hidden className="text-brand" size={16} />contato@flernk.com.br</a>
          </div>
        </div>
      </div>
      <div className="container mt-12 border-t border-white/5 pt-7 text-center text-xs text-subtle">© 2026 FLERNK. Todos os direitos reservados.</div>
    </footer>
  );
}
