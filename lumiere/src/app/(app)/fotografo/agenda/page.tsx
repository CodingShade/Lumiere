import { BookingManager } from "@/components/agendamentos/BookingManager";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { hydrateBookings } from "@/lib/booking-view";
import type { Booking } from "@/types/database";

export default async function AgendaFotografoPage() {
  if (!getSupabaseEnv()) {
    return <PagePlaceholder titulo="Minha agenda" descricao="Configure o Supabase para consultar seus ensaios." />;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("starts_at", { ascending: true });
  const bookings = await hydrateBookings(supabase, (data ?? []) as Booking[]);
  return (
    <PagePlaceholder titulo="Minha agenda" descricao="Consulte os ensaios confirmados e organize sua disponibilidade.">
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Não foi possível carregar a agenda.</p>}
      <BookingManager bookings={bookings} />
    </PagePlaceholder>
  );
}
