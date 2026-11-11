"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { locationSchema } from "@/lib/validations/location";
import type { Location } from "@/types/database";

export type LocationActionResult =
  | { success: true; data: Location }
  | { success: false; error: string };

function readLocationForm(formData: FormData) {
  return locationSchema.safeParse({
    nome: formData.get("nome"),
    endereco: formData.get("endereco") ?? "",
    tipo: formData.get("tipo"),
    ativo: formData.get("ativo") === "true",
  });
}

function validateLocationId(id: string) {
  const parsed = z.uuid().safeParse(id);
  return parsed.success ? parsed.data : null;
}

function revalidateLocations() {
  revalidatePath("/admin/locais");
}

async function authorizeAdmin() {
  const { role } = await getCurrentUser();
  return role === "admin" ? null : "Apenas administradores podem gerenciar locais.";
}

export async function createLocation(formData: FormData): Promise<LocationActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsed = readLocationForm(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do local.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("locations")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error) return { success: false, error: "Não foi possível cadastrar o local. Tente novamente." };

    revalidateLocations();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível cadastrar o local. Tente novamente." };
  }
}

export async function updateLocation(
  id: string,
  formData: FormData,
): Promise<LocationActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsedId = validateLocationId(id);
    if (!parsedId) return { success: false, error: "Identificador de local inválido." };
    const parsed = readLocationForm(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do local.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("locations")
      .update(parsed.data)
      .eq("id", parsedId)
      .select("*")
      .maybeSingle();

    if (error) return { success: false, error: "Não foi possível atualizar o local. Tente novamente." };
    if (!data) return { success: false, error: "O local não foi encontrado." };

    revalidateLocations();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível atualizar o local. Tente novamente." };
  }
}

export async function deleteLocation(id: string): Promise<LocationActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsedId = validateLocationId(id);
    if (!parsedId) return { success: false, error: "Identificador de local inválido." };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("locations")
      .delete()
      .eq("id", parsedId)
      .select("*")
      .maybeSingle();

    if (error?.code === "23503") {
      return {
        success: false,
        error: "Este local possui agendamentos. Desative-o em vez de excluir.",
      };
    }
    if (error) return { success: false, error: "Não foi possível excluir o local. Tente novamente." };
    if (!data) return { success: false, error: "O local não foi encontrado." };

    revalidateLocations();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível excluir o local. Tente novamente." };
  }
}
