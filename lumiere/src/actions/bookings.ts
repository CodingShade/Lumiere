"use server";

import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { bookingRequestSchema } from "@/lib/validations/booking";
import { parseRecordId } from "@/lib/validations/form";
import type { Booking } from "@/types/database";

export type BookingActionResult =
  | { success: true; data: Booking }
  | { success: false; error: string };

export async function createBooking(formData: FormData): Promise<BookingActionResult> {
  try {
    const { user, role } = await getCurrentUser();
    if (!user || role !== "cliente") {
      return { success: false, error: "Entre com uma conta de cliente para solicitar um agendamento." };
    }

    const parsed = bookingRequestSchema.safeParse({
      photographer_id: formData.get("photographer_id"),
      service_id: formData.get("service_id"),
      location_id: formData.get("location_id"),
      starts_at: formData.get("starts_at"),
      observacoes: formData.get("observacoes") ?? "",
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do agendamento.",
      };
    }

    const supabase = await createClient();
    const [serviceResult, photographerResult, locationResult] = await Promise.all([
      supabase.from("services").select("duracao_min").eq("id", parsed.data.service_id).eq("ativo", true).maybeSingle(),
      supabase.from("photographers").select("profile_id").eq("profile_id", parsed.data.photographer_id).eq("ativo", true).maybeSingle(),
      supabase.from("locations").select("id").eq("id", parsed.data.location_id).eq("ativo", true).maybeSingle(),
    ]);

    if (serviceResult.error || photographerResult.error || locationResult.error) {
      return { success: false, error: "Não foi possível verificar as opções do agendamento. Tente novamente." };
    }
    if (!serviceResult.data) return { success: false, error: "O serviço selecionado não está disponível." };
    if (!photographerResult.data) return { success: false, error: "O fotógrafo selecionado não está disponível." };
    if (!locationResult.data) return { success: false, error: "O local selecionado não está disponível." };

    const startsAt = fromZonedTime(parsed.data.starts_at, "America/Sao_Paulo");
    const endsAt = addMinutes(startsAt, serviceResult.data.duracao_min);
    if (startsAt <= new Date()) {
      return { success: false, error: "Escolha uma data e horário futuros." };
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        client_id: user.id,
        photographer_id: parsed.data.photographer_id,
        service_id: parsed.data.service_id,
        location_id: parsed.data.location_id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "pendente",
        observacoes: parsed.data.observacoes || null,
      })
      .select("*")
      .single();

    if (error?.code === "23P01") {
      return { success: false, error: "Este horário acabou de ficar indisponível. Escolha outro horário." };
    }
    if (error) {
      return { success: false, error: "Não foi possível solicitar o agendamento. Tente novamente." };
    }

    revalidatePath("/agendamentos");
    revalidatePath("/agendamentos/novo");
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível solicitar o agendamento. Tente novamente." };
  }
}

export async function updateBooking(id: string, _formData: FormData): Promise<BookingActionResult> {
  try {
    const { role } = await getCurrentUser();
    if (role !== "admin") return { success: false, error: "Apenas administradores podem alterar o status." };
    const bookingId = parseRecordId(id);
    if (!bookingId) return { success: false, error: "Identificador de agendamento inválido." };
    const status = _formData.get("status");
    if (!["pendente", "confirmado", "cancelado", "concluido"].includes(String(status))) {
      return { success: false, error: "Selecione um status válido." };
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: status as Booking["status"] })
      .eq("id", bookingId)
      .select("*")
      .maybeSingle();
    if (error) return { success: false, error: "Não foi possível atualizar o agendamento." };
    if (!data) return { success: false, error: "Agendamento não encontrado." };
    revalidatePath("/agendamentos");
    revalidatePath(`/agendamentos/${bookingId}`);
    revalidatePath("/fotografo/agenda");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível atualizar o agendamento." };
  }
}

export async function deleteBooking(id: string): Promise<BookingActionResult> {
  try {
    const { user, role } = await getCurrentUser();
    if (!user) return { success: false, error: "Entre para cancelar um agendamento." };
    const bookingId = parseRecordId(id);
    if (!bookingId) return { success: false, error: "Identificador de agendamento inválido." };
    const supabase = await createClient();
    const { data: booking, error: readError } = await supabase
      .from("bookings")
      .select("id, client_id, photographer_id")
      .eq("id", bookingId)
      .maybeSingle();
    if (readError) return { success: false, error: "Não foi possível consultar o agendamento." };
    if (!booking) return { success: false, error: "Agendamento não encontrado." };
    if (role !== "admin" && booking.client_id !== user.id && booking.photographer_id !== user.id) {
      return { success: false, error: "Você não pode cancelar este agendamento." };
    }
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelado" })
      .eq("id", bookingId)
      .select("*")
      .maybeSingle();
    if (error) return { success: false, error: "Não foi possível cancelar o agendamento." };
    if (!data) return { success: false, error: "Agendamento não encontrado." };
    revalidatePath("/agendamentos");
    revalidatePath(`/agendamentos/${bookingId}`);
    revalidatePath("/fotografo/agenda");
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível cancelar o agendamento." };
  }
}
