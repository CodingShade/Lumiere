import { BookingManager } from "@/components/agendamentos/BookingManager";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { hydrateBookings } from "@/lib/booking-view";
import type { Booking } from "@/types/database";

export default async function AgendamentosPage() {
  if (!getSupabaseEnv()) {
    return <PagePlaceholder titulo="Meus agendamentos" descricao="Acompanhe seus ensaios e consulte seu histórico." />;
  }
  const supabase = await createClient();
  const { role } = await getCurrentUser();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("starts_at", { ascending: false });
  const bookings = await hydrateBookings(supabase, (data ?? []) as Booking[]);

  return (
    <PagePlaceholder titulo="Meus agendamentos" descricao="Acompanhe seus ensaios e consulte seu histórico.">
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Não foi possível carregar os agendamentos.</p>}
      <BookingManager bookings={bookings} isAdmin={role === "admin"} />
    </PagePlaceholder>
  );
}
