"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; success?: string };

const credentialsSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

function formValues(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getSupabaseEnv()) return { error: "O serviço de autenticação ainda não foi configurado." };
  const values = credentialsSchema.safeParse(formValues(formData));
  if (!values.success) return { error: values.error.issues[0]?.message ?? "Confira os dados informados." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(values.data);
  if (error) return { error: "E-mail ou senha inválidos." };
  redirect("/dashboard");
}

const signUpSchema = credentialsSchema.extend({
  nome: z.string().trim().min(2, "Informe seu nome."),
});

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!getSupabaseEnv()) return { error: "O serviço de autenticação ainda não foi configurado." };
  const values = signUpSchema.safeParse({
    ...formValues(formData),
    nome: String(formData.get("nome") ?? "").trim(),
  });
  if (!values.success) return { error: values.error.issues[0]?.message ?? "Confira os dados informados." };

  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const { data, error } = await supabase.auth.signUp({
    email: values.data.email,
    password: values.data.password,
    options: {
      data: { nome: values.data.nome },
      ...(origin ? { emailRedirectTo: new URL("/auth/callback", origin).toString() } : {}),
    },
  });
  if (error) return { error: "Não foi possível criar a conta. Confira os dados e tente novamente." };
  if (!data.session) {
    return { success: "Cadastro realizado. Confira seu e-mail para confirmar a conta." };
  }
  redirect("/dashboard");
}

export async function signOut() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Não foi possível encerrar a sessão: ${error.message}`);
  redirect("/login");
}
