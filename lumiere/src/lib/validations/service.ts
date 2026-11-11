import { z } from "zod";

export const serviceSchema = z.object({
  nome: z.string().trim().min(3, "O nome do serviço deve ter pelo menos 3 caracteres."),
  descricao: z.string().trim().optional(),
  duracao_min: z.coerce.number({ error: "Informe a duração em minutos." })
    .int("A duração deve ser informada em minutos inteiros.")
    .positive("A duração deve ser maior que zero."),
  preco: z.coerce.number({ error: "Informe um preço válido." })
    .finite("Informe um preço válido.")
    .nonnegative("O preço não pode ser negativo."),
  fotos_entregues: z.coerce.number({ error: "Informe a quantidade de fotos." })
    .int("A quantidade de fotos deve ser um número inteiro.")
    .nonnegative("A quantidade de fotos não pode ser negativa."),
  ativo: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type ServiceFormInput = z.input<typeof serviceSchema>;
