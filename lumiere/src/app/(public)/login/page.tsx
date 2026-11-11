"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/actions/auth";
import type { AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

const initialState: AuthFormState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initialState);
  return (
    <main className="mx-auto grid min-h-[75vh] max-w-lg content-center px-5 py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9583b]">Bem-vindo de volta</p>
        <h1 className="mt-2 font-serif text-4xl">Entrar na Lumiere</h1>
        <form action={action} className="mt-7 grid gap-5">
          <label className="grid gap-2 text-sm font-medium">E-mail<Input type="email" name="email" autoComplete="email" required /></label>
          <label className="grid gap-2 text-sm font-medium">Senha<Input type="password" name="password" autoComplete="current-password" minLength={8} required /></label>
          {state.error && <Toast>{state.error}</Toast>}
          <Button type="submit" disabled={pending}>{pending ? "Entrando..." : "Entrar"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">Ainda não tem conta? <Link href="/cadastro" className="font-semibold text-[#a9583b]">Cadastre-se</Link></p>
      </div>
    </main>
  );
}
