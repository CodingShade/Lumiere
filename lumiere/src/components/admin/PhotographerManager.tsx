"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPhotographer, deletePhotographer, updatePhotographer, type PhotographerActionResult } from "@/actions/photographers";
import { createDemoPhotographers } from "@/actions/demo-photographers";
import type { PhotographerInput } from "@/lib/validations/photographer";
import type { PhotographerWithProfile, Profile } from "@/types/database";
import { PhotographerForm } from "@/components/forms/PhotographerForm";
import { CrudActions } from "@/components/crud/CrudActions";
import { CrudEmptyState } from "@/components/crud/CrudEmptyState";
import { CrudHeader } from "@/components/crud/CrudHeader";
import { ResponsiveCrudList } from "@/components/crud/ResponsiveCrudList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { Toast } from "@/components/ui/Toast";

type EditorState = "novo" | PhotographerWithProfile | null;
type Feedback = { variant: "success" | "error"; message: string };

function photographerFormData(values: PhotographerInput) {
  const formData = new FormData();
  formData.set("profile_id", values.profile_id);
  formData.set("especialidade", values.especialidade);
  formData.set("portfolio_url", values.portfolio_url ?? "");
  formData.set("ativo", String(values.ativo));
  return formData;
}

export function PhotographerManager({
  photographers,
  availableProfiles,
  canCreateDemo,
  loadError,
}: {
  photographers: PhotographerWithProfile[];
  availableProfiles: Profile[];
  canCreateDemo: boolean;
  loadError?: string;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhotographerWithProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  const [demoPending, setDemoPending] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function save(values: PhotographerInput): Promise<PhotographerActionResult> {
    const formData = photographerFormData(values);
    const result = editor === "novo"
      ? await createPhotographer(formData)
      : editor
        ? await updatePhotographer(editor.profile_id, formData)
        : { success: false as const, error: "Não foi possível identificar o fotógrafo." };

    if (result.success) {
      setFeedback({ variant: "success", message: editor === "novo" ? "Fotógrafo cadastrado com sucesso." : "Fotógrafo atualizado com sucesso." });
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
      const result = await deletePhotographer(deleteTarget.profile_id);
      if (result.success) {
        setFeedback({ variant: "success", message: "Fotógrafo excluído. O perfil voltou a ser de cliente." });
        setDeleteTarget(null);
        router.refresh();
        return;
      }
      setDeleteError(result.error);
    } catch {
      setDeleteError("Não foi possível excluir o fotógrafo. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmCreateDemo() {
    setDemoPending(true);
    setDemoError(null);
    try {
      const result = await createDemoPhotographers();
      if (!result.success) {
        setDemoError(result.error);
        return;
      }

      const { created, alreadyPresent, failures } = result.data;
      const summary = [
        `${created} conta(s) criada(s)`,
        `${alreadyPresent} fotógrafo(s) já existente(s) atualizado(s)`,
      ].join("; ");
      setFeedback({
        variant: failures.length > 0 ? "error" : "success",
        message: failures.length > 0
          ? `${summary}. Não concluído: ${failures.join(" ")}`
          : `${summary}. Nenhum e-mail foi enviado.`,
      });
      setDemoDialogOpen(false);
      router.refresh();
    } catch {
      setDemoError("Não foi possível criar os fotógrafos de demonstração. Tente novamente.");
    } finally {
      setDemoPending(false);
    }
  }

  const openCreate = () => { setFeedback(null); setEditor("novo"); };
  const openDemoDialog = () => {
    setFeedback(null);
    setDemoError(null);
    setDemoDialogOpen(true);
  };
  const openEdit = (photographer: PhotographerWithProfile) => { setFeedback(null); setEditor(photographer); };
  const openDelete = (photographer: PhotographerWithProfile) => {
    setFeedback(null);
    setDeleteError(null);
    setDeleteTarget(photographer);
  };

  return (
    <>
      <section className="grid gap-5">
        <div>
          <p className="text-sm text-stone-600">Gerencie os fotógrafos vinculados aos perfis de usuário.</p>
        </div>
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <CrudHeader count={photographers.length} singular="fotógrafo cadastrado" plural="fotógrafos cadastrados" createLabel="Novo fotógrafo" onCreate={openCreate} />
          <Button type="button" variant="secondary" disabled={!canCreateDemo} onClick={openDemoDialog}>
            Criar 3 fotógrafos de exemplo
          </Button>
        </div>
        {!canCreateDemo && (
          <Toast variant="info">
            Configure SUPABASE_SERVICE_ROLE_KEY no servidor para habilitar a criação de contas de demonstração.
          </Toast>
        )}
        {feedback && <Toast variant={feedback.variant}>{feedback.message}</Toast>}
        {loadError && <Toast variant="error">{loadError}</Toast>}

        {!loadError && photographers.length === 0 ? (
          <CrudEmptyState
            titulo="Nenhum fotógrafo cadastrado"
            descricao="Vincule um perfil de cliente para cadastrar o primeiro fotógrafo."
            createLabel="Novo fotógrafo"
            onCreate={openCreate}
          />
        ) : photographers.length > 0 ? (
          <ResponsiveCrudList
            desktop={
              <Table>
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Nome</th>
                    <th scope="col" className="px-5 py-3">Telefone</th>
                    <th scope="col" className="px-5 py-3">Especialidade</th>
                    <th scope="col" className="px-5 py-3">Portfólio</th>
                    <th scope="col" className="px-5 py-3">Status</th>
                    <th scope="col" className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {photographers.map((photographer) => (
                    <tr key={photographer.profile_id} className="hover:bg-stone-50/70">
                      <td className="px-5 py-4 font-medium text-stone-900">{photographer.profiles.nome}</td>
                      <td className="px-5 py-4 text-stone-600">{photographer.profiles.telefone || "—"}</td>
                      <td className="px-5 py-4 text-stone-600">{photographer.especialidade || "—"}</td>
                      <td className="px-5 py-4 text-stone-600">
                        {photographer.portfolio_url
                          ? <a href={photographer.portfolio_url} target="_blank" rel="noreferrer" className="text-[#a9583b] underline">Abrir portfólio</a>
                          : "—"}
                      </td>
                      <td className="px-5 py-4"><StatusBadge active={photographer.ativo} /></td>
                      <td className="px-5 py-4"><CrudActions nome={`fotógrafo ${photographer.profiles.nome}`} onEdit={() => openEdit(photographer)} onDelete={() => openDelete(photographer)} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            }
            mobile={
              <ul className="grid gap-3">
                {photographers.map((photographer) => (
                  <li key={photographer.profile_id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-stone-900">{photographer.profiles.nome}</h2>
                        <p className="mt-1 text-sm text-stone-600">{photographer.profiles.telefone || "Telefone não informado"}</p>
                      </div>
                      <StatusBadge active={photographer.ativo} />
                    </div>
                    <p className="mt-3 text-sm text-stone-600">{photographer.especialidade || "Especialidade não informada"}</p>
                    {photographer.portfolio_url && (
                      <a href={photographer.portfolio_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-[#a9583b] underline">Abrir portfólio</a>
                    )}
                    <div className="mt-4 border-t border-stone-100 pt-3">
                      <CrudActions nome={`fotógrafo ${photographer.profiles.nome}`} onEdit={() => openEdit(photographer)} onDelete={() => openDelete(photographer)} />
                    </div>
                  </li>
                ))}
              </ul>
            }
          />
        ) : null}
      </section>

      <Modal titulo={editor === "novo" ? "Novo fotógrafo" : "Editar fotógrafo"} open={editor !== null} onClose={() => setEditor(null)}>
        {editor !== null && (
          <PhotographerForm
            key={editor === "novo" ? "novo" : editor.profile_id}
            photographer={editor === "novo" ? undefined : editor}
            availableProfiles={availableProfiles}
            onSave={save}
            onCancel={() => setEditor(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        titulo="Excluir fotógrafo"
        confirmLabel="Excluir fotógrafo"
        error={deleteError ?? undefined}
        pending={deleting}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={confirmDelete}
      >
        {deleteTarget && <>Tem certeza de que deseja excluir <strong>{deleteTarget.profiles.nome}</strong>? O perfil voltará a ser de cliente.</>}
      </ConfirmDialog>

      <ConfirmDialog
        open={demoDialogOpen}
        titulo="Criar fotógrafos de demonstração"
        confirmLabel="Criar 3 fotógrafos"
        pendingLabel="Criando..."
        intent="primary"
        error={demoError ?? undefined}
        pending={demoPending}
        onCancel={() => { setDemoDialogOpen(false); setDemoError(null); }}
        onConfirm={confirmCreateDemo}
      >
        Serão criadas três contas de demonstração com e-mail marcado como confirmado e senha aleatória. Nenhuma mensagem será enviada; as contas não poderão entrar no sistema até que uma senha seja definida.
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
