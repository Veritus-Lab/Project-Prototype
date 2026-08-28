import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Meu calendário - FLERNK" };

export default async function AthleteCalendarPage() {
  const user = await requireRole("atleta");
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("treinos_atletas")
    .select("id, agendado_para, timezone, observacao_treinador, treinos(titulo, descricao)")
    .eq("assessoria_id", user.assessoriaId)
    .eq("atleta_id", user.id)
    .not("agendado_para", "is", null)
    .order("agendado_para", { ascending: true })
    .limit(20);

  return <div className="dashboard-page"><p className="eyebrow">Painel do atleta</p><h1 className="dashboard-title">Calendário</h1><p className="dashboard-subtitle">Seus próximos treinos programados.</p><section className="dashboard-section"><Card elevated>{error ? <p className="form-error" role="alert">Não foi possível carregar seu calendário.</p> : data?.length ? <ul className="dashboard-list">{data.map((item) => { const training = Array.isArray(item.treinos) ? item.treinos[0] : item.treinos; const date = item.agendado_para ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short", timeZone: item.timezone ?? "UTC" }).format(new Date(item.agendado_para)) : ""; return <li key={item.id}><span className="dashboard-list-title">{training?.titulo ?? "Treino"}</span><span className="dashboard-list-when">{date}</span><span className="dashboard-list-detail">{item.observacao_treinador ?? training?.descricao ?? "Sem observação"}</span></li>; })}</ul> : <p className="dashboard-empty-state">Nenhum treino agendado.</p>}</Card></section></div>;
}
