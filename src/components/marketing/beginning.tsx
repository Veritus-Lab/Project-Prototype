import { Sparkles } from "lucide-react";

export function Beginning() {
  return (
    <section className="beginning-section" aria-labelledby="beginning-title">
      <div className="container beginning-grid">
        <div className="beginning-mark" aria-hidden="true">
          <Sparkles />
          <span>01</span>
        </div>
        <div>
          <p className="eyebrow">NÃO É PRECISO ESPERAR</p>
          <h2 id="beginning-title">A corrida não começa quando você se sente pronto.</h2>
        </div>
        <p className="beginning-copy">
          Ela começa quando você decide se dar uma chance. Na FLERNK, o seu primeiro passo tem espaço para ser do seu jeito.
        </p>
      </div>
    </section>
  );
}
