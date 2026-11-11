import { z } from "zod";

export function parseFormData<T extends z.ZodType>(schema: T, formData: FormData): z.output<T> {
  const result = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    throw new Error(result.error.issues.map((issue) => issue.message).join(" "));
  }
  return result.data;
}

export function parseRecordId(id: string) {
  const result = z.uuid().safeParse(id);
  if (!result.success) throw new Error("Identificador inválido.");
  return result.data;
}
