import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode; variant?: "success" | "error"; className?: string };

export function Toast({ children, variant = "error", className }: Props) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
        className,
      )}
    >
      {children}
    </p>
  );
}
