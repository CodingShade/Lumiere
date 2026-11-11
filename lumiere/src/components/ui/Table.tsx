import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}
