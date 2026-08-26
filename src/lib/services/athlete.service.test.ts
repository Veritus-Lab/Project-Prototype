import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient,
}));

import {
  getTrainerAthleteDetail,
  listTrainerAthletes,
  updateTrainerAthleteOperationalProfile,
} from "./athlete.service";
import type { SessionUser } from "@/lib/auth/session";

const trainerUser = {
  id: "trainer-1",
  email: "treinador@example.com",
  nome: "Treinador",
  papel: "treinador",
  assessoriaId: "assessoria-1",
} satisfies SessionUser;

function listAthletesQuery() {
  const order = vi.fn().mockResolvedValue({
    data: [
      {
        id: "athlete-1",
        treinador_id: "trainer-1",
        created_at: "2026-08-25T10:00:00.000Z",
        profiles: {
          nome: "Bia Corredora",
          created_at: "2026-08-24T10:00:00.000Z",
        },
      },
      {
        id: "athlete-2",
        treinador_id: null,
        created_at: "2026-08-23T10:00:00.000Z",
        profiles: {
          nome: "Caio Pace",
          created_at: "2026-08-23T10:00:00.000Z",
        },
      },
    ],
    error: null,
  });
  const trainerEq = vi.fn().mockReturnValue({ order });
  const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
  const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

  return {
    assessoriaEq,
    order,
    select,
    trainerEq,
  };
}

