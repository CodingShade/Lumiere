import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default async function AgendamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // TODO: Consultar o agendamento e validar se o perfil atual pode visualizá-lo.
  return <PagePlaceholder titulo="Detalhes do ensaio" descricao={`Informações do agendamento ${id}.`} />;
}
