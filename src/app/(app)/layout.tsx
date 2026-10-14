import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
