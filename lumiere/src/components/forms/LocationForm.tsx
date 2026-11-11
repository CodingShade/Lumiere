"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { Location } from "@/types/database";
import type { LocationActionResult } from "@/actions/locations";
import { locationSchema, type LocationFormInput, type LocationInput } from "@/lib/validations/location";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";

type Props = {
  location?: Location;
  onSave: (values: LocationInput) => Promise<LocationActionResult>;
  onCancel: () => void;
};

export function LocationForm({ location, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    control,
  } = useForm<LocationFormInput, unknown, LocationInput>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      nome: location?.nome ?? "",
      endereco: location?.endereco ?? "",
      tipo: location?.tipo ?? "estudio",
      ativo: location?.ativo ?? true,
    },
  });
  const type = useWatch({ control, name: "tipo" });

  async function submit(values: LocationInput) {
    try {
      const result = await onSave(values);
      if (!result.success) setError("root.server", { message: result.error });
    } catch {
      setError("root.server", { message: "Não foi possível salvar o local. Tente novamente." });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4">
      <label htmlFor="location-name" className="grid gap-1.5 text-sm font-medium">
        Nome
        <Input id="location-name" data-autofocus {...register("nome")} aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? "location-name-error" : undefined} />
        {errors.nome && <span id="location-name-error" className="text-xs font-normal text-red-700">{errors.nome.message}</span>}
      </label>

      <label htmlFor="location-type" className="grid gap-1.5 text-sm font-medium">
        Tipo
        <Select id="location-type" {...register("tipo")}>
          <option value="estudio">Estúdio</option>
          <option value="externo">Externo</option>
        </Select>
      </label>

      <label htmlFor="location-address" className="grid gap-1.5 text-sm font-medium">
        Endereço {type === "estudio" ? "(obrigatório para estúdio)" : "(opcional para local externo)"}
        <Input id="location-address" {...register("endereco")} aria-invalid={Boolean(errors.endereco)} aria-describedby={errors.endereco ? "location-address-error" : undefined} />
        {errors.endereco && <span id="location-address-error" className="text-xs font-normal text-red-700">{errors.endereco.message}</span>}
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-[#bd6948]" {...register("ativo")} />
        Local ativo
      </label>

      {errors.root?.server && <Toast variant="error">{errors.root.server.message}</Toast>}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : location ? "Salvar alterações" : "Criar local"}</Button>
      </div>
    </form>
  );
}
