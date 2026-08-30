import { createClient } from "@supabase/supabase-js";

const confirmation = "seed-demo";
const slug = "flernk-demo";
const password = process.env.FLERNK_DEMO_PASSWORD;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (process.env.FLERNK_DEMO_SEED_CONFIRM !== confirmation) {
  throw new Error("Defina FLERNK_DEMO_SEED_CONFIRM=seed-demo para executar esta carga.");
}

if (!url || !serviceRoleKey || !password || password.length < 12) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e FLERNK_DEMO_PASSWORD (12+ caracteres) são obrigatórios.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  { key: "trainer", email: "demo.treinador@flernk.app", name: "Matheus Demo", role: "treinador" },
  { key: "ana", email: "demo.ana@flernk.app", name: "Ana Costa", role: "atleta" },
  { key: "bruno", email: "demo.bruno@flernk.app", name: "Bruno Lima", role: "atleta" },
  { key: "carla", email: "demo.carla@flernk.app", name: "Carla Souza", role: "atleta" },
  { key: "diego", email: "demo.diego@flernk.app", name: "Diego Alves", role: "atleta" },
  { key: "elisa", email: "demo.elisa@flernk.app", name: "Elisa Martins", role: "atleta" },
];

async function findOrCreateUser(account) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  const existing = listed.users.find((user) => user.email === account.email);
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: { nome: account.name },
  });
  if (error || !data.user) throw error ?? new Error("Não foi possível criar usuário demo.");
  return data.user;
}

const users = Object.fromEntries(await Promise.all(accounts.map(async (account) => [account.key, await findOrCreateUser(account)])));

const { data: existingTenant, error: tenantLookupError } = await supabase
  .from("assessorias")
  .select("id")
  .eq("slug", slug)
  .maybeSingle();
if (tenantLookupError) throw tenantLookupError;

const tenant = existingTenant ?? (await supabase
  .from("assessorias")
  .insert({ nome: "FLERNK Demonstração", slug, cor_primaria: "#e2ff00", cor_secundaria: "#111417" })
  .select("id")
  .single()).data;
if (!tenant) throw new Error("Não foi possível criar a assessoria demo.");

const profiles = accounts.map((account) => ({
  id: users[account.key].id,
  assessoria_id: tenant.id,
  nome: account.name,
  papel: account.role,
}));
const { error: profileError } = await supabase.from("profiles").upsert(profiles, { onConflict: "id" });
if (profileError) throw profileError;

const trainerId = users.trainer.id;
const athleteIds = accounts.filter((account) => account.role === "atleta").map((account) => users[account.key].id);
const { error: trainerError } = await supabase.from("treinadores").upsert({ id: trainerId, assessoria_id: tenant.id }, { onConflict: "id" });
if (trainerError) throw trainerError;
const { error: athleteError } = await supabase.from("atletas").upsert(athleteIds.map((id) => ({ id, assessoria_id: tenant.id, treinador_id: trainerId })), { onConflict: "id" });
if (athleteError) throw athleteError;

const { data: oldAssignments, error: oldAssignmentsError } = await supabase.from("treinos_atletas").select("id").eq("assessoria_id", tenant.id);
if (oldAssignmentsError) throw oldAssignmentsError;
if (oldAssignments?.length) {
  const { error } = await supabase.from("treinos_atletas").delete().eq("assessoria_id", tenant.id);
  if (error) throw error;
}
const { error: oldTrainingError } = await supabase.from("treinos").delete().eq("assessoria_id", tenant.id);
if (oldTrainingError) throw oldTrainingError;

