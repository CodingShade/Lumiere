import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type Props = {
  titulo: string;
  descricao: string;
  children?: ReactNode;
  emConstrucao?: boolean;
};

export function PagePlaceholder({ titulo, descricao, children, emConstrucao = false }: Props) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-9">
      {emConstrucao && <Badge>Área em construção</Badge>}
      <h1 className="mt-4 font-serif text-4xl text-stone-900">{titulo}</h1>
      <p className="mt-3 max-w-2xl leading-7 text-stone-600">{descricao}</p>
      {children && <div className="mt-7">{children}</div>}
    </section>
  );
}
