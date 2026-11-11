import { PhotographerManager } from "@/components/admin/PhotographerManager";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminFotografosPage() {
  if (!getSupabaseEnv()) {
    return (
      <PagePlaceholder titulo="Fotógrafos" descricao="Gerencie os perfis e portfólios da equipe de fotografia.">
        <PhotographerManager
          photographers={[]}
          availableProfiles={[]}
          loadError="Configure as variáveis do Supabase para carregar e gerenciar fotógrafos."
        />
      </PagePlaceholder>
    );
  }

  const supabase = await createClient();
  const [photographersResult, profilesResult] = await Promise.all([
    supabase
      .from("photographers")
      .select("profile_id, especialidade, portfolio_url, ativo, created_at, profiles!photographers_profile_id_fkey(nome, telefone)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .neq("role", "admin")
      .order("nome", { ascending: true }),
  ]);
  const photographerIds = new Set((photographersResult.data ?? []).map((photographer) => photographer.profile_id));
  const availableProfiles = (profilesResult.data ?? []).filter(
    (profile) => profile.role === "cliente" && !photographerIds.has(profile.id),
  );
  const loadError = photographersResult.error || profilesResult.error
    ? "Não foi possível carregar os fotógrafos e usuários disponíveis. Tente novamente."
    : undefined;

  return (
    <PagePlaceholder titulo="Fotógrafos" descricao="Gerencie os perfis e portfólios da equipe de fotografia.">
      <PhotographerManager
        photographers={photographersResult.data ?? []}
        availableProfiles={availableProfiles}
        loadError={loadError}
      />
    </PagePlaceholder>
  );
}