describe("athlete service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists athletes for the current trainer and assessment only", async () => {
    const athletes = listAthletesQuery();
    const from = vi.fn((table: string) => {
      if (table === "atletas") {
        return athletes;
      }

      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({ from });

    await expect(listTrainerAthletes(trainerUser)).resolves.toEqual({
      data: [
        {
          id: "athlete-1",
          nome: "Bia Corredora",
          vinculo: "Vinculado a você",
          criadoEm: "25/08/2026",
        },
        {
          id: "athlete-2",
          nome: "Caio Pace",
          vinculo: "Sem treinador definido",
          criadoEm: "23/08/2026",
        },
      ],
    });

    expect(athletes.select).toHaveBeenCalledWith(
      "id, treinador_id, created_at, profiles!atletas_profile_fkey(nome, created_at)",
    );
    expect(athletes.assessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(athletes.trainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(athletes.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("returns a public error when Supabase cannot load athletes", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "database unavailable" },
    });
    const trainerEq = vi.fn().mockReturnValue({ order });
    const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
    const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

    mocks.createServerClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    await expect(listTrainerAthletes(trainerUser)).resolves.toEqual({
      error: "Não foi possível carregar os atletas agora.",
    });
  });

  it("loads a trainer athlete detail scoped by assessment, trainer and athlete id", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: "athlete-1",
        treinador_id: "trainer-1",
        created_at: "2026-08-25T10:00:00.000Z",
        profiles: {
          nome: "Bia Corredora",
          created_at: "2026-08-24T10:00:00.000Z",
        },
        treinos_atletas: [
          {
            id: "assignment-1",
            status: "atribuido",
            atribuido_em: "2026-08-26T10:00:00.000Z",
            treinos: {
              titulo: "Longão leve",
              descricao: "Zona 2 com final confortável",
              origem: "manual",
            },
          },
        ],
      },
      error: null,
    });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const order = vi.fn().mockReturnValue({ limit });
    const athleteEq = vi.fn().mockReturnValue({ order });
    const trainerEq = vi.fn().mockReturnValue({ eq: athleteEq });
    const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
    const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

    const operationalMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        telefone: "+55 11 99999-0000",
        observacoes_internas: "Prefere treinos pela manhã.",
        objetivo: "Completar 10 km",
        nivel: "iniciante",
        data_nascimento: "1990-02-03",
        contato_emergencia_nome: "Maria",
        contato_emergencia_telefone: "+55 11 98888-0000",
        updated_at: "2026-08-26T09:00:00.000Z",
      },
      error: null,
    });
    const operationalAthleteEq = vi.fn().mockReturnValue({
      maybeSingle: operationalMaybeSingle,
    });
    const operationalAssessoriaEq = vi.fn().mockReturnValue({
      eq: operationalAthleteEq,
    });
    const operationalSelect = vi.fn().mockReturnValue({
      eq: operationalAssessoriaEq,
    });
    const from = vi.fn((table: string) => {
      if (table === "atletas") {
        return { select };
      }

      if (table === "atletas_operacionais") {
        return { select: operationalSelect };
      }

      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({
      from,
    });

    await expect(
      getTrainerAthleteDetail(trainerUser, "athlete-1"),
    ).resolves.toEqual({
      data: {
        id: "athlete-1",
        nome: "Bia Corredora",
        vinculo: "Vinculado a você",
        criadoEm: "25/08/2026",
        perfilOperacional: {
          telefone: "+55 11 99999-0000",
          observacoesInternas: "Prefere treinos pela manhã.",
          objetivo: "Completar 10 km",
          nivel: "iniciante",
          dataNascimento: "1990-02-03",
          contatoEmergenciaNome: "Maria",
          contatoEmergenciaTelefone: "+55 11 98888-0000",
          atualizadoEm: "26/08/2026",
        },
        treinosRecentes: [
          {
            id: "assignment-1",
            titulo: "Longão leve",
            quando: "Atribuído em 26/08/2026",
            detalhe: "Zona 2 com final confortável",
            status: "Atribuído",
          },
        ],
      },
    });

    expect(select).toHaveBeenCalledWith(
      "id, treinador_id, created_at, profiles!atletas_profile_fkey(nome, created_at), treinos_atletas(id, status, atribuido_em, treinos(titulo, descricao, origem))",
    );
    expect(assessoriaEq).toHaveBeenCalledWith("assessoria_id", "assessoria-1");
    expect(trainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(athleteEq).toHaveBeenCalledWith("id", "athlete-1");
    expect(order).toHaveBeenCalledWith("atribuido_em", {
      ascending: false,
      foreignTable: "treinos_atletas",
    });
    expect(limit).toHaveBeenCalledWith(3, {
      foreignTable: "treinos_atletas",
    });
    expect(operationalAssessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(operationalAthleteEq).toHaveBeenCalledWith("atleta_id", "athlete-1");
  });

  it("returns the same generic error when athlete detail is missing or denied", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const limit = vi.fn().mockReturnValue({ maybeSingle });
    const order = vi.fn().mockReturnValue({ limit });
    const athleteEq = vi.fn().mockReturnValue({ order });
    const trainerEq = vi.fn().mockReturnValue({ eq: athleteEq });
    const assessoriaEq = vi.fn().mockReturnValue({ eq: trainerEq });
    const select = vi.fn().mockReturnValue({ eq: assessoriaEq });

    mocks.createServerClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    await expect(
      getTrainerAthleteDetail(trainerUser, "athlete-from-another-tenant"),
    ).resolves.toEqual({
      error: "Atleta não encontrado.",
    });
  });

  it("upserts operational data only after confirming trainer access to the athlete", async () => {
    const verifyMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: "athlete-1" },
      error: null,
    });
    const verifyAthleteEq = vi.fn().mockReturnValue({ maybeSingle: verifyMaybeSingle });
    const verifyTrainerEq = vi.fn().mockReturnValue({ eq: verifyAthleteEq });
    const verifyAssessoriaEq = vi.fn().mockReturnValue({ eq: verifyTrainerEq });
    const verifySelect = vi.fn().mockReturnValue({ eq: verifyAssessoriaEq });

    const upsertSingle = vi.fn().mockResolvedValue({
      data: {
        telefone: "+55 11 99999-0000",
        observacoes_internas: null,
        objetivo: "Completar 10 km",
        nivel: "iniciante",
        data_nascimento: null,
        contato_emergencia_nome: null,
        contato_emergencia_telefone: null,
        updated_at: "2026-08-26T09:00:00.000Z",
      },
      error: null,
    });
    const upsertSelectChain = vi.fn().mockReturnValue({ single: upsertSingle });
    const upsert = vi.fn().mockReturnValue({ select: upsertSelectChain });
    const from = vi.fn((table: string) => {
      if (table === "atletas") {
        return { select: verifySelect };
      }

      if (table === "atletas_operacionais") {
        return { upsert };
      }

      throw new Error(`unexpected table ${table}`);
    });

    mocks.createServerClient.mockResolvedValue({ from });

    await expect(
      updateTrainerAthleteOperationalProfile(trainerUser, "athlete-1", {
        telefone: "+55 11 99999-0000",
        observacoesInternas: null,
        objetivo: "Completar 10 km",
        nivel: "iniciante",
        dataNascimento: null,
        contatoEmergenciaNome: null,
        contatoEmergenciaTelefone: null,
      }),
    ).resolves.toEqual({
      data: {
        telefone: "+55 11 99999-0000",
        observacoesInternas: null,
        objetivo: "Completar 10 km",
        nivel: "iniciante",
        dataNascimento: null,
        contatoEmergenciaNome: null,
        contatoEmergenciaTelefone: null,
        atualizadoEm: "26/08/2026",
      },
    });

    expect(verifyAssessoriaEq).toHaveBeenCalledWith(
      "assessoria_id",
      "assessoria-1",
    );
    expect(verifyTrainerEq).toHaveBeenCalledWith("treinador_id", "trainer-1");
    expect(verifyAthleteEq).toHaveBeenCalledWith("id", "athlete-1");
    expect(upsert).toHaveBeenCalledWith(
      {
        assessoria_id: "assessoria-1",
        atleta_id: "athlete-1",
        telefone: "+55 11 99999-0000",
        observacoes_internas: null,
        objetivo: "Completar 10 km",
        nivel: "iniciante",
        data_nascimento: null,
        contato_emergencia_nome: null,
        contato_emergencia_telefone: null,
      },
      { onConflict: "atleta_id" },
    );
  });
});
