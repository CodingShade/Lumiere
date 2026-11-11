import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { role } = await getCurrentUser();
  return (
    <>
      <Navbar role={role} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-5 py-8">
        {role && <Sidebar role={role} />}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
