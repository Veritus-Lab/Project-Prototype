"use server";

import { redirect } from "next/navigation";

import { genericSignupError, signUpTrainer } from "@/lib/services/auth.service";
import { trainerSignupSchema } from "@/lib/validators/auth";
import type { SignupActionState } from "./state";

export async function signUpTrainerAction(
  _previousState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  let email: string | undefined;

  try {
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

    email = result.data.email;
  } catch {
    return { error: genericSignupError };
  }

  if (!email) {
    return { error: genericSignupError };
  }

  // The redirect is intentionally outside the catch so Next.js can perform it.
  redirect(`/confirmar-email?email=${encodeURIComponent(email)}`);
}
