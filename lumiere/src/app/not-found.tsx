import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-content-center gap-4 px-5 text-center">
      <h1 className="font-serif text-5xl">Página não encontrada</h1>
      <p className="text-stone-600">Este endereço não existe ou foi removido.</p>
      <Link href="/" className="font-semibold text-[#a9583b]">Voltar ao início</Link>
    </main>
  );
}
