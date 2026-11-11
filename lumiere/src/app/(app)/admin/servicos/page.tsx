import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { ServiceManager } from "@/components/admin/ServiceManager";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminServicosPage() {
  if (!getSupabaseEnv()) {
    return (
      <PagePlaceholder
        titulo="Serviços"
        descricao="Cadastre e atualize os pacotes de ensaios oferecidos."
      >
        <ServiceManager
          services={[]}
          loadError="Configure as variáveis do Supabase para carregar e gerenciar serviços."
        />
      </PagePlaceholder>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("nome", { ascending: true });

  return (
    <PagePlaceholder
      titulo="Serviços"
      descricao="Cadastre e atualize os pacotes de ensaios oferecidos."
    >
      <ServiceManager
        services={data ?? []}
        loadError={error ? "Não foi possível carregar os serviços. Tente novamente." : undefined}
      />
    </PagePlaceholder>
  );
}
