"use client";

import Link from "next/link";
import { useState } from "react";
import type { UserRole } from "@/types/database";
import { signOut } from "@/actions/auth";

type Props = { role: UserRole | null };

function linksForRole(role: UserRole | null) {
  const links = [{ href: "/dashboard", label: "Painel" }, { href: "/agendamentos", label: "Agendamentos" }];
  if (role === "admin") links.push({ href: "/admin/servicos", label: "Administração" });
  if (role === "fotografo" || role === "admin") links.push({ href: "/fotografo/agenda", label: "Minha agenda" });
  return links;
}

export function MobileMenu({ role }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
      >
        {open ? "Fechar" : "Menu"}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-stone-200 bg-white p-4 shadow-lg">
          {linksForRole(role).map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-stone-100">
              {link.label}
            </Link>
          ))}
          {role ? (
            <form action={signOut}>
              <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100">Sair</button>
            </form>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-stone-100">Entrar</Link>
              <Link href="/cadastro" className="rounded-lg px-3 py-2 text-sm hover:bg-stone-100">Criar conta</Link>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
