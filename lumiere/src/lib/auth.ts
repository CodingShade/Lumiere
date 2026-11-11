import type { User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/database";
import { getSupabaseEnv } from "./supabase/env";
import { isAuthSessionMissingError } from "./supabase/auth-errors";
import { createClient } from "./supabase/server";

export async function getCurrentUser(): Promise<{
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
}> {
  if (!getSupabaseEnv()) return { user: null, profile: null, role: null };

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && !isAuthSessionMissingError(error)) {
    throw new Error(`Não foi possível verificar a sessão: ${error.message}`);
  }
  if (!user) return { user: null, profile: null, role: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Não foi possível consultar o perfil: ${profileError.message}`);

  return { user, profile, role: profile?.role ?? null };
}
