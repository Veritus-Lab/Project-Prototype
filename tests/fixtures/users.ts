export type SyntheticRole = "socio" | "professor" | "aluno" | "anonimo";

export type SyntheticUser = Readonly<{
  id: string;
  email: string | null;
  role: SyntheticRole;
  displayName: string;
}>;

export const syntheticUsers = {
  socioPrincipal: { id: "00000000-0000-4000-8000-000000000001", email: "socio1@example.invalid", role: "socio", displayName: "Sócio Teste 1" },
  socioSecundario: { id: "00000000-0000-4000-8000-000000000002", email: "socio2@example.invalid", role: "socio", displayName: "Sócio Teste 2" },
  professor: { id: "00000000-0000-4000-8000-000000000003", email: "professor@example.invalid", role: "professor", displayName: "Professor Teste" },
  alunoA: { id: "00000000-0000-4000-8000-000000000004", email: "aluno-a@example.invalid", role: "aluno", displayName: "Aluno Teste A" },
  alunoB: { id: "00000000-0000-4000-8000-000000000005", email: "aluno-b@example.invalid", role: "aluno", displayName: "Aluno Teste B" },
  anonimo: { id: "anonymous", email: null, role: "anonimo", displayName: "Visitante Teste" },
} as const satisfies Record<string, SyntheticUser>;
