"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Props = {
  titulo: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ titulo, open, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      const focusTarget = dialog.querySelector<HTMLElement>("[data-autofocus]")
        ?? dialog.querySelector<HTMLElement>("input, textarea, select, button");
      focusTarget?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-950/50"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-serif text-3xl">{titulo}</h2>
          <button
            type="button"
            aria-label="Fechar janela"
            onClick={() => dialogRef.current?.close()}
            className="rounded-full px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-[#bd6948]"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
