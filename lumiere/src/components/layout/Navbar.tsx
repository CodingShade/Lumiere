import Link from "next/link";
import type { UserRole } from "@/types/database";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";

type Props = { role: UserRole | null };

export function Navbar({ role }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-[#fffdfa]/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-stone-900">Lumiere</Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {role ? (
            <>
              <Link href="/dashboard" className="text-sm text-stone-700 hover:text-[#bd6948]">Painel</Link>
              <Link href="/agendamentos" className="text-sm text-stone-700 hover:text-[#bd6948]">Agendamentos</Link>
              {(role === "fotografo" || role === "admin") && <Link href="/fotografo/agenda" className="text-sm text-stone-700 hover:text-[#bd6948]">Agenda</Link>}
              {role === "admin" && <Link href="/admin/servicos" className="text-sm text-stone-700 hover:text-[#bd6948]">Administração</Link>}
              <form action={signOut}><Button type="submit" variant="ghost">Sair</Button></form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-stone-700 hover:text-[#bd6948]">Entrar</Link>
              <Link href="/cadastro"><Button type="button">Criar conta</Button></Link>
            </>
          )}
        </nav>
        <MobileMenu role={role} />
      </div>
    </header>
  );
}
