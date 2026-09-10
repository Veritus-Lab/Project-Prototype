import { redirect } from "next/navigation";

export const metadata = { title: "Meus treinos - FLERNK" };

export default function AthleteTrainingsPage() {
  redirect("/atleta");
}
