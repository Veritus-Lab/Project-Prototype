import AthleteCalendarPage from "../calendario/page";

export const metadata = { title: "Meus treinos - FLERNK" };

export default function AthleteTrainingsPage() {
  return (
    <AthleteCalendarPage
      heading="Meus treinos"
      subtitle="Consulte os treinos atribuídos e registre sua execução."
    />
  );
}
