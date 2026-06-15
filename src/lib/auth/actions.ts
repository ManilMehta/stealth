"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readCredentials(formData: FormData): { email: string; password: string } {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

function safeNext(formData: FormData): string {
  const next = String(formData.get("next") ?? "");
  // Only allow internal redirects.
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function login(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData));
}

export async function register(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();

  const { error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    redirect(`/register?error=${encodeURIComponent(signUpError.message)}`);
  }

  // New signups are auto-confirmed (demo trigger), so sign in immediately to
  // establish a session.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    redirect(`/login?error=${encodeURIComponent(signInError.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
