"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const demoPhotographers = [
  {
    email: "ana.demo@lumiere.example.com",
    nome: "Ana Clara Souza",
    especialidade: "Retratos e família",
  },
  {
    email: "bruno.demo@lumiere.example.com",
    nome: "Bruno Martins",
    especialidade: "Eventos e retratos",
  },
  {
    email: "camila.demo@lumiere.example.com",
    nome: "Camila Rocha",
    especialidade: "Casais e lifestyle",
  },
] as const;

export type DemoPhotographersResult =
  | {
      success: true;
      data: { created: number; alreadyPresent: number; failures: string[] };
    }
  | { success: false; error: string };

export async function createDemoPhotographers(): Promise<DemoPhotographersResult> {
  try {
    const { user, role } = await getCurrentUser();
    if (!user || role !== "admin") {
      return { success: false, error: "Apenas administradores podem criar fotógrafos de demonstração." };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Configure SUPABASE_SERVICE_ROLE_KEY no servidor antes de continuar." };
    }

    const supabase = createAdminClient();
    const userByEmail = new Map<string, {
      id: string;
      app_metadata: Record<string, unknown>;
    }>();
    let page = 1;
    while (true) {
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (listError) {
        console.error("Falha ao listar usuários do Supabase:", listError.message);
        return { success: false, error: "Não foi possível verificar as contas de demonstração existentes." };
      }

      for (const candidate of userList.users) {
        const email = candidate.email?.toLowerCase();
        if (email && demoPhotographers.some((demo) => demo.email === email)) {
          userByEmail.set(email, {
            id: candidate.id,
            app_metadata: candidate.app_metadata,
          });
        }
      }
      if (userByEmail.size === demoPhotographers.length || userList.users.length < 1000) break;
      page += 1;
    }

    let created = 0;
    let alreadyPresent = 0;
    const failures: string[] = [];

    for (const demo of demoPhotographers) {
      const existingUser = userByEmail.get(demo.email);
      let userId: string;
      let newlyCreated = false;

      if (existingUser) {
        if (existingUser.app_metadata?.lumiere_demo_photographer !== true) {
          failures.push(`${demo.nome}: o e-mail de demonstração já está associado a outra conta.`);
          continue;
        }
        userId = existingUser.id;
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: demo.email,
          password: randomBytes(32).toString("base64url"),
          email_confirm: true,
          user_metadata: { nome: demo.nome },
          app_metadata: { lumiere_demo_photographer: true },
        });
        if (error) {
          console.error(`Falha ao criar a conta de demonstração de ${demo.nome}:`, error.message);
          failures.push(`${demo.nome}: não foi possível criar a conta de demonstração.`);
          continue;
        }
        userId = data.user.id;
        newlyCreated = true;
      }

      const { error: photographerError } = await supabase.rpc("create_demo_photographer", {
        p_profile_id: userId,
        p_especialidade: demo.especialidade,
        p_portfolio_url: null,
        p_ativo: true,
      });

      if (photographerError) {
        console.error(`Falha ao vincular ${demo.nome} como fotógrafo:`, photographerError.message);
        let cleanupFailed = false;
        if (newlyCreated) {
          const { error: rollbackError } = await supabase.auth.admin.deleteUser(userId);
          if (rollbackError) {
            cleanupFailed = true;
            console.error("Não foi possível remover uma conta de demonstração após falha ao criar o fotógrafo.", {
              userId,
            });
          }
        }
        failures.push(
          cleanupFailed
            ? `${demo.nome}: o vínculo falhou e a conta ficou criada; remova-a em Authentication → Users.`
            : `${demo.nome}: não foi possível vincular o perfil de fotógrafo.`,
        );
        continue;
      }

      if (newlyCreated) created += 1;
      else alreadyPresent += 1;
    }

    if (created + alreadyPresent === 0) {
      return {
        success: false,
        error: failures.join(" ") || "Não foi possível criar fotógrafos de demonstração.",
      };
    }

    revalidatePath("/admin/fotografos");
    revalidatePath("/agendamentos/novo");
    return { success: true, data: { created, alreadyPresent, failures } };
  } catch (error) {
    console.error(
      "Falha inesperada ao criar fotógrafos de demonstração:",
      error instanceof Error ? error.message : "Erro desconhecido",
    );
    return {
      success: false,
      error: "Não foi possível criar fotógrafos de demonstração. Verifique a configuração do Supabase.",
    };
  }
}
