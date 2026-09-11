import { redirect } from "next/navigation";

export const metadata = { title: "Meu painel — FLERNK" };

export default function AthleteTrainingsPage() {
  redirect("/atleta");
}
