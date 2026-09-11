import { StudentForm } from "@/components/dashboard/student-form";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { listStudents } from "@/lib/services/student.service";

export const metadata = { title: "Alunos — FLERNK" };

export default async function StudentsPage() {
  await requireRole("socio", "professor");
  const result = await listStudents();
  const students = ("data" in result ? result.data : []) ?? [];

  return <div className="dashboard-page">
    <p className="eyebrow">Gestão de alunos</p>
    <h1 className="dashboard-title">Alunos</h1>
    <p className="dashboard-subtitle">Cadastre e acompanhe os alunos da assessoria antes da criação do acesso individual.</p>
    <section className="dashboard-section"><Card elevated><h2>Novo aluno</h2><StudentForm /></Card></section>
    <section className="dashboard-section"><Card elevated><h2>Alunos cadastrados</h2>{"error" in result ? <p className="form-error" role="alert">{result.error}</p> : students.length ? <ul className="dashboard-list">{students.map((student) => <li key={student.id}><span className="dashboard-list-title">{student.name}</span><span className="dashboard-list-detail">{student.email ?? student.phone ?? "Sem contato informado"}</span></li>)}</ul> : <p className="dashboard-empty-state">Nenhum aluno cadastrado.</p>}</Card></section>
  </div>;
}
