import Link from "next/link";
import { deleteBooking, updateBooking } from "@/actions/bookings";
import { BookingStatusBadge } from "@/components/agendamentos/BookingManager";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { hydrateBookings } from "@/lib/booking-view";
import type { Booking } from "@/types/database";

export default async function AgendamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getSupabaseEnv()) {
    return <PagePlaceholder titulo="Detalhes do ensaio" descricao="Configure o Supabase para consultar o agendamento." />;
  }
  const supabase = await createClient();
  const { role } = await getCurrentUser();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !booking) {
    return <PagePlaceholder titulo="Detalhes do ensaio" descricao="Agendamento não encontrado ou sem permissão de acesso." />;
  }

  const hydrated = (await hydrateBookings(supabase, [booking as Booking]))[0];
  const photographer = hydrated.photographer?.profiles ?? null;
  const client = hydrated.client;
  const service = hydrated.services;
  const location = hydrated.locations;
  async function cancelAction(): Promise<void> {
    "use server";
    await deleteBooking(id);
  }
  async function statusAction(formData: FormData): Promise<void> {
    "use server";
    await updateBooking(id, formData);
  }

  return (
    <PagePlaceholder titulo="Detalhes do ensaio" descricao="Informações completas da solicitação.">
      <article className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-3xl text-stone-900">{service?.nome ?? "Serviço"}</h2>
          <BookingStatusBadge status={booking.status} />
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Data e horário" value={formatDate(booking.starts_at)} />
          <Detail label="Fotógrafo" value={photographer?.nome ?? "Não informado"} />
          <Detail label="Local" value={location?.nome ?? "Não informado"} />
          <Detail label="Tipo de local" value={location?.tipo === "estudio" ? "Estúdio" : "Externo"} />
          <Detail label="Duração" value={service ? `${service.duracao_min} minutos` : "Não informada"} />
          <Detail label="Preço" value={service ? formatCurrency(service.preco) : "Não informado"} />
          {role === "admin" && <Detail label="Cliente" value={client?.nome ?? "Não informado"} />}
        </dl>
        {booking.observacoes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Observações</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{booking.observacoes}</p>
          </div>
        )}
        {role === "admin" && booking.status !== "cancelado" && (
          <form action={statusAction} className="grid gap-3 rounded-xl bg-stone-50 p-4 sm:flex sm:items-end">
            <label className="grid flex-1 gap-1.5 text-sm font-medium">
              Status do agendamento
              <Select name="status" defaultValue={booking.status}>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </Select>
            </label>
            <Button type="submit">Atualizar status</Button>
          </form>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          {booking.status !== "cancelado" && booking.status !== "concluido" && (
            <form action={cancelAction}>
              <Button type="submit" variant="ghost" className="text-red-700">Cancelar agendamento</Button>
            </form>
          )}
          <Link href="/agendamentos"><Button type="button" variant="secondary">Voltar</Button></Link>
        </div>
      </article>
    </PagePlaceholder>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-stone-900">{value}</dd>
    </div>
  );
}
