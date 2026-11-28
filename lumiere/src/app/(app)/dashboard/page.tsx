import Link from "next/link";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { role, profile } = await getCurrentUser();
  let upcoming = 0;
  let pending = 0;
  if (getSupabaseEnv()) {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const [upcomingResult, pendingResult] = await Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }).neq("status", "cancelado").gte("starts_at", now),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    ]);
    upcoming = upcomingResult.count ?? 0;
    pending = pendingResult.count ?? 0;
  }
  return (
    <PagePlaceholder titulo={`Olá, ${profile?.nome ?? "bem-vindo"}`} descricao="Acompanhe seus ensaios e encontre o momento perfeito para uma nova sessão.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Summary label="Agendamentos futuros" value={upcoming} />
        {role === "admin" && <Summary label="Solicitações pendentes" value={pending} />}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {role === "cliente" && <Link href="/agendamentos/novo"><Button type="button">Agendar ensaio</Button></Link>}
        <Link href="/agendamentos"><Button type="button" variant="secondary">Ver agendamentos</Button></Link>
        {(role === "fotografo" || role === "admin") && <Link href="/fotografo/agenda"><Button type="button" variant="secondary">Abrir agenda</Button></Link>}
      </div>
    </PagePlaceholder>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-2 font-serif text-4xl text-stone-900">{value}</p>
    </div>
  );
}
