"use server";

import { redirect } from "next/navigation";

import { signUpTrainer } from "@/lib/services/auth.service";
import { trainerSignupSchema } from "@/lib/validators/auth";

export type SignupActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"nome" | "assessoria" | "email" | "senha", string[]>>;
};

export const initialSignupActionState: SignupActionState = {};

export async function signUpTrainerAction(
  _previousState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const parsedInput = trainerSignupSchema.safeParse({
    nome: formData.get("nome"),
    assessoria: formData.get("assessoria"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsedInput.success) {
    return { fieldErrors: parsedInput.error.flatten().fieldErrors };
  }

  const result = await signUpTrainer(parsedInput.data);

  if ("error" in result) {
    return { error: result.error };
  }

  redirect(`/confirmar-email?email=${encodeURIComponent(result.data.email)}`);
}
