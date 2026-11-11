import { BookingForm } from "@/components/forms/BookingForm";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function NovoAgendamentoPage() {
  if (!getSupabaseEnv()) {
    return (
      <PagePlaceholder titulo="Agende seu ensaio" descricao="Escolha o serviço, o fotógrafo, o local e o melhor horário para você.">
        <BookingForm services={[]} photographers={[]} locations={[]} loadError="Configure as variáveis do Supabase para carregar as opções de agendamento." />
      </PagePlaceholder>
    );
  }

  const supabase = await createClient();
  const [servicesResult, photographersResult, locationsResult] = await Promise.all([
    supabase.from("services").select("id, nome, duracao_min, preco").eq("ativo", true).order("nome"),
    supabase.from("photographers").select("profile_id, especialidade").eq("ativo", true).order("especialidade"),
    supabase.from("locations").select("id, nome, tipo, endereco").eq("ativo", true).order("nome"),
  ]);
  const loadError = servicesResult.error || photographersResult.error || locationsResult.error
    ? "Não foi possível carregar as opções de agendamento. Tente novamente."
    : undefined;

  return (
    <PagePlaceholder titulo="Agende seu ensaio" descricao="Escolha o serviço, o fotógrafo, o local e o melhor horário para você.">
      <BookingForm
        services={servicesResult.data ?? []}
        photographers={photographersResult.data ?? []}
        locations={locationsResult.data ?? []}
        loadError={loadError}
      />
    </PagePlaceholder>
  );
}
