import { UserManager } from "@/components/admin/UserManager";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsuariosPage() {
  if (!getSupabaseEnv()) {
    return <PagePlaceholder titulo="Usuários" descricao="Configure o Supabase para gerenciar perfis e permissões." />;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("nome", { ascending: true });
  return (
    <PagePlaceholder titulo="Usuários" descricao="Consulte os perfis e altere as permissões das contas cadastradas.">
      {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">Não foi possível carregar os usuários.</p>}
      <UserManager users={data ?? []} />
    </PagePlaceholder>
  );
}
