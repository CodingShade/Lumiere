"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createBooking, type BookingActionResult } from "@/actions/bookings";
import type { Location, Photographer, Service } from "@/types/database";
import {
  bookingRequestSchema,
  type BookingRequestInput,
} from "@/lib/validations/booking";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";

type Props = {
  services: Pick<Service, "id" | "nome" | "duracao_min" | "preco">[];
  photographers: Pick<Photographer, "profile_id" | "especialidade">[];
  locations: Pick<Location, "id" | "nome" | "tipo" | "endereco">[];
  loadError?: string;
};

function toFormData(values: BookingRequestInput) {
  const formData = new FormData();
  formData.set("service_id", values.service_id);
  formData.set("photographer_id", values.photographer_id);
  formData.set("location_id", values.location_id);
  formData.set("starts_at", values.starts_at);
  formData.set("observacoes", values.observacoes);
  return formData;
}

export function BookingForm({ services, photographers, locations, loadError }: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingRequestInput>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      service_id: "",
      photographer_id: "",
      location_id: "",
      starts_at: "",
      observacoes: "",
    },
  });

  async function submit(values: BookingRequestInput) {
    setSuccess(null);
    try {
      const result: BookingActionResult = await createBooking(toFormData(values));
      if (!result.success) {
        setError("root.server", { message: result.error });
        return;
      }
      setSuccess("Solicitação enviada! Seu agendamento ficará pendente até a confirmação.");
    } catch {
      setError("root.server", {
        message: "Não foi possível solicitar o agendamento. Tente novamente.",
      });
    }
  }

  const missingOptions = services.length === 0 || photographers.length === 0 || locations.length === 0;

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4">
      {loadError && <Toast variant="error">{loadError}</Toast>}
      {!loadError && missingOptions && (
        <Toast variant="error">
          Ainda não há serviços, fotógrafos e locais ativos suficientes para solicitar um agendamento.
        </Toast>
      )}
      {success && <Toast variant="success">{success}</Toast>}

      <label htmlFor="booking-service" className="grid gap-1.5 text-sm font-medium">
        Serviço
        <Select id="booking-service" data-autofocus {...register("service_id")} aria-invalid={Boolean(errors.service_id)} aria-describedby={errors.service_id ? "booking-service-error" : undefined}>
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>{service.nome} · {service.duracao_min} min</option>
          ))}
        </Select>
        {errors.service_id && <span id="booking-service-error" className="text-xs font-normal text-red-700">{errors.service_id.message}</span>}
      </label>

      <label htmlFor="booking-photographer" className="grid gap-1.5 text-sm font-medium">
        Fotógrafo
        <Select id="booking-photographer" {...register("photographer_id")} aria-invalid={Boolean(errors.photographer_id)} aria-describedby={errors.photographer_id ? "booking-photographer-error" : undefined}>
          <option value="">Selecione um fotógrafo</option>
          {photographers.map((photographer) => (
            <option key={photographer.profile_id} value={photographer.profile_id}>
              {photographer.especialidade || `Fotógrafo ${photographer.profile_id.slice(0, 8)}`}
            </option>
          ))}
        </Select>
        {errors.photographer_id && <span id="booking-photographer-error" className="text-xs font-normal text-red-700">{errors.photographer_id.message}</span>}
      </label>

      <label htmlFor="booking-location" className="grid gap-1.5 text-sm font-medium">
        Local
        <Select id="booking-location" {...register("location_id")} aria-invalid={Boolean(errors.location_id)} aria-describedby={errors.location_id ? "booking-location-error" : undefined}>
          <option value="">Selecione um local</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.nome} · {location.tipo === "estudio" ? "Estúdio" : "Externo"}
            </option>
          ))}
        </Select>
        {errors.location_id && <span id="booking-location-error" className="text-xs font-normal text-red-700">{errors.location_id.message}</span>}
      </label>

      <label htmlFor="booking-start" className="grid gap-1.5 text-sm font-medium">
        Data e horário de início
        <Input id="booking-start" type="datetime-local" {...register("starts_at")} aria-invalid={Boolean(errors.starts_at)} aria-describedby={errors.starts_at ? "booking-start-error" : undefined} />
        {errors.starts_at && <span id="booking-start-error" className="text-xs font-normal text-red-700">{errors.starts_at.message}</span>}
        <span className="text-xs font-normal text-stone-500">Horário de Brasília. A duração é calculada conforme o serviço escolhido.</span>
      </label>

      <label htmlFor="booking-notes" className="grid gap-1.5 text-sm font-medium">
        Observações (opcional)
        <textarea
          id="booking-notes"
          rows={3}
          maxLength={2000}
          {...register("observacoes")}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#bd6948] focus:ring-2 focus:ring-[#bd6948]/20"
        />
      </label>

      {errors.root?.server && <Toast variant="error">{errors.root.server.message}</Toast>}

      <Button type="submit" disabled={isSubmitting || Boolean(loadError) || missingOptions}>
        {isSubmitting ? "Enviando solicitação..." : "Solicitar agendamento"}
      </Button>
    </form>
  );
}
