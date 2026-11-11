"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Service } from "@/types/database";
import type { ServiceActionResult } from "@/actions/services";
import { serviceSchema, type ServiceFormInput, type ServiceInput } from "@/lib/validations/service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

type Props = {
  service?: Service;
  onSave: (values: ServiceInput) => Promise<ServiceActionResult>;
  onCancel: () => void;
};

export function ServiceForm({ service, onSave, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, unknown, ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      nome: service?.nome ?? "",
      descricao: service?.descricao ?? "",
      duracao_min: service?.duracao_min ?? 60,
      preco: service?.preco ?? 0,
      fotos_entregues: service?.fotos_entregues ?? 10,
      ativo: service?.ativo ?? true,
    },
  });

  async function submit(values: ServiceInput) {
    try {
      const result = await onSave(values);
      if (!result.success) setError("root.server", { message: result.error });
    } catch {
      setError("root.server", {
        message: "Não foi possível salvar o serviço. Tente novamente.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-4">
      <label htmlFor="service-name" className="grid gap-1.5 text-sm font-medium">
        Nome
        <Input id="service-name" data-autofocus autoComplete="off" {...register("nome")} aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? "service-name-error" : undefined} />
        {errors.nome && <span id="service-name-error" className="text-xs font-normal text-red-700">{errors.nome.message}</span>}
      </label>

      <label htmlFor="service-description" className="grid gap-1.5 text-sm font-medium">
        Descrição
        <textarea
          id="service-description"
          rows={3}
          {...register("descricao")}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#bd6948] focus:ring-2 focus:ring-[#bd6948]/20"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="service-duration" className="grid gap-1.5 text-sm font-medium">
          Duração (minutos)
          <Input id="service-duration" type="number" min="1" step="1" {...register("duracao_min", { valueAsNumber: true })} aria-invalid={Boolean(errors.duracao_min)} aria-describedby={errors.duracao_min ? "service-duration-error" : undefined} />
          {errors.duracao_min && <span id="service-duration-error" className="text-xs font-normal text-red-700">{errors.duracao_min.message}</span>}
        </label>

        <label htmlFor="service-price" className="grid gap-1.5 text-sm font-medium">
          Preço (R$)
          <Input id="service-price" type="number" min="0" step="0.01" {...register("preco", { valueAsNumber: true })} aria-invalid={Boolean(errors.preco)} aria-describedby={errors.preco ? "service-price-error" : undefined} />
          {errors.preco && <span id="service-price-error" className="text-xs font-normal text-red-700">{errors.preco.message}</span>}
        </label>
      </div>

      <label htmlFor="service-photos" className="grid gap-1.5 text-sm font-medium">
        Fotos entregues
        <Input id="service-photos" type="number" min="0" step="1" {...register("fotos_entregues", { valueAsNumber: true })} aria-invalid={Boolean(errors.fotos_entregues)} aria-describedby={errors.fotos_entregues ? "service-photos-error" : undefined} />
        {errors.fotos_entregues && <span id="service-photos-error" className="text-xs font-normal text-red-700">{errors.fotos_entregues.message}</span>}
      </label>

      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-[#bd6948]" {...register("ativo")} />
        Serviço ativo
      </label>

      {errors.root?.server && <Toast variant="error">{errors.root.server.message}</Toast>}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : service ? "Salvar alterações" : "Criar serviço"}
        </Button>
      </div>
    </form>
  );
}
