"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Toast } from "./Toast";

type Props = {
  open: boolean;
  titulo: string;
  children: ReactNode;
  error?: string;
  confirmLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  titulo,
  children,
  error,
  confirmLabel = "Excluir",
  pending = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal titulo={titulo} open={open} onClose={onCancel}>
      <p className="text-sm leading-6 text-stone-600">{children}</p>
      {error && <Toast variant="error" className="mt-4">{error}</Toast>}
      <div className="mt-7 flex justify-end gap-3">
        <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={pending}
          className="bg-red-700 hover:bg-red-800"
          onClick={onConfirm}
        >
          {pending ? "Excluindo..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
