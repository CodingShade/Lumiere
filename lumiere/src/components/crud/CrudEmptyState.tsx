"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  titulo: string;
  descricao: string;
  createLabel?: string;
  onCreate: () => void;
};

export function CrudEmptyState({ titulo, descricao, createLabel = "Novo cadastro", onCreate }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-12 text-center">
      <h2 className="font-serif text-2xl text-stone-900">{titulo}</h2>
      <p className="mt-2 text-sm text-stone-600">{descricao}</p>
      <Button type="button" className="mt-5" onClick={onCreate}>{createLabel}</Button>
    </div>
  );
}
