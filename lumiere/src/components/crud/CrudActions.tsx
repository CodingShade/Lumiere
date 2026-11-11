"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  nome: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function CrudActions({ nome, onEdit, onDelete }: Props) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        className="min-h-9 px-3 text-xs"
        aria-label={`Editar ${nome}`}
        onClick={onEdit}
      >
        Editar
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="min-h-9 px-3 text-xs text-red-700 hover:bg-red-50"
        aria-label={`Excluir ${nome}`}
        onClick={onDelete}
      >
        Excluir
      </Button>
    </div>
  );
}
