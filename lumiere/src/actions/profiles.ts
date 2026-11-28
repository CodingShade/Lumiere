"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export type ProfileActionResult =
  | { success: true; data: Profile }
  | { success: false; error: string };

export async function updateProfileRole(id: string, role: UserRole): Promise<ProfileActionResult> {
  try {
    const current = await getCurrentUser();
    if (current.role !== "admin") return { success: false, error: "Apenas administradores podem alterar usuários." };
    if (!z.uuid().safeParse(id).success) return { success: false, error: "Usuário inválido." };
    if (!["cliente", "fotografo", "admin"].includes(role)) return { success: false, error: "Selecione um papel válido." };
    if (current.user?.id === id && role !== "admin") {
      return { success: false, error: "Você não pode remover o próprio acesso administrativo." };
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) return { success: false, error: "Não foi possível atualizar o usuário." };
    if (!data) return { success: false, error: "Usuário não encontrado." };
    revalidatePath("/admin/usuarios");
    return { success: true, data };
  } catch {
    return { success: false, error: "Não foi possível atualizar o usuário." };
  }
}
