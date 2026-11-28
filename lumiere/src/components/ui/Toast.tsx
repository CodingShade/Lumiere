import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode; variant?: "success" | "error" | "info"; className?: string };

export function Toast({ children, variant = "error", className }: Props) {
  const isError = variant === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : variant === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900",
        className,
      )}
    >
      {children}
    </p>
  );
}
