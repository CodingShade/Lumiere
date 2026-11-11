"use client";

import { Button } from "@/components/ui/Button";

type Props = {
  count: number;
  singular: string;
  plural: string;
  createLabel?: string;
  onCreate: () => void;
};

export function CrudHeader({ count, singular, plural, createLabel = "Novo cadastro", onCreate }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <p className="text-sm text-stone-600">
        {count} {count === 1 ? singular : plural}
      </p>
      <Button type="button" onClick={onCreate}>{createLabel}</Button>
    </div>
  );
}
