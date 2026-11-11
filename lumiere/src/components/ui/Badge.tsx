import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode; className?: string };

export function Badge({ children, className }: Props) {
  return (
    <span className={cn("inline-flex rounded-full bg-[#f7e9e3] px-3 py-1 text-xs font-medium text-[#8f4d36]", className)}>
      {children}
    </span>
  );
}
