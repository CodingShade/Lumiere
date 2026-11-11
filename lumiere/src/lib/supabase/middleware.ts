import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { isAuthSessionMissingError } from "./auth-errors";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return { response: NextResponse.next({ request }), user: null, role: null };

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && !isAuthSessionMissingError(error)) {
    throw new Error(`Não foi possível atualizar a sessão: ${error.message}`);
  }
  if (!user) return { response, user: null, role: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(`Não foi possível consultar o perfil: ${profileError.message}`);

  return { response, user, role: profile?.role ?? null };
}
