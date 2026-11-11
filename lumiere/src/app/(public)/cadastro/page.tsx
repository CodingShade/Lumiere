"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import type { AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

const initialState: AuthFormState = {};

export default function CadastroPage() {
  const [state, action, pending] = useActionState(signUp, initialState);
  return (
    <main className="mx-auto grid min-h-[75vh] max-w-lg content-center px-5 py-14">
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#a9583b]">Seu próximo momento começa aqui</p>
        <h1 className="mt-2 font-serif text-4xl">Crie sua conta</h1>
        <form action={action} className="mt-7 grid gap-5">
          <label className="grid gap-2 text-sm font-medium">Nome completo<Input name="nome" autoComplete="name" minLength={2} required /></label>
          <label className="grid gap-2 text-sm font-medium">E-mail<Input type="email" name="email" autoComplete="email" required /></label>
          <label className="grid gap-2 text-sm font-medium">Senha<Input type="password" name="password" autoComplete="new-password" minLength={8} required /></label>
          {state.error && <Toast>{state.error}</Toast>}
          {state.success && <Toast variant="success">{state.success}</Toast>}
          <Button type="submit" disabled={pending}>{pending ? "Criando conta..." : "Criar conta"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-600">Já tem uma conta? <Link href="/login" className="font-semibold text-[#a9583b]">Entrar</Link></p>
      </div>
    </main>
  );
}
