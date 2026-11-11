import Link from "next/link";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <PagePlaceholder titulo="Seu espaço Lumiere" descricao="Acompanhe seus ensaios e encontre o momento perfeito para uma nova sessão.">
      <Link href="/agendamentos/novo"><Button type="button">Agendar ensaio</Button></Link>
      {/* TODO: Exibir resumo de agendamentos conforme o perfil autenticado. */}
    </PagePlaceholder>
  );
}
