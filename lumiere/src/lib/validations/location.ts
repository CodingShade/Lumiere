import { z } from "zod";

export const locationSchema = z.object({
  nome: z.string().trim().min(3, "O nome do local deve ter pelo menos 3 caracteres."),
  endereco: z.string().trim(),
  tipo: z.enum(["estudio", "externo"]),
  ativo: z.boolean().default(true),
}).superRefine((location, context) => {
  if (location.tipo === "estudio" && location.endereco.length < 3) {
    context.addIssue({
      code: "custom",
      path: ["endereco"],
      message: "Informe o endereço do estúdio.",
    });
  }
});

export type LocationInput = z.infer<typeof locationSchema>;
export type LocationFormInput = z.input<typeof locationSchema>;