const now = new Date();
const at = (offsetDays, hour) => new Date(now.getTime() + (offsetDays * 86400000) + (hour * 3600000)).toISOString();
const trainingSeeds = [
  {
    titulo: "Intervalado 6x400m",
    descricao: "Aquecimento, seis tiros de 400 m e desaquecimento.",
    offset: 0,
    blocos: [
      { tipo: "aquecimento", titulo: "Aquecimento leve", duracaoMinutos: 12, rpe: 3 },
      { tipo: "principal", titulo: "6 tiros de 400 m", distanciaMetros: 400, repeticoes: 6, recuperacaoSegundos: 90, ritmoAlvo: "4:30-4:45 min/km", rpe: 8 },
      { tipo: "desaquecimento", titulo: "Desaquecimento", duracaoMinutos: 10, rpe: 3 },
    ],
  },
  {
    titulo: "Rodagem regenerativa",
    descricao: "Ritmo confortável, priorizando recuperação.",
    offset: 2,
    blocos: [
      { tipo: "principal", titulo: "Corrida leve", duracaoMinutos: 40, distanciaMetros: 6000, ritmoAlvo: "Confortável", rpe: 3 },
    ],
  },
  {
    titulo: "Longão progressivo",
    descricao: "Construir o ritmo gradualmente até o final.",
    offset: 4,
    blocos: [
      { tipo: "principal", titulo: "Longão", distanciaMetros: 14000, ritmoAlvo: "5:45-5:15 min/km", rpe: 6 },
      { tipo: "recuperacao", titulo: "Hidratação", duracaoMinutos: 5, instrucoes: "Hidrate-se no quilômetro 8." },
    ],
  },
  {
    titulo: "Tempo run",
    descricao: "Bloco contínuo em ritmo sustentável.",
    offset: -2,
    blocos: [
      { tipo: "aquecimento", titulo: "Aquecimento", duracaoMinutos: 10, rpe: 3 },
      { tipo: "principal", titulo: "Ritmo sustentado", duracaoMinutos: 30, distanciaMetros: 6000, ritmoAlvo: "4:55-5:05 min/km", rpe: 7 },
      { tipo: "desaquecimento", titulo: "Desaquecimento", duracaoMinutos: 8, rpe: 3 },
    ],
  },
];
const { data: trainings, error: trainingError } = await supabase.from("treinos").insert(trainingSeeds.map((training) => ({
  assessoria_id: tenant.id, treinador_id: trainerId, titulo: training.titulo, descricao: training.descricao,
  origem: "manual", estrutura: { blocos: training.blocos },
}))).select("id, titulo");
if (trainingError || !trainings) throw trainingError ?? new Error("Não foi possível criar treinos demo.");

const assignments = athleteIds.map((athleteId, index) => {
  const status = index === 3 ? "concluido" : index === 4 ? "em_andamento" : "atribuido";
  const scheduledAt = index === 3
    ? at(-2, 10)
    : index === 4
      ? at(-1, 11)
      : at(trainingSeeds[index % trainingSeeds.length].offset, 7 + index);

  return {
    assessoria_id: tenant.id,
    treino_id: trainings[index % trainings.length].id,
    atleta_id: athleteId,
    status,
    atribuido_em: at(-3, 9),
    agendado_para: scheduledAt,
    timezone: "America/Sao_Paulo",
    iniciado_em: status === "atribuido" ? null : scheduledAt,
    concluido_em: status === "concluido" ? at(-1, 8) : null,
    observacao_treinador: "Carga de demonstração. Ajuste conforme a resposta do atleta.",
  };
});
const { data: createdAssignments, error: assignmentError } = await supabase
  .from("treinos_atletas")
  .insert(assignments)
  .select("id, atleta_id, status");
if (assignmentError || !createdAssignments) throw assignmentError ?? new Error("Não foi possível criar atribuições demo.");

const completedAssignment = createdAssignments.find((assignment) => assignment.status === "concluido");
if (completedAssignment) {
  const { error: executionError } = await supabase.from("execucoes_treino").insert({
    assessoria_id: tenant.id,
    treino_atleta_id: completedAssignment.id,
    atleta_id: completedAssignment.atleta_id,
    status: "concluido",
    rpe: 6,
    duracao_real_minutos: 48,
    distancia_real_metros: 8200,
    observacao_atleta: "Treino de demonstração concluído com boa percepção.",
    registrado_em: at(-1, 8),
  });
  if (executionError) throw executionError;
}

console.log(`Base demo pronta: ${slug}. Contas: ${accounts.map((account) => account.email).join(", ")}`);
