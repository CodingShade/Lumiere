import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { role } = await getCurrentUser();
  return (
    <>
      <Navbar role={role} />
      {children}
    </>
  );
}
