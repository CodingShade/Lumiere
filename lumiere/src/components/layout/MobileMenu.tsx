"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/types/database";
import { signOut } from "@/actions/auth";

type Props = { role: UserRole | null };

function linksForRole(role: UserRole | null) {
  if (role === "admin") {
    return [
      { href: "/dashboard", label: "Painel" },
      { href: "/agendamentos", label: "Agendamentos" },
      { href: "/admin/servicos", label: "Serviços" },
      { href: "/admin/locais", label: "Locais" },
      { href: "/admin/fotografos", label: "Fotógrafos" },
      { href: "/admin/usuarios", label: "Usuários" },
      { href: "/fotografo/agenda", label: "Minha agenda" },
    ];
  }
  if (role === "fotografo") {
    return [
      { href: "/dashboard", label: "Painel" },
      { href: "/agendamentos", label: "Agendamentos" },
      { href: "/fotografo/agenda", label: "Minha agenda" },
    ];
  }
  if (role === "cliente") {
    return [
      { href: "/dashboard", label: "Painel" },
      { href: "/agendamentos", label: "Agendamentos" },
      { href: "/agendamentos/novo", label: "Novo agendamento" },
    ];
  }
  return [];
}

export function MobileMenu({ role }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(!open)}
        className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd6948]"
      >
        {open ? "Fechar" : "Menu"}
      </button>
      {open && (
        <nav id="mobile-navigation" aria-label="Navegação principal" className="absolute inset-x-0 top-full z-20 flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-b border-stone-200 bg-white p-4 shadow-lg">
          {linksForRole(role).map((link) => {
            const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={`rounded-xl px-3 py-3 text-sm transition-colors ${active ? "bg-[#f7e9e3] font-semibold text-[#8f4d36]" : "text-stone-700 hover:bg-stone-100"}`}
              >
                {link.label}
              </Link>
            );
          })}
          {role ? (
            <form action={signOut}>
              <button type="submit" className="min-h-11 w-full rounded-xl px-3 py-3 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100">Sair</button>
            </form>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-stone-100">Entrar</Link>
              <Link href="/cadastro" className="rounded-xl px-3 py-3 text-sm text-stone-700 hover:bg-stone-100">Criar conta</Link>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
