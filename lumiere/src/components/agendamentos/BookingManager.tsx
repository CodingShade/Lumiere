"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteBooking, updateBooking } from "@/actions/bookings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/database";

export type BookingListItem = Booking & {
  services: { nome: string; duracao_min: number; preco: number } | null;
  locations: { nome: string; tipo: "estudio" | "externo"; endereco: string | null } | null;
  photographer: { profiles: { nome: string; telefone: string | null } | null } | null;
  client: { nome: string; telefone: string | null } | null;
};

const statusLabels: Record<BookingStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const classes: Record<BookingStatus, string> = {
    pendente: "bg-amber-100 text-amber-800",
    confirmado: "bg-emerald-100 text-emerald-800",
    cancelado: "bg-red-100 text-red-800",
    concluido: "bg-stone-200 text-stone-700",
  };
  return <Badge className={classes[status]}>{statusLabels[status]}</Badge>;
}

export function BookingManager({
  bookings,
  isAdmin = false,
}: {
  bookings: BookingListItem[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<BookingListItem | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function cancel() {
    if (!cancelTarget) return;
    setPending(true);
    setError(null);
    try {
      const result = await deleteBooking(cancelTarget.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setFeedback("Agendamento cancelado com sucesso.");
      setCancelTarget(null);
      router.refresh();
    } catch {
      setError("Não foi possível cancelar o agendamento.");
    } finally {
      setPending(false);
    }
  }

  async function changeStatus(booking: BookingListItem, status: BookingStatus) {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("status", status);
    try {
      const result = await updateBooking(booking.id, formData);
      if (!result.success) setError(result.error);
      else {
        setFeedback("Status atualizado.");
        router.refresh();
      }
    } catch {
      setError("Não foi possível atualizar o status.");
    } finally {
      setPending(false);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <p className="font-medium text-stone-900">Nenhum agendamento encontrado</p>
        <p className="mt-2 text-sm text-stone-600">Os novos ensaios solicitados aparecerão nesta área.</p>
      </div>
    );
  }

  return (
    <>
      {feedback && <Toast variant="success">{feedback}</Toast>}
      {error && <Toast variant="error">{error}</Toast>}
      <div className="grid gap-3">
        {bookings.map((booking) => {
          const photographerName = booking.photographer?.profiles?.nome ?? "Fotógrafo não informado";
          return (
            <article key={booking.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl text-stone-900">{booking.services?.nome ?? "Serviço"}</h2>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{formatDate(booking.starts_at)}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {photographerName} · {booking.locations?.nome ?? "Local"}
                    {booking.services ? ` · ${formatCurrency(booking.services.preco)}` : ""}
                  </p>
                  {isAdmin && booking.client && (
                    <p className="mt-1 text-sm text-stone-600">Cliente: {booking.client.nome}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin && (
                    <Select
                      aria-label={`Status do agendamento ${booking.id}`}
                      value={booking.status}
                      disabled={pending}
                      onChange={(event) => changeStatus(booking, event.target.value as BookingStatus)}
                      className="min-h-9 w-auto px-3"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  )}
                  <Link href={`/agendamentos/${booking.id}`}><Button type="button" variant="secondary" className="min-h-9 px-3 text-xs">Detalhes</Button></Link>
                  {booking.status !== "cancelado" && booking.status !== "concluido" && (
                    <Button type="button" variant="ghost" className="min-h-9 px-3 text-xs text-red-700" onClick={() => { setError(null); setCancelTarget(booking); }}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <ConfirmDialog
        open={cancelTarget !== null}
        titulo="Cancelar agendamento"
        confirmLabel="Cancelar agendamento"
        pendingLabel="Cancelando..."
        pending={pending}
        error={error ?? undefined}
        onCancel={() => { setCancelTarget(null); setError(null); }}
        onConfirm={cancel}
      >
        {cancelTarget ? <>Deseja cancelar o ensaio de <strong>{cancelTarget.services?.nome ?? "este serviço"}</strong> em {formatDate(cancelTarget.starts_at)}?</> : null}
      </ConfirmDialog>
    </>
  );
}
