"use client";

import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTrainingAction } from "@/lib/actions/training.actions";
import { initialTrainingActionState, type TrainingActionState } from "@/lib/actions/training.state";
import type { TrainingTypeCatalogItem } from "@/lib/services/training-template.service";
import type { TrainingBlockInput } from "@/lib/validators/training-template";

const blockTypes: Array<{ value: TrainingBlockInput["tipo"]; label: string }> = [
  { value: "aquecimento", label: "Aquecimento" }, { value: "principal", label: "Principal" },
  { value: "recuperacao", label: "Recuperação" }, { value: "desaquecimento", label: "Desaquecimento" },
  { value: "tecnica", label: "Técnica" }, { value: "forca", label: "Força" },
];
const steps = ["Identificação", "Estrutura", "Revisão"];

function newBlock(position: number): TrainingBlockInput { return { tipo: "principal", titulo: `Bloco ${position}`, duracaoMinutos: 10 }; }
function FieldError({ errors }: { errors?: string[] }) { return errors?.[0] ? <p className="field-error" role="alert">{errors[0]}</p> : null; }

export function TrainingForm({ trainingTypes, initialState = initialTrainingActionState }: { trainingTypes: TrainingTypeCatalogItem[]; initialState?: TrainingActionState }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createTrainingAction, initialState);
  const [step, setStep] = useState(0);
  const [blocks, setBlocks] = useState<TrainingBlockInput[]>([newBlock(1)]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const selectedType = useMemo(() => trainingTypes.find((type) => type.id === selectedTypeId) ?? null, [selectedTypeId, trainingTypes]);
  const reviewErrors = Object.values(state.fieldErrors ?? {}).flatMap((errors) => errors ?? []);

  useEffect(() => {
    if (state.success) {
      router.push("/treinador/treinos");
    }
  }, [router, state.success]);
  function updateBlock(index: number, changes: Partial<TrainingBlockInput>) { setBlocks((current) => current.map((block, itemIndex) => itemIndex === index ? { ...block, ...changes } : block)); }
  function updateOptionalNumber(index: number, field: "duracaoMinutos" | "distanciaMetros" | "repeticoes" | "recuperacaoSegundos" | "rpe", value: string) { updateBlock(index, { [field]: value === "" ? undefined : Number(value) }); }

  return <form className="training-form training-wizard" action={formAction} noValidate>
    <input type="hidden" name="titulo" value={title} />
    <input type="hidden" name="tipoTreinoId" value={selectedTypeId} />
    <input type="hidden" name="descricao" value={description} />
    <input type="hidden" name="blocos" value={JSON.stringify(blocks)} />
    <ol className="training-wizard-steps" aria-label="Etapas de criação do treino">{steps.map((label, index) => <li key={label} className={index === step ? "is-current" : index < step ? "is-complete" : ""}><span>{index < step ? <Check aria-hidden="true" /> : index + 1}</span>{label}</li>)}</ol>
    {step === 0 ? <section className="training-wizard-panel" aria-labelledby="training-step-title"><div><p className="eyebrow">Etapa 1 de 3</p><h2 id="training-step-title">Identifique o treino</h2><p className="field-hint">Escolha um nome claro e, quando fizer sentido, um tipo da biblioteca.</p></div><div className="training-form-grid"><div className="form-field"><label htmlFor="titulo">Título</label><Input id="titulo" value={title} maxLength={160} required onChange={(event) => setTitle(event.target.value)} aria-invalid={Boolean(state.fieldErrors?.titulo) || undefined} aria-describedby={state.fieldErrors?.titulo ? "titulo-error" : undefined} /><div id="titulo-error"><FieldError errors={state.fieldErrors?.titulo} /></div></div><div className="form-field"><label htmlFor="tipoTreinoId">Tipo de treino</label><select id="tipoTreinoId" className="input" value={selectedTypeId} onChange={(event) => setSelectedTypeId(event.target.value)} aria-describedby={selectedType ? "tipo-treino-hint" : undefined}><option value="">Sem tipo definido</option>{trainingTypes.map((type) => <option key={type.id} value={type.id}>{type.nome}</option>)}</select>{selectedType ? <p className="field-hint" id="tipo-treino-hint">{selectedType.objetivo}</p> : null}<FieldError errors={state.fieldErrors?.tipoTreinoId} /></div></div><div className="form-field"><label htmlFor="descricao">Descrição</label><textarea id="descricao" className="input" rows={4} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /><FieldError errors={state.fieldErrors?.descricao} /></div></section> : null}
    {step === 1 ? <section className="training-wizard-panel" aria-labelledby="blocks-title"><div><p className="eyebrow">Etapa 2 de 3</p><h2 id="blocks-title">Monte os blocos</h2><p className="field-hint">Cada bloco precisa de duração, distância ou repetições.</p></div><fieldset className="training-blocks">{blocks.map((block, index) => <section className="training-block" key={index} aria-label={`Bloco ${index + 1}`}><div className="training-block-heading"><h3>Bloco {index + 1}</h3>{blocks.length > 1 ? <Button type="button" variant="ghost" aria-label={`Remover bloco ${index + 1}`} title="Remover bloco" onClick={() => setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden="true" /></Button> : null}</div><div className="training-block-grid"><div className="form-field"><label htmlFor={`tipo-${index}`}>Fase</label><select id={`tipo-${index}`} className="input" value={block.tipo} onChange={(event) => updateBlock(index, { tipo: event.target.value as TrainingBlockInput["tipo"] })}>{blockTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div><div className="form-field"><label htmlFor={`titulo-${index}`}>Título do bloco</label><Input id={`titulo-${index}`} value={block.titulo} maxLength={120} onChange={(event) => updateBlock(index, { titulo: event.target.value })} /></div><div className="form-field"><label htmlFor={`duracao-${index}`}>Duração (min)</label><Input id={`duracao-${index}`} type="number" min="1" max="600" value={block.duracaoMinutos ?? ""} onChange={(event) => updateOptionalNumber(index, "duracaoMinutos", event.target.value)} /></div><div className="form-field"><label htmlFor={`distancia-${index}`}>Distância (m)</label><Input id={`distancia-${index}`} type="number" min="1" max="100000" value={block.distanciaMetros ?? ""} onChange={(event) => updateOptionalNumber(index, "distanciaMetros", event.target.value)} /></div><div className="form-field"><label htmlFor={`repeticoes-${index}`}>Repetições</label><Input id={`repeticoes-${index}`} type="number" min="1" max="100" value={block.repeticoes ?? ""} onChange={(event) => updateOptionalNumber(index, "repeticoes", event.target.value)} /></div><div className="form-field"><label htmlFor={`recuperacao-${index}`}>Recuperação (s)</label><Input id={`recuperacao-${index}`} type="number" min="0" max="3600" value={block.recuperacaoSegundos ?? ""} onChange={(event) => updateOptionalNumber(index, "recuperacaoSegundos", event.target.value)} /></div><div className="form-field"><label htmlFor={`rpe-${index}`}>RPE</label><Input id={`rpe-${index}`} type="number" min="1" max="10" value={block.rpe ?? ""} onChange={(event) => updateOptionalNumber(index, "rpe", event.target.value)} /></div><div className="form-field training-block-notes"><label htmlFor={`instrucoes-${index}`}>Instruções</label><Input id={`instrucoes-${index}`} maxLength={1200} value={block.instrucoes ?? ""} onChange={(event) => updateBlock(index, { instrucoes: event.target.value || undefined })} /></div></div></section>)}{blocks.length < 8 ? <Button type="button" variant="secondary" className="training-add-block" onClick={() => setBlocks((current) => [...current, newBlock(current.length + 1)])}><Plus aria-hidden="true" />Adicionar bloco</Button> : null}</fieldset><FieldError errors={state.fieldErrors?.blocos} /></section> : null}
    {step === 2 ? <section className="training-wizard-panel" aria-labelledby="review-title"><div><p className="eyebrow">Etapa 3 de 3</p><h2 id="review-title">Revise antes de criar</h2><p className="field-hint">Você ainda poderá atribuir o treino aos atletas depois de criá-lo.</p></div><dl className="training-review"><div><dt>Tipo</dt><dd>{selectedType?.nome ?? "Sem tipo definido"}</dd></div><div><dt>Blocos</dt><dd>{blocks.length} {blocks.length === 1 ? "bloco" : "blocos"}</dd></div><div><dt>Estrutura</dt><dd>{blocks.map((block) => block.titulo.trim() || "Bloco sem título").join(" · ")}</dd></div></dl>{reviewErrors.map((error) => <p className="form-error" role="alert" key={error}>{error}</p>)}{state.error ? <p className="form-error" role="alert">{state.error}</p> : null}</section> : null}
    <div className="training-wizard-actions"><Button type="button" variant="ghost" className={step === 0 ? "is-hidden" : ""} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft aria-hidden="true" />Voltar</Button>{step < steps.length - 1 ? <Button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Continuar<ArrowRight aria-hidden="true" /></Button> : <Button type="submit" disabled={isPending}>{isPending ? "Criando..." : "Criar treino"}<Check aria-hidden="true" /></Button>}</div>
  </form>;
}
