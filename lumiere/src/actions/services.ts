"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database";
import { serviceSchema } from "@/lib/validations/service";

export type ServiceActionResult =
  | { success: true; data: Service }
  | { success: false; error: string };

function readServiceForm(formData: FormData) {
  return serviceSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao") ?? "",
    duracao_min: formData.get("duracao_min"),
    preco: formData.get("preco"),
    fotos_entregues: formData.get("fotos_entregues"),
    ativo: formData.get("ativo") === "true",
  });
}

async function authorizeAdmin(): Promise<string | null> {
  const { role } = await getCurrentUser();
  return role === "admin" ? null : "Apenas administradores podem gerenciar serviços.";
}

function refreshServicePages() {
  revalidatePath("/admin/servicos");
  revalidatePath("/");
}

function validateServiceId(id: string) {
  const parsed = z.uuid().safeParse(id);
  return parsed.success ? parsed.data : null;
}

export async function createService(formData: FormData): Promise<ServiceActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsed = readServiceForm(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do serviço.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: "Não foi possível cadastrar o serviço. Tente novamente." };
    }

    refreshServicePages();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível cadastrar o serviço. Tente novamente." };
  }
}

export async function updateService(
  id: string,
  formData: FormData,
): Promise<ServiceActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsedId = validateServiceId(id);
    if (!parsedId) return { success: false, error: "Identificador de serviço inválido." };
    const parsed = readServiceForm(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do serviço.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .update(parsed.data)
      .eq("id", parsedId)
      .select("*")
      .maybeSingle();

    if (error) {
      return { success: false, error: "Não foi possível atualizar o serviço. Tente novamente." };
    }
    if (!data) return { success: false, error: "O serviço não foi encontrado." };

    refreshServicePages();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível atualizar o serviço. Tente novamente." };
  }
}

export async function deleteService(id: string): Promise<ServiceActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsedId = validateServiceId(id);
    if (!parsedId) return { success: false, error: "Identificador de serviço inválido." };
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .delete()
      .eq("id", parsedId)
      .select("*")
      .maybeSingle();

    if (error?.code === "23503") {
      return {
        success: false,
        error: "Este serviço possui agendamentos. Desative-o em vez de excluir.",
      };
    }
    if (error) {
      return { success: false, error: "Não foi possível excluir o serviço. Tente novamente." };
    }
    if (!data) return { success: false, error: "O serviço não foi encontrado." };

    refreshServicePages();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível excluir o serviço. Tente novamente." };
  }
}
