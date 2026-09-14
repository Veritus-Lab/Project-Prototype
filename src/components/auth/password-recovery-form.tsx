"use client";
import { useActionState } from "react";
import { requestRecoveryAction, type RecoveryState } from "@/app/(auth)/recuperar-acesso/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const initialState: RecoveryState = {};
export function PasswordRecoveryForm() { const [state, action, pending] = useActionState(requestRecoveryAction, initialState); return <form action={action} className="login-form" noValidate><label htmlFor="email">E-mail</label><Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email) || undefined} />{state.fieldErrors?.email?.[0] ? <p className="field-error" role="alert">{state.fieldErrors.email[0]}</p> : null}{state.sent ? <p className="field-hint" role="status">Se houver uma conta com este e-mail, você receberá as instruções para redefinir a senha.</p> : null}<Button type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar instruções"}</Button></form>; }
