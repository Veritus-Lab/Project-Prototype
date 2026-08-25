// Centralized demo data for the etapa 1 dashboards. When real repositories
// arrive (Etapa 2), replace these structures with Supabase queries instead
// of scattering mock values across the pages.

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface UpcomingTraining {
  titulo: string;
  quando: string;
  detalhe: string;
}

export interface TrainerDashboardDemo {
  metrics: DashboardMetric[];
  proximosTreinos: UpcomingTraining[];
}

export interface AthleteDashboardDemo {
  metrics: DashboardMetric[];
  proximosTreinos: UpcomingTraining[];
}

export const trainerDashboardDemo: TrainerDashboardDemo = {
  metrics: [
    {
      label: "Atletas ativos",
      value: "12",
      hint: "Acompanhe a adesão da sua assessoria.",
    },
    {
      label: "Treinos nesta semana",
      value: "8",
      hint: "Treinos planejados para os atletas.",
    },
    {
      label: "Convites pendentes",
      value: "3",
      hint: "Atletas aguardando aceitar o convite.",
    },
  ],
  proximosTreinos: [
    {
      titulo: "Tiro de 400m",
      quando: "Terça, 06:30",
      detalhe: "8 x 400m com 90s de descanso",
    },
    {
      titulo: "Longão base",
      quando: "Domingo, 07:00",
      detalhe: "18km em ritmo confortável",
    },
  ],
};

export const athleteDashboardDemo: AthleteDashboardDemo = {
  metrics: [
    {
      label: "Km nesta semana",
      value: "42",
      hint: "Sua meta semanal é de 48km.",
    },
    {
      label: "Treinos concluídos",
      value: "3",
      hint: "De 5 treinos planejados.",
    },
    {
      label: "Próxima prova",
      value: "21",
      hint: "Dias para a meia maratona.",
    },
  ],
  proximosTreinos: [
    {
      titulo: "Tiro de 400m",
      quando: "Terça, 06:30",
      detalhe: "8 x 400m com 90s de descanso",
    },
    {
      titulo: "Regenerativo",
      quando: "Quinta, 07:00",
      detalhe: "6km leve para recuperação",
    },
  ],
};
