"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { PhotographerActionResult } from "@/actions/photographers";
import {
  photographerSchema,
  type PhotographerFormInput,
  type PhotographerInput,
} from "@/lib/validations/photographer";
import type { PhotographerWithProfile, Profile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";

type Props = {
  photographer?: PhotographerWithProfile;
  availableProfiles: Profile[];
  onSave: (values: PhotographerInput) => Promise<PhotographerActionResult>;
  onCancel: () => void;
};

export function PhotographerForm({
  photographer,
  availableProfiles,
  onSave,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PhotographerFormInput, unknown, PhotographerInput>({
    resolver: zodResolver(photographerSchema),
    defaultValues: {
      profile_id: photographer?.profile_id ?? "",
      especialidade: photographer?.especialidade ?? "",
      portfolio_url: photographer?.portfolio_url ?? "",
      ativo: photographer?.ativo ?? true,
    },
  });

  async function submit(values: PhotographerInput) {
    try {
      const result = await onSave({
        ...values,
        profile_id: photographer?.profile_id ?? values.profile_id,
      });
      if (!result.success) setError("root.server", { message: result.error });
    } catch {
      setError("root.server", { message: "Não foi possível salvar o fotógrafo. Tente novamente." });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4">
      <label htmlFor="photographer-profile" className="grid gap-1.5 text-sm font-medium">
        Usuário vinculado
        {photographer ? (
          <>
            <Select id="photographer-profile" value={photographer.profile_id} disabled aria-describedby="photographer-profile-help">
              <option value={photographer.profile_id}>
                {photographer.profiles.nome}
                {photographer.profiles.telefone ? ` · ${photographer.profiles.telefone}` : ""}
              </option>
            </Select>
            <input type="hidden" {...register("profile_id")} />
            <span id="photographer-profile-help" className="text-xs font-normal text-stone-500">O usuário vinculado não pode ser alterado.</span>
          </>
        ) : availableProfiles.length ? (
          <>
            <Select
              id="photographer-profile"
              data-autofocus
              {...register("profile_id")}
              aria-invalid={Boolean(errors.profile_id)}
              aria-describedby={errors.profile_id ? "photographer-profile-error" : undefined}
            >
              <option value="">Selecione um usuário</option>
              {availableProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.nome}{profile.telefone ? ` · ${profile.telefone}` : ""}
                </option>
              ))}
            </Select>
            {errors.profile_id && <span id="photographer-profile-error" className="text-xs font-normal text-red-700">{errors.profile_id.message}</span>}
          </>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-normal text-amber-950">
            <p className="font-medium">Nenhum usuário disponível.</p>
            <p className="mt-1 leading-6">
              Esta tela vincula uma conta existente; não cria contas nem envia convites. A pessoa precisa se cadastrar
              primeiro e aparecer como cliente para ser selecionada.
            </p>
          </div>
        )}
      </label>

      <label htmlFor="photographer-specialty" className="grid gap-1.5 text-sm font-medium">
        Especialidade
        <Input id="photographer-specialty" {...register("especialidade")} />
      </label>

      <label htmlFor="photographer-portfolio" className="grid gap-1.5 text-sm font-medium">
        Portfólio (URL)
        <Input id="photographer-portfolio" type="url" {...register("portfolio_url")} aria-invalid={Boolean(errors.portfolio_url)} aria-describedby={errors.portfolio_url ? "photographer-portfolio-error" : undefined} />
        {errors.portfolio_url && <span id="photographer-portfolio-error" className="text-xs font-normal text-red-700">{errors.portfolio_url.message}</span>}
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-[#bd6948]" {...register("ativo")} />
        Fotógrafo ativo
      </label>

      {errors.root?.server && <Toast variant="error">{errors.root.server.message}</Toast>}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting || (!photographer && availableProfiles.length === 0)}>
          {isSubmitting ? "Salvando..." : photographer ? "Salvar alterações" : "Criar fotógrafo"}
        </Button>
      </div>
    </form>
  );
}
