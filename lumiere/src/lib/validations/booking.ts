import { z } from "zod";

export const bookingRequestSchema = z.object({
  photographer_id: z.uuid("Selecione um fotógrafo."),
  service_id: z.uuid("Selecione um serviço."),
  location_id: z.uuid("Selecione um local."),
  starts_at: z.iso.datetime({ local: true, message: "Informe uma data e horário válidos." }),
  observacoes: z.string().trim().max(2000, "As observações devem ter no máximo 2.000 caracteres."),
});

export const bookingSchema = bookingRequestSchema.extend({
  ends_at: z.iso.datetime({ message: "Informe um horário final válido." }),
}).refine((booking) => booking.ends_at > booking.starts_at, {
  message: "O horário final deve ser posterior ao horário inicial.",
  path: ["ends_at"],
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
