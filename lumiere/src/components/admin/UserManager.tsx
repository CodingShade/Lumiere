"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfileRole } from "@/actions/profiles";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";
import type { Profile, UserRole } from "@/types/database";

const roleLabels: Record<UserRole, string> = {
  cliente: "Cliente",
  fotografo: "Fotógrafo",
  admin: "Administrador",
};

export function UserManager({ users }: { users: Profile[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ variant: "success" | "error"; message: string } | null>(null);

  async function changeRole(profile: Profile, role: UserRole) {
    setPendingId(profile.id);
    setFeedback(null);
    const result = await updateProfileRole(profile.id, role);
    if (result.success) {
      setFeedback({ variant: "success", message: `Papel de ${profile.nome} atualizado.` });
      router.refresh();
    } else {
      setFeedback({ variant: "error", message: result.error });
    }
    setPendingId(null);
  }

  return (
    <section className="grid gap-5">
      {feedback && <Toast variant={feedback.variant}>{feedback.message}</Toast>}
      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="font-medium text-stone-900">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {users.map((profile) => (
            <article key={profile.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-stone-900">{profile.nome}</p>
                <p className="mt-1 text-sm text-stone-600">{profile.telefone || "Telefone não informado"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{roleLabels[profile.role]}</Badge>
                <Select
                  aria-label={`Alterar papel de ${profile.nome}`}
                  value={profile.role}
                  disabled={pendingId === profile.id}
                  onChange={(event) => changeRole(profile, event.target.value as UserRole)}
                  className="min-h-9 w-auto"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
