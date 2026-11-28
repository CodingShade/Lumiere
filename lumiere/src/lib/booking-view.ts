import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingListItem } from "@/components/agendamentos/BookingManager";
import type { Booking } from "@/types/database";

export async function hydrateBookings(
  supabase: SupabaseClient,
  bookings: Booking[],
): Promise<BookingListItem[]> {
  if (bookings.length === 0) return [];

  const serviceIds = [...new Set(bookings.map((booking) => booking.service_id))];
  const locationIds = [...new Set(bookings.map((booking) => booking.location_id))];
  const photographerIds = [...new Set(bookings.map((booking) => booking.photographer_id))];
  const clientIds = [...new Set(bookings.map((booking) => booking.client_id))];

  const [servicesResult, locationsResult, photographerResult, clientResult] = await Promise.all([
    supabase.from("services").select("id,nome,duracao_min,preco").in("id", serviceIds),
    supabase.from("locations").select("id,nome,tipo,endereco").in("id", locationIds),
    supabase.from("photographers").select("profile_id").in("profile_id", photographerIds),
    supabase.from("profiles").select("id,nome,telefone").in("id", [...new Set([...photographerIds, ...clientIds])]),
  ]);

  const profileMap = new Map((clientResult.data ?? []).map((profile) => [profile.id, profile]));
  const photographerSet = new Set((photographerResult.data ?? []).map((photographer) => photographer.profile_id));
  const serviceMap = new Map((servicesResult.data ?? []).map((service) => [service.id, service]));
  const locationMap = new Map((locationsResult.data ?? []).map((location) => [location.id, location]));

  return bookings.map((booking) => ({
    ...booking,
    services: serviceMap.get(booking.service_id) ? {
      nome: serviceMap.get(booking.service_id)!.nome,
      duracao_min: serviceMap.get(booking.service_id)!.duracao_min,
      preco: serviceMap.get(booking.service_id)!.preco,
    } : null,
    locations: locationMap.get(booking.location_id) ? {
      nome: locationMap.get(booking.location_id)!.nome,
      tipo: locationMap.get(booking.location_id)!.tipo,
      endereco: locationMap.get(booking.location_id)!.endereco,
    } : null,
    photographer: photographerSet.has(booking.photographer_id)
      ? { profiles: profileMap.get(booking.photographer_id) ?? null }
      : null,
    client: profileMap.get(booking.client_id) ?? null,
  }));
}
