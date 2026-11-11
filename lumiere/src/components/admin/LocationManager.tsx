"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLocation, deleteLocation, updateLocation, type LocationActionResult } from "@/actions/locations";
import type { Location } from "@/types/database";
import type { LocationInput } from "@/lib/validations/location";
import { LocationForm } from "@/components/forms/LocationForm";
import { CrudActions } from "@/components/crud/CrudActions";
import { CrudEmptyState } from "@/components/crud/CrudEmptyState";
import { CrudHeader } from "@/components/crud/CrudHeader";
import { ResponsiveCrudList } from "@/components/crud/ResponsiveCrudList";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";

type EditorState = "novo" | Location | null;
type Feedback = { variant: "success" | "error"; message: string };

function locationFormData(values: LocationInput) {
  const formData = new FormData();
  formData.set("nome", values.nome);
  formData.set("endereco", values.endereco);
  formData.set("tipo", values.tipo);
  formData.set("ativo", String(values.ativo));
  return formData;
}

export function LocationManager({ locations, loadError }: { locations: Location[]; loadError?: string }) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function save(values: LocationInput): Promise<LocationActionResult> {
    const formData = locationFormData(values);
    const result = editor === "novo"
      ? await createLocation(formData)
      : editor
        ? await updateLocation(editor.id, formData)
        : { success: false as const, error: "Não foi possível identificar o local." };

    if (result.success) {
      setFeedback({ variant: "success", message: editor === "novo" ? "Local criado com sucesso." : "Local atualizado com sucesso." });
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
      const result = await deleteLocation(deleteTarget.id);
      if (result.success) {
        setFeedback({ variant: "success", message: "Local excluído com sucesso." });
        setDeleteTarget(null);
        router.refresh();
        return;
      }
      setDeleteError(result.error);
    } catch {
      setDeleteError("Não foi possível excluir o local. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  const openCreate = () => { setFeedback(null); setEditor("novo"); };
  const openEdit = (location: Location) => { setFeedback(null); setEditor(location); };
  const openDelete = (location: Location) => {
    setFeedback(null);
    setDeleteError(null);
    setDeleteTarget(location);
  };

  return (
    <>
      <section className="grid gap-5">
        <div>
          <p className="text-sm text-stone-600">Gerencie estúdios e locais externos disponíveis para os ensaios.</p>
        </div>
        <CrudHeader count={locations.length} singular="local cadastrado" plural="locais cadastrados" createLabel="Novo local" onCreate={openCreate} />
        {feedback && <Toast variant={feedback.variant}>{feedback.message}</Toast>}
        {loadError && <Toast variant="error">{loadError}</Toast>}

        {!loadError && locations.length === 0 ? (
          <CrudEmptyState
            titulo="Nenhum local cadastrado"
            descricao="Cadastre o primeiro local para disponibilizá-lo nos agendamentos."
            createLabel="Novo local"
            onCreate={openCreate}
          />
        ) : locations.length > 0 ? (
          <ResponsiveCrudList
            desktop={
              <Table>
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Nome</th>
                    <th scope="col" className="px-5 py-3">Tipo</th>
                    <th scope="col" className="px-5 py-3">Endereço</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-stone-50/70">
                      <td className="px-5 py-4 font-medium text-stone-900">{location.nome}</td>
                      <td className="px-5 py-4"><LocationTypeBadge type={location.tipo} /></td>
                      <td className="px-5 py-4 text-stone-600">{location.endereco || "—"}</td>
                      <td className="px-5 py-4"><StatusBadge active={location.ativo} /></td>
                      <td className="px-5 py-4"><CrudActions nome={`local ${location.nome}`} onEdit={() => openEdit(location)} onDelete={() => openDelete(location)} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            }
            mobile={
              <ul className="grid gap-3">
                {locations.map((location) => (
                  <li key={location.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-stone-900">{location.nome}</h2>
                        <p className="mt-1 text-sm text-stone-600">{location.endereco || "Endereço não informado"}</p>
                      </div>
                      <StatusBadge active={location.ativo} />
                    </div>
                    <div className="mt-3"><LocationTypeBadge type={location.tipo} /></div>
                    <div className="mt-4 border-t border-stone-100 pt-3">
                      <CrudActions nome={`local ${location.nome}`} onEdit={() => openEdit(location)} onDelete={() => openDelete(location)} />
                    </div>
                  </li>
                ))}
              </ul>
            }
          />
        ) : null}
      </section>

      <Modal titulo={editor === "novo" ? "Novo local" : "Editar local"} open={editor !== null} onClose={() => setEditor(null)}>
        {editor !== null && (
          <LocationForm
            key={editor === "novo" ? "novo" : editor.id}
            location={editor === "novo" ? undefined : editor}
            onSave={save}
            onCancel={() => setEditor(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        titulo="Excluir local"
        confirmLabel="Excluir local"
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

function LocationTypeBadge({ type }: { type: Location["tipo"] }) {
  return <Badge>{type === "estudio" ? "Estúdio" : "Externo"}</Badge>;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge className={active ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}
