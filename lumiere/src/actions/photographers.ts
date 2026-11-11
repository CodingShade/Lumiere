"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { photographerSchema, photographerUpdateSchema } from "@/lib/validations/photographer";
import type { Photographer } from "@/types/database";

export type PhotographerActionResult =
  | { success: true; data: Photographer }
  | { success: false; error: string };

function readPhotographerForm(formData: FormData) {
  return photographerSchema.safeParse({
    profile_id: formData.get("profile_id"),
    especialidade: formData.get("especialidade") ?? "",
    portfolio_url: formData.get("portfolio_url") ?? "",
    ativo: formData.get("ativo") === "true",
  });
}

function readPhotographerUpdateForm(formData: FormData) {
  return photographerUpdateSchema.safeParse({
    especialidade: formData.get("especialidade") ?? "",
    portfolio_url: formData.get("portfolio_url") ?? "",
    ativo: formData.get("ativo") === "true",
  });
}

function validateProfileId(id: string) {
  const parsed = z.uuid().safeParse(id);
  return parsed.success ? parsed.data : null;
}

function revalidatePhotographers() {
  revalidatePath("/admin/fotografos");
}

async function authorizeAdmin() {
  const { role } = await getCurrentUser();
  return role === "admin" ? null : "Apenas administradores podem gerenciar fotógrafos.";
}

export async function createPhotographer(formData: FormData): Promise<PhotographerActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const parsed = readPhotographerForm(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do fotógrafo.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_photographer", {
      p_profile_id: parsed.data.profile_id,
      p_especialidade: parsed.data.especialidade || null,
      p_portfolio_url: parsed.data.portfolio_url || null,
      p_ativo: parsed.data.ativo,
    });

    if (error) {
      if (error.code === "PGRST202") {
        return {
          success: false,
          error: "Execute supabase/functions.sql no SQL Editor do Supabase antes de cadastrar fotógrafos.",
        };
      }
      if (error.code === "23514") {
        return { success: false, error: "Selecione um usuário disponível com perfil de cliente." };
      }
      if (error.code === "23505") {
        return { success: false, error: "Este usuário já está cadastrado como fotógrafo." };
      }
      return { success: false, error: "Não foi possível cadastrar o fotógrafo. Tente novamente." };
    }
    if (!data) return { success: false, error: "Não foi possível cadastrar o fotógrafo." };

    revalidatePhotographers();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível cadastrar o fotógrafo. Verifique se a função SQL foi instalada." };
  }
}

export async function updatePhotographer(
  id: string,
  formData: FormData,
): Promise<PhotographerActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const profileId = validateProfileId(id);
    if (!profileId) return { success: false, error: "Identificador de fotógrafo inválido." };
    const parsed = readPhotographerUpdateForm(formData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Confira os dados do fotógrafo.",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("photographers")
      .update({
        especialidade: parsed.data.especialidade || null,
        portfolio_url: parsed.data.portfolio_url || null,
        ativo: parsed.data.ativo,
      })
      .eq("profile_id", profileId)
      .select("*")
      .maybeSingle();

    if (error) return { success: false, error: "Não foi possível atualizar o fotógrafo. Tente novamente." };
    if (!data) return { success: false, error: "O fotógrafo não foi encontrado." };

    revalidatePhotographers();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível atualizar o fotógrafo. Tente novamente." };
  }
}

export async function deletePhotographer(id: string): Promise<PhotographerActionResult> {
  try {
    const authorizationError = await authorizeAdmin();
    if (authorizationError) return { success: false, error: authorizationError };

    const profileId = validateProfileId(id);
    if (!profileId) return { success: false, error: "Identificador de fotógrafo inválido." };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("delete_photographer", {
      p_profile_id: profileId,
    });

    if (error?.code === "23503") {
      return {
        success: false,
        error: "Este fotógrafo possui agendamentos. Desative-o em vez de excluir.",
      };
    }
    if (error?.code === "PGRST202") {
      return {
        success: false,
        error: "Execute supabase/functions.sql no SQL Editor do Supabase antes de excluir fotógrafos.",
      };
    }
    if (error) return { success: false, error: "Não foi possível excluir o fotógrafo. Tente novamente." };
    if (!data) return { success: false, error: "O fotógrafo não foi encontrado." };

    revalidatePhotographers();
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível excluir o fotógrafo. Verifique se a função SQL foi instalada." };
  }
}
