import Link from "next/link";
import type { UserRole } from "@/types/database";

export function Sidebar({ role }: { role: UserRole }) {
  const items = role === "admin"
    ? [["/admin/servicos", "Serviços"], ["/admin/locais", "Locais"], ["/admin/fotografos", "Fotógrafos"], ["/admin/usuarios", "Usuários"]]
    : role === "fotografo"
      ? [["/fotografo/agenda", "Minha agenda"]]
      : [["/agendamentos", "Agendamentos"], ["/agendamentos/novo", "Novo agendamento"]];

  return (
    <aside className="hidden w-56 shrink-0 rounded-2xl border border-stone-200 bg-white p-4 md:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Menu</p>
      <nav className="flex flex-col gap-1">
        {items.map(([href, label]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm hover:bg-stone-100">{label}</Link>)}
      </nav>
    </aside>
  );
}
