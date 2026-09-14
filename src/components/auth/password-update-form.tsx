"use client";
import { useActionState } from "react";
import { updatePasswordAction, type PasswordUpdateState } from "@/app/(auth)/redefinir-senha/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const initialState: PasswordUpdateState = {};
export function PasswordUpdateForm() { const [state, action, pending] = useActionState(updatePasswordAction, initialState); return <form action={action} className="login-form" noValidate><label htmlFor="senha">Nova senha</label><Input id="senha" name="senha" type="password" autoComplete="new-password" required aria-invalid={Boolean(state.fieldErrors?.senha) || undefined} /><p className="field-hint">Use ao menos 8 caracteres, incluindo uma letra e um número.</p>{state.fieldErrors?.senha?.[0] ? <p className="field-error" role="alert">{state.fieldErrors.senha[0]}</p> : null}{state.error ? <p className="form-error" role="alert">{state.error}</p> : null}<Button type="submit" disabled={pending}>{pending ? "Atualizando…" : "Atualizar senha"}</Button></form>; }
