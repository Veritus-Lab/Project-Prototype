"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createAthleteEquipmentAction, deactivateAthleteEquipmentAction, linkAthleteEquipmentExecutionAction } from "@/lib/actions/athlete-equipment.actions";
import { initialAthleteEquipmentActionState } from "@/lib/actions/athlete-equipment.state";
import type { AthleteEquipmentData } from "@/lib/services/athlete-equipment.service";

function formatKilometers(meters: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(meters / 1000);
}

function Notice({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return <p className={error ? "form-error" : "form-success"} role={error ? "alert" : "status"}>{error ?? message}</p>;
}

export function AthleteEquipmentPanel({ data }: { data: AthleteEquipmentData }) {
  const [createState, createAction, creating] = useActionState(createAthleteEquipmentAction, initialAthleteEquipmentActionState);
  const [linkState, linkAction, linking] = useActionState(linkAthleteEquipmentExecutionAction, initialAthleteEquipmentActionState);
  const [deactivateState, deactivateAction, deactivating] = useActionState(deactivateAthleteEquipmentAction, initialAthleteEquipmentActionState);
  const activeEquipment = data.equipment.filter((equipment) => equipment.active);

  return <section className="athlete-equipment" aria-labelledby="athlete-equipment-title">
    <div className="athlete-equipment-heading"><div><p className="eyebrow">Equipamentos</p><h2 id="athlete-equipment-title">Rodagem dos seus tênis</h2></div></div>
    {data.equipment.length === 0 ? <p className="dashboard-empty-state">Cadastre o tênis que você usa para acompanhar a rodagem por treinos concluídos.</p> : <ul className="athlete-equipment-list">{data.equipment.map((equipment) => <li key={equipment.id}><Card elevated className="athlete-equipment-card"><div><h3>{equipment.name}</h3><p>{formatKilometers(equipment.mileageMeters)} km{equipment.mileageLimitMeters ? ` de ${formatKilometers(equipment.mileageLimitMeters)} km` : " registrados"}</p></div><div className="athlete-equipment-meta"><span>{equipment.active ? "Ativo" : "Desativado"}</span>{equipment.progressPercent !== null ? <span>{equipment.progressPercent}%</span> : null}</div>{equipment.alert ? <p className={`athlete-equipment-alert athlete-equipment-alert-${equipment.alert}`}>{equipment.alert === "limite_atingido" ? "Limite de rodagem atingido. Planeje a troca do equipamento." : "Rodagem acima de 80%. Acompanhe o equipamento."}</p> : null}{equipment.active ? <form action={deactivateAction}><input type="hidden" name="equipmentId" value={equipment.id} /><Button type="submit" variant="ghost" disabled={deactivating}>Desativar</Button></form> : null}</Card></li>)}</ul>}
    <Notice error={createState.error ?? deactivateState.error ?? linkState.error} message={createState.success ?? deactivateState.success ?? linkState.success} />
    <details className="athlete-equipment-details"><summary>Cadastrar tênis</summary><form action={createAction} className="athlete-equipment-form"><div className="form-field"><label htmlFor="equipment-name">Nome</label><input className="input" id="equipment-name" name="name" maxLength={100} required /></div><div className="form-field"><label htmlFor="equipment-started-on">Início de uso</label><input className="input" id="equipment-started-on" name="startedOn" type="date" /></div><div className="form-field"><label htmlFor="equipment-initial-mileage">Rodagem inicial (m)</label><input className="input" id="equipment-initial-mileage" name="initialMileageMeters" type="number" min="0" defaultValue="0" required /></div><div className="form-field"><label htmlFor="equipment-limit">Limite de rodagem (m)</label><input className="input" id="equipment-limit" name="mileageLimitMeters" type="number" min="1" /></div><Button type="submit" disabled={creating}>{creating ? "Cadastrando..." : "Cadastrar"}</Button></form></details>
    {activeEquipment.length > 0 && data.availableExecutions.length > 0 ? <details className="athlete-equipment-details"><summary>Vincular treino concluído</summary><form action={linkAction} className="athlete-equipment-form"><div className="form-field"><label htmlFor="execution-equipment">Tênis</label><select className="input" id="execution-equipment" name="equipmentId" required>{activeEquipment.map((equipment) => <option key={equipment.id} value={equipment.id}>{equipment.name}</option>)}</select></div><div className="form-field"><label htmlFor="execution-id">Execução</label><select className="input" id="execution-id" name="executionId" required>{data.availableExecutions.map((execution) => <option key={execution.id} value={execution.id}>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(execution.recordedAt))}{execution.distanceMeters ? ` · ${formatKilometers(execution.distanceMeters)} km` : " · sem distância"}</option>)}</select></div><Button type="submit" disabled={linking}>{linking ? "Vinculando..." : "Vincular execução"}</Button></form></details> : null}
  </section>;
}
