"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-xl content-center gap-4 px-5 text-center">
      <h1 className="font-serif text-4xl">Não foi possível carregar esta página</h1>
      <p className="text-stone-600">Tente novamente. Se o problema continuar, entre em contato com a equipe Lumiere.</p>
      <Button type="button" onClick={reset}>Tentar novamente</Button>
    </main>
  );
}
