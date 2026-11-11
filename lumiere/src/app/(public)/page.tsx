import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const env = getSupabaseEnv();
  const services = env
    ? await (async () => {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("services")
          .select("id, nome, descricao, duracao_min, preco, fotos_entregues, ativo, created_at")
          .eq("ativo", true)
          .order("preco");
        if (error) throw new Error(`Não foi possível carregar os serviços: ${error.message}`);
        return data;
      })()
    : [];

  return (
    <main>
      <section className="relative overflow-hidden bg-[#f3e8df]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <Badge>Fotografia feita para você</Badge>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-7xl">
              Histórias bonitas merecem ser lembradas.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
              Escolha seu ensaio, encontre o melhor horário e transforme momentos em memórias para sempre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agendamentos/novo"><Button type="button">Agendar ensaio</Button></Link>
              <a href="#servicos"><Button type="button" variant="secondary">Conhecer serviços</Button></a>
            </div>
          </div>
          <div aria-hidden="true" className="flex min-h-72 items-end rounded-[2rem] bg-gradient-to-br from-[#d9b8a4] via-[#bd9278] to-[#73564b] p-8 shadow-xl sm:min-h-96">
            <div className="rounded-2xl bg-white/85 p-5 backdrop-blur">
              <p className="font-serif text-2xl text-stone-900">Um instante. Uma história.</p>
              <p className="mt-1 text-sm text-stone-600">Seu momento, do seu jeito.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a9583b]">Encontre o seu</p>
            <h2 className="mt-2 font-serif text-4xl text-stone-900">Nossos ensaios</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-stone-600">Experiências criadas para celebrar pessoas, encontros e fases especiais.</p>
        </div>
        {services.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h3 className="font-serif text-2xl text-stone-900">{service.nome}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-stone-600">{service.descricao ?? "Uma experiência fotográfica especial, pensada para você."}</p>
                <div className="mt-6 flex items-end justify-between border-t border-stone-100 pt-4">
                  <p className="text-xs text-stone-500">{service.duracao_min} min · {service.fotos_entregues} fotos</p>
                  <p className="font-semibold text-stone-900">{formatCurrency(service.preco)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
            {env ? "Em breve, novos ensaios estarão disponíveis." : "Configure o Supabase para carregar os serviços disponíveis."}
          </p>
        )}
      </section>
    </main>
  );
}
