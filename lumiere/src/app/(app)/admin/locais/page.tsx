import { LocationManager } from "@/components/admin/LocationManager";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLocaisPage() {
  if (!getSupabaseEnv()) {
    return (
      <PagePlaceholder titulo="Locais" descricao="Gerencie estúdios e locais externos disponíveis para os ensaios.">
        <LocationManager locations={[]} loadError="Configure as variáveis do Supabase para carregar e gerenciar locais." />
      </PagePlaceholder>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("locations").select("*").order("nome", { ascending: true });

  return (
    <PagePlaceholder titulo="Locais" descricao="Gerencie estúdios e locais externos disponíveis para os ensaios.">
      <LocationManager
        locations={data ?? []}
        loadError={error ? "Não foi possível carregar os locais. Tente novamente." : undefined}
      />
    </PagePlaceholder>
  );
}
