"use server";

import { redirect } from "next/navigation";

import { signOut } from "@/lib/services/auth.service";

export async function signOutAction() {
  await signOut();
  redirect("/login");
}
