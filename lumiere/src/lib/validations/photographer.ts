import { z } from "zod";

export const photographerSchema = z.object({
  profile_id: z.string().uuid(),
  especialidade: z.string().trim(),
  portfolio_url: z.string().trim()
    .refine(
      (value) => value === "" || z.url({ protocol: /^https?$/ }).safeParse(value).success,
      "Informe uma URL válida usando http ou https.",
    )
    .optional(),
  ativo: z.boolean().default(true),
});

export const photographerUpdateSchema = photographerSchema.omit({ profile_id: true });

export type PhotographerInput = z.infer<typeof photographerSchema>;
export type PhotographerFormInput = z.input<typeof photographerSchema>;
export type PhotographerUpdateInput = z.infer<typeof photographerUpdateSchema>;
