"use server";

import { redirect } from "next/navigation";

import { destinationForPapel, requireUser } from "@/lib/auth/session";
import { genericSignInError, signIn } from "@/lib/services/auth.service";
import { signInSchema } from "@/lib/validators/auth";

export type LoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "senha", string[]>>;
};

export const initialLoginActionState: LoginActionState = {};

export async function signInAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  try {
    const parsedInput = signInSchema.safeParse({
      email: formData.get("email"),
      senha: formData.get("senha"),
    });

    if (!parsedInput.success) {
      return { fieldErrors: parsedInput.error.flatten().fieldErrors };
    }

    const result = await signIn(parsedInput.data);

    if ("error" in result) {
      return { error: result.error };
    }
  } catch {
    return { error: genericSignInError };
  }

  // The session cookie is already set by signInWithPassword, so the
  // destination is decided by the persisted profile, never by the form.
  const user = await requireUser();
  redirect(destinationForPapel(user.papel));
}
