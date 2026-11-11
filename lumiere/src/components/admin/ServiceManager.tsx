"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, deleteService, updateService, type ServiceActionResult } from "@/actions/services";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { CrudActions } from "@/components/crud/CrudActions";
import { CrudEmptyState } from "@/components/crud/CrudEmptyState";
import { CrudHeader } from "@/components/crud/CrudHeader";
import { ResponsiveCrudList } from "@/components/crud/ResponsiveCrudList";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { ServiceInput } from "@/lib/validations/service";
import type { Service } from "@/types/database";

type EditorState = "novo" | Service | null;
type Feedback = { variant: "success" | "error"; message: string };

type Props = {
  services: Service[];
  loadError?: string;
};

function serviceFormData(values: ServiceInput) {
  const formData = new FormData();
  formData.set("nome", values.nome);
  formData.set("descricao", values.descricao ?? "");
  formData.set("duracao_min", String(values.duracao_min));
  formData.set("preco", String(values.preco));
  formData.set("fotos_entregues", String(values.fotos_entregues));
  formData.set("ativo", String(values.ativo));
  return formData;
}

export function ServiceManager({ services, loadError }: Props) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function save(values: ServiceInput): Promise<ServiceActionResult> {
    const formData = serviceFormData(values);
    const result = editor === "novo"
      ? await createService(formData)
      : editor
        ? await updateService(editor.id, formData)
        : { success: false as const, error: "Não foi possível identificar o serviço." };

    if (result.success) {
      setFeedback({ variant: "success", message: editor === "novo" ? "Serviço criado com sucesso." : "Serviço atualizado com sucesso." });
      setEditor(null);
      router.refresh();
    }
    return result;
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteService(deleteTarget.id);
      if (result.success) {
        setFeedback({ variant: "success", message: "Serviço excluído com sucesso." });
        setDeleteTarget(null);
        router.refresh();
        return;
      }
      setDeleteError(result.error);
    } catch {
      setDeleteError("Não foi possível excluir o serviço. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  const openCreate = () => { setFeedback(null); setEditor("novo"); };
  const openEdit = (service: Service) => { setFeedback(null); setEditor(service); };
  const openDelete = (service: Service) => {
    setFeedback(null);
    setDeleteError(null);
    setDeleteTarget(service);
  };

  return (
    <>
      <section className="grid gap-5">
        <p className="text-sm text-stone-600">Cadastre e atualize os pacotes de ensaios oferecidos.</p>
        <CrudHeader count={services.length} singular="serviço cadastrado" plural="serviços cadastrados" createLabel="Novo serviço" onCreate={openCreate} />
        {feedback && <Toast variant={feedback.variant}>{feedback.message}</Toast>}
        {loadError && <Toast variant="error">{loadError}</Toast>}

        {!loadError && services.length === 0 ? (
          <CrudEmptyState
            titulo="Nenhum serviço cadastrado"
            descricao="Crie o primeiro serviço para começar a receber agendamentos."
            createLabel="Novo serviço"
            onCreate={openCreate}
          />
        ) : services.length > 0 ? (
          <ResponsiveCrudList
            desktop={
              <Table>
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Nome</th>
                    <th scope="col" className="px-5 py-3">Duração</th>
                    <th scope="col" className="px-5 py-3">Preço</th>
                    <th scope="col" className="px-5 py-3">Fotos entregues</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-stone-50/70">
                      <td className="px-5 py-4 font-medium text-stone-900">{service.nome}</td>
                      <td className="px-5 py-4 text-stone-600">{formatDuration(service.duracao_min)}</td>
                      <td className="px-5 py-4 text-stone-600">{formatCurrency(service.preco)}</td>
                      <td className="px-5 py-4 text-stone-600">{service.fotos_entregues}</td>
                      <td className="px-5 py-4"><StatusBadge active={service.ativo} /></td>
                      <td className="px-5 py-4"><CrudActions nome={`serviço ${service.nome}`} onEdit={() => openEdit(service)} onDelete={() => openDelete(service)} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            }
            mobile={
              <ul className="grid gap-3">
                {services.map((service) => (
                  <li key={service.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-stone-900">{service.nome}</h2>
                        <p className="mt-1 text-sm text-stone-600">{formatDuration(service.duracao_min)} · {service.fotos_entregues} fotos</p>
                      </div>
                      <StatusBadge active={service.ativo} />
                    </div>
                    {service.descricao && <p className="mt-3 text-sm leading-6 text-stone-600">{service.descricao}</p>}
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                      <span className="font-semibold text-stone-900">{formatCurrency(service.preco)}</span>
                      <CrudActions nome={`serviço ${service.nome}`} onEdit={() => openEdit(service)} onDelete={() => openDelete(service)} />
                    </div>
                  </li>
                ))}
              </ul>
            }
          />
        ) : null}
      </section>

      <Modal titulo={editor === "novo" ? "Novo serviço" : "Editar serviço"} open={editor !== null} onClose={() => setEditor(null)}>
        {editor !== null && (
          <ServiceForm
            key={editor === "novo" ? "novo" : editor.id}
            service={editor === "novo" ? undefined : editor}
            onSave={save}
            onCancel={() => setEditor(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        titulo="Excluir serviço"
        confirmLabel="Excluir serviço"
        error={deleteError ?? undefined}
        pending={deleting}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={confirmDelete}
      >
        {deleteTarget && <>Tem certeza de que deseja excluir <strong>{deleteTarget.nome}</strong>? Esta ação não pode ser desfeita.</>}
      </ConfirmDialog>
    </>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge className={active ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}
